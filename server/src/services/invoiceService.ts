import type { Knex } from "knex";
import type { InvoiceLineItemRow, InvoiceRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import {
  assertDarajaInitiationAllowed,
  darajaConfig,
} from "../config/daraja.js";
import { AppError } from "../utils/AppError.js";
import { createDarajaCallbackProcessor } from "./darajaCallbackProcessor.js";
import { createDarajaClient } from "./darajaClient.js";
import { createPaymentAttemptInitiator } from "./paymentAttemptService.js";
import { toPublicInvoiceView } from "./publicInvoiceView.js";

const darajaClient = createDarajaClient(darajaConfig);

type InvoicePaymentAttemptRow = {
  id: string;
  invoice_id: string;
  checkout_request_id: string | null;
  legacy_reference: string | null;
  status:
    | "initiating"
    | "dispatching"
    | "pending"
    | "verification_pending"
    | "succeeded"
    | "failed"
    | "cancelled"
    | "manually_reconciled"
    | "legacy_unverified";
  expected_amount: string;
  currency: string;
  provider_receipt: string | null;
  created_at: string;
  updated_at: string;
};

const activePaymentAttemptStatuses = [
  "initiating",
  "dispatching",
  "pending",
  "verification_pending",
  "legacy_unverified",
] as const;

export async function listInvoices() {
  const invoices = await db<InvoiceRow>("invoices")
    .select("*")
    .orderBy("invoice_no", "desc");
  return attachLineItems(invoices);
}

export async function createInvoice(payload: {
  invoice_no?: string;
  client_name: string;
  phone: string;
  amount?: number;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
}) {
  const invoiceNo = payload.invoice_no ?? generateInvoiceNumber();
  return db.transaction(async (trx) => {
    const computedAmount =
      computeLineItemTotal(payload.line_items) ?? payload.amount ?? 0;
    const [created] = await trx<InvoiceRow>("invoices")
      .insert({
        invoice_no: invoiceNo,
        client_name: payload.client_name,
        phone: payload.phone,
        amount: computedAmount.toFixed(2),
        status: "unpaid",
      })
      .returning("*");

    if (payload.line_items?.length) {
      await trx<InvoiceLineItemRow>("invoice_line_items").insert(
        payload.line_items.map((item) => ({
          invoice_id: created.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price.toFixed(2),
        })),
      );
    } else if (payload.amount) {
      await trx<InvoiceLineItemRow>("invoice_line_items").insert({
        invoice_id: created.id,
        description: "Photography services",
        quantity: 1,
        unit_price: payload.amount.toFixed(2),
      });
    }

    return attachLineItemsToInvoice(created, trx);
  });
}

export async function updateInvoice(
  id: string,
  payload: Partial<{
    invoice_no: string;
    client_name: string;
    phone: string;
    amount: number;
    line_items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
    }>;
  }>,
) {
  return db.transaction(async (trx) => {
    if ("status" in payload || "mpesa_ref" in payload) {
      throw new AppError(
        400,
        "Financial status and payment references require audited reconciliation",
        "INVOICE_FINANCIAL_EDIT_FORBIDDEN",
      );
    }
    const existing = await trx<InvoiceRow>("invoices")
      .where({ id })
      .forUpdate()
      .first();
    if (!existing) {
      throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
    }
    const computedAmount = computeLineItemTotal(payload.line_items);
    const { line_items: _lineItems, amount, ...invoicePayload } = payload;
    const requestedAmount = computedAmount ?? amount;
    const hasPaymentHistory = await trx<InvoicePaymentAttemptRow>(
      "invoice_payment_attempts",
    )
      .where({ invoice_id: id })
      .first();
    const hasFinancialEvidence = Boolean(
      hasPaymentHistory || existing.mpesa_ref || existing.status === "paid",
    );
    if (
      hasFinancialEvidence &&
      (Object.hasOwn(payload, "invoice_no") ||
        Object.hasOwn(payload, "line_items"))
    ) {
      throw new AppError(
        409,
        "Invoice number and billed line items are frozen after payment evidence exists",
        "PAYMENT_HISTORY_PRESERVED",
      );
    }
    if (
      requestedAmount !== undefined &&
      requestedAmount.toFixed(2) !== Number(existing.amount).toFixed(2)
    ) {
      if (hasFinancialEvidence) {
        throw new AppError(
          409,
          "Invoice amount cannot change after payment evidence exists",
          "PAYMENT_HISTORY_PRESERVED",
        );
      }
    }
    const updatePayload = {
      ...invoicePayload,
      amount:
        computedAmount === undefined
          ? amount === undefined
            ? undefined
            : amount.toFixed(2)
          : computedAmount.toFixed(2),
    };

    const [updated] = await trx<InvoiceRow>("invoices")
      .where({ id })
      .update(updatePayload)
      .returning("*");
    if (!updated) {
      throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
    }

    if (payload.line_items) {
      await trx<InvoiceLineItemRow>("invoice_line_items")
        .where({ invoice_id: id })
        .delete();
      if (payload.line_items.length) {
        await trx<InvoiceLineItemRow>("invoice_line_items").insert(
          payload.line_items.map((item) => ({
            invoice_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price.toFixed(2),
          })),
        );
      }
    }

    return attachLineItemsToInvoice(updated, trx);
  });
}

export async function deleteInvoice(id: string) {
  return db.transaction(async (trx) => {
    const invoice = await trx<InvoiceRow>("invoices")
      .where({ id })
      .forUpdate()
      .first();
    if (!invoice) {
      throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
    }
    const hasAttempts = await trx<InvoicePaymentAttemptRow>(
      "invoice_payment_attempts",
    )
      .where({ invoice_id: id })
      .first();
    if (
      hasAttempts ||
      invoice.mpesa_ref ||
      invoice.status === "paid"
    ) {
      throw new AppError(
        409,
        "Invoice with payment history cannot be deleted",
        "INVOICE_PAYMENT_HISTORY_PRESERVED",
      );
    }
    await trx<InvoiceRow>("invoices").where({ id }).delete();
  });
}

export async function getInvoicePaymentHistory(invoiceId: string) {
  const invoice = await db<InvoiceRow>("invoices").where({ id: invoiceId }).first();
  if (!invoice) {
    throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
  }
  const attempts = await db<InvoicePaymentAttemptRow>("invoice_payment_attempts")
    .where({ invoice_id: invoiceId })
    .orderBy("created_at", "desc");
  const reconciliations = await db("invoice_payment_reconciliations")
    .where({ invoice_id: invoiceId })
    .orderBy("created_at", "desc");
  return { attempts, reconciliations };
}

export async function reconcileInvoicePayment(
  invoiceId: string,
  input: {
    attemptId: string;
    outcome: "paid" | "failed";
    reason: string;
    evidenceReference: string;
    actorEmail: string;
  },
) {
  if (!input.actorEmail) {
    throw new AppError(401, "Admin session required", "AUTH_REQUIRED");
  }
  return db.transaction(async (trx) => {
    const invoice = await trx<InvoiceRow>("invoices")
      .where({ id: invoiceId })
      .forUpdate()
      .first();
    if (!invoice) {
      throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
    }
    const attempt = await trx<InvoicePaymentAttemptRow>("invoice_payment_attempts")
      .where({ id: input.attemptId, invoice_id: invoiceId })
      .forUpdate()
      .first();
    if (!attempt) {
      throw new AppError(404, "Payment attempt not found", "PAYMENT_ATTEMPT_NOT_FOUND");
    }
    if (!activePaymentAttemptStatuses.includes(attempt.status as (typeof activePaymentAttemptStatuses)[number])) {
      throw new AppError(409, "Payment attempt is already resolved", "PAYMENT_ATTEMPT_RESOLVED");
    }
    if (attempt.status === "dispatching") {
      throw new AppError(
        409,
        "Provider initiation may still be in flight; keep this attempt quarantined",
        "PAYMENT_ATTEMPT_INITIATION_IN_FLIGHT",
      );
    }
    const anotherActiveAttempt = await trx<InvoicePaymentAttemptRow>("invoice_payment_attempts")
      .where({ invoice_id: invoiceId })
      .whereIn("status", [...activePaymentAttemptStatuses])
      .whereNot({ id: attempt.id })
      .first();
    if (anotherActiveAttempt || invoice.status === "paid") {
      throw new AppError(409, "Invoice payment state requires review", "PAYMENT_RECONCILIATION_CONFLICT");
    }

    const nextInvoiceStatus = input.outcome;
    await trx("invoice_payment_reconciliations").insert({
      invoice_id: invoiceId,
      payment_attempt_id: attempt.id,
      actor_email: input.actorEmail,
      previous_invoice_status: invoice.status,
      new_invoice_status: nextInvoiceStatus,
      previous_attempt_status: attempt.status,
      new_attempt_status: "manually_reconciled",
      reason: input.reason,
      evidence_reference: input.evidenceReference,
    });
    await trx<InvoicePaymentAttemptRow>("invoice_payment_attempts")
      .where({ id: attempt.id })
      .update({ status: "manually_reconciled", updated_at: trx.fn.now() });
    const [updated] = await trx<InvoiceRow>("invoices")
      .where({ id: invoiceId })
      .update({
        status: nextInvoiceStatus,
        paid_at: input.outcome === "paid" ? trx.fn.now() : null,
      })
      .returning("*");
    return updated;
  });
}

export async function findInvoiceByNumber(invoiceNo: string) {
  const invoice = await db<InvoiceRow>("invoices")
    .where({ invoice_no: invoiceNo })
    .first();
  if (!invoice) {
    throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
  }
  return toPublicInvoiceView(await attachLineItemsToInvoice(invoice, db));
}

export async function findInvoiceById(id: string) {
  const invoice = await db<InvoiceRow>("invoices").where({ id }).first();
  if (!invoice) {
    throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
  }
  return attachLineItemsToInvoice(invoice, db);
}

export async function getInvoiceStatus(id: string) {
  const invoice = await findInvoiceById(id);
  return {
    status: invoice.status,
  };
}

export async function startInvoicePayment(id: string, phone: string) {
  const payment = createPaymentAttemptInitiator<{
    attempt: InvoicePaymentAttemptRow;
    invoice: InvoiceRow;
  }>({
    assertInitiationAllowed: () => assertDarajaInitiationAllowed(darajaConfig),
    reserve: async (invoiceId) =>
      db.transaction(async (trx) => {
        const invoice = await trx<InvoiceRow>("invoices")
          .where({ id: invoiceId })
          .forUpdate()
          .first();
        if (!invoice) {
          throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
        }
        if (invoice.status === "paid") {
          throw new AppError(
            409,
            "Invoice is already paid",
            "INVOICE_ALREADY_PAID",
          );
        }

        const activeAttempt = await trx<InvoicePaymentAttemptRow>(
          "invoice_payment_attempts",
        )
          .where({ invoice_id: invoiceId })
          .whereIn("status", [...activePaymentAttemptStatuses])
          .orderBy("created_at", "desc")
          .first();
        if (activeAttempt) {
          return { attempt: { attempt: activeAttempt, invoice }, created: false };
        }

        // mpesa_ref predates the attempt ledger and may be either a checkout ID
        // or a receipt. Preserve and quarantine a newly observed legacy value;
        // never treat it as proof or start another prompt around it.
        if (invoice.mpesa_ref) {
          const knownReference = await trx<InvoicePaymentAttemptRow>(
            "invoice_payment_attempts",
          )
            .where({ invoice_id: invoiceId })
            .andWhere((query) =>
              query
                .where({ legacy_reference: invoice.mpesa_ref })
                .orWhere({ checkout_request_id: invoice.mpesa_ref })
                .orWhere({ provider_receipt: invoice.mpesa_ref }),
            )
            .first();
          if (!knownReference) {
            const [legacyAttempt] = await trx<InvoicePaymentAttemptRow>(
              "invoice_payment_attempts",
            )
              .insert({
                invoice_id: invoiceId,
                legacy_reference: invoice.mpesa_ref,
                status: "legacy_unverified",
                expected_amount: Math.ceil(Number(invoice.amount)).toFixed(2),
                currency: "KES",
              })
              .returning("*");
            return {
              attempt: { attempt: legacyAttempt, invoice },
              created: false,
            };
          }
        }

        if (invoice.status === "failed") {
          await trx<InvoiceRow>("invoices")
            .where({ id: invoiceId })
            .update({ status: "unpaid" });
          invoice.status = "unpaid";
        }

        const [attempt] = await trx<InvoicePaymentAttemptRow>(
          "invoice_payment_attempts",
        )
          .insert({
            invoice_id: invoiceId,
            status: "initiating",
            expected_amount: Math.ceil(Number(invoice.amount)).toFixed(2),
            currency: "KES",
          })
          .returning("*");
        return { attempt: { attempt, invoice }, created: true };
      }),
    getCheckoutRequestId: (reserved) => reserved.attempt.checkout_request_id,
    getAttemptState: (reserved) =>
      reserved.attempt.status === "initiating"
        ? "initiating"
        : reserved.attempt.status === "dispatching" ||
            reserved.attempt.status === "legacy_unverified" ||
            reserved.attempt.status === "verification_pending"
          ? "verification_pending"
          : "pending",
    getAttemptId: (reserved) => reserved.attempt.id,
    markDispatching: async (attemptId) => {
      const [updated] = await db<InvoicePaymentAttemptRow>(
        "invoice_payment_attempts",
      )
        .where({ id: attemptId, status: "initiating" })
        .update({ status: "dispatching", updated_at: db.fn.now() })
        .returning("id");
      if (!updated) {
        throw new AppError(
          409,
          "Payment reservation was resolved before provider dispatch",
          "PAYMENT_ATTEMPT_RESOLVED",
        );
      }
    },
    startProviderRequest: async (reserved, requestedPhone) => {
      try {
        return await darajaClient.startStkPush({
          amount: Number(reserved.attempt.expected_amount),
          phone: requestedPhone,
          invoiceNo: reserved.invoice.invoice_no,
        });
      } catch (error) {
        // Only an authentication failure is known to happen before the STK
        // request is sent. Every other error remains quarantined as uncertain.
        if (error instanceof AppError && error.code === "DARAJA_AUTH_FAILED") {
          await db<InvoicePaymentAttemptRow>("invoice_payment_attempts")
            .where({ id: reserved.attempt.id, status: "dispatching" })
            .update({ status: "failed", updated_at: db.fn.now() });
        }
        throw error;
      }
    },
    saveCheckoutRequestId: async (attemptId, checkoutRequestId) => {
      const [updated] = await db<InvoicePaymentAttemptRow>(
        "invoice_payment_attempts",
      )
        .where({ id: attemptId, status: "dispatching" })
        .update({
          checkout_request_id: checkoutRequestId,
          status: "pending",
          updated_at: db.fn.now(),
        })
        .returning("id");
      if (!updated) {
        throw new AppError(
          409,
          "Payment attempt could not be finalized; reconcile before retrying",
          "PAYMENT_ATTEMPT_RECONCILIATION_REQUIRED",
        );
      }
      console.info(`[Daraja] STK Push attempt ${attemptId} is pending`);
    },
  });

  const result = await payment(id, phone);
  return { invoice_id: id, ...result };
}

const processVerifiedDarajaCallback = createDarajaCallbackProcessor<
  {
    attempt: InvoicePaymentAttemptRow;
    invoice: InvoiceRow;
    checkoutRequestId: string;
  },
  InvoiceRow
>({
  findPayment: async (checkoutRequestId) => {
    const attempt = await db<InvoicePaymentAttemptRow>(
      "invoice_payment_attempts",
    )
      .where({ checkout_request_id: checkoutRequestId })
      .first();
    if (!attempt) return null;
    const invoice = await db<InvoiceRow>("invoices")
      .where({ id: attempt.invoice_id })
      .first();
    return invoice ? { attempt, invoice, checkoutRequestId } : null;
  },
  getExpectedPayment: ({ attempt, checkoutRequestId }) => ({
    id: attempt.invoice_id,
    amount: attempt.expected_amount,
    checkoutRequestId,
  }),
  // Daraja's documented Transaction Status API is asynchronous and requires
  // an M-Pesa receipt or originator conversation ID plus initiator credentials.
  // This STK integration has neither a documented STK query contract nor those
  // credentials, so callbacks remain unverified and cannot change invoice state.
  verifyPayment: async () => null,
  persistVerifiedPayment: async ({ attempt, invoice }, verified) =>
    db.transaction(async (trx) => {
      const currentInvoice = await trx<InvoiceRow>("invoices")
        .where({ id: invoice.id })
        .forUpdate()
        .first();
      const currentAttempt = await trx<InvoicePaymentAttemptRow>(
        "invoice_payment_attempts",
      )
        .where({ id: attempt.id })
        .forUpdate()
        .first();
      if (!currentInvoice || !currentAttempt) return null;

      if (verified.status === "paid") {
        if (
          currentAttempt.status === "succeeded" ||
          currentAttempt.status === "cancelled" ||
          currentAttempt.status === "manually_reconciled" ||
          currentAttempt.status === "legacy_unverified"
        ) {
          return null;
        }
        await trx<InvoicePaymentAttemptRow>("invoice_payment_attempts")
          .where({ id: attempt.id })
          .update({
            status: "succeeded",
            provider_receipt: verified.receipt!,
            updated_at: trx.fn.now(),
          });
        if (currentInvoice.status === "paid") return null;
        const [updatedInvoice] = await trx<InvoiceRow>("invoices")
          .where({ id: currentInvoice.id })
          .whereNot({ status: "paid" })
          .update({
            status: "paid",
            mpesa_ref: verified.receipt!,
            paid_at: trx.fn.now(),
          })
          .returning("*");
        return updatedInvoice ?? null;
      }

      if (
        currentAttempt.status !== "initiating" &&
        currentAttempt.status !== "pending" &&
        currentAttempt.status !== "verification_pending"
      ) {
        return null;
      }
      await trx<InvoicePaymentAttemptRow>("invoice_payment_attempts")
        .where({ id: attempt.id })
        .update({ status: "failed", updated_at: trx.fn.now() });
      const otherActiveAttempt = await trx<InvoicePaymentAttemptRow>(
        "invoice_payment_attempts",
      )
        .where({ invoice_id: invoice.id })
        .whereIn("status", [...activePaymentAttemptStatuses])
        .first();
      if (!otherActiveAttempt && currentInvoice.status !== "paid") {
        await trx<InvoiceRow>("invoices")
          .where({ id: invoice.id })
          .whereNot({ status: "paid" })
          .update({ status: "failed", paid_at: null });
      }
      return null;
    }),
});

export async function applyDarajaCallback(
  payload:
    | {
        Body?: {
          stkCallback?: {
            ResultCode?: number;
            CheckoutRequestID?: string;
          };
        };
      }
    | undefined,
) {
  if (!payload) {
    throw new AppError(
      400,
      "Missing Daraja callback payload",
      "INVALID_DARAJA_CALLBACK",
    );
  }

  const callback = payload.Body?.stkCallback;

  if (!callback?.CheckoutRequestID) {
    throw new AppError(
      400,
      "Invalid Daraja callback payload",
      "INVALID_DARAJA_CALLBACK",
    );
  }
  const updated = await processVerifiedDarajaCallback(payload);
  if (!updated) {
    console.warn(
      "[Daraja] Callback verification is unavailable or did not match; invoice state unchanged",
    );
  }
  return updated;
}

function generateInvoiceNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `INV-${stamp}-${suffix}`;
}

function computeLineItemTotal(
  lineItems?: Array<{ quantity: number; unit_price: number }>,
) {
  if (!lineItems) {
    return undefined;
  }
  return lineItems.reduce(
    (total, item) => total + item.quantity * item.unit_price,
    0,
  );
}

async function attachLineItems(invoices: InvoiceRow[]) {
  return Promise.all(
    invoices.map((invoice) => attachLineItemsToInvoice(invoice, db)),
  );
}

async function attachLineItemsToInvoice(invoice: InvoiceRow, connection: Knex) {
  const lineItems = await connection<InvoiceLineItemRow>("invoice_line_items")
    .select("*")
    .where({ invoice_id: invoice.id })
    .orderBy("created_at", "asc");

  return {
    ...invoice,
    line_items: lineItems,
  };
}
