import { Buffer } from "node:buffer";
import type { Knex } from "knex";
import type { InvoiceLineItemRow, InvoiceRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import { darajaConfig } from "../config/daraja.js";
import { AppError } from "../utils/AppError.js";

type DarajaCallbackItem = {
  Name: string;
  Value?: string | number;
};

type DarajaCallbackBody = {
  Body?: {
    stkCallback?: {
      ResultCode: number;
      CheckoutRequestID?: string;
      CallbackMetadata?: {
        Item?: DarajaCallbackItem[];
      };
    };
  };
};

export async function listInvoices() {
  const invoices = await db<InvoiceRow>("invoices").select("*").orderBy("invoice_no", "desc");
  return attachLineItems(invoices);
}

export async function createInvoice(payload: {
  invoice_no?: string;
  client_name: string;
  phone: string;
  amount?: number;
  line_items?: Array<{ description: string; quantity: number; unit_price: number }>;
}) {
  const invoiceNo = payload.invoice_no ?? generateInvoiceNumber();
  return db.transaction(async (trx) => {
    const computedAmount = computeLineItemTotal(payload.line_items) ?? payload.amount ?? 0;
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
    status: InvoiceRow["status"];
    mpesa_ref: string | null;
    line_items: Array<{ description: string; quantity: number; unit_price: number }>;
  }>,
) {
  return db.transaction(async (trx) => {
    const computedAmount = computeLineItemTotal(payload.line_items);
    const { line_items: _lineItems, amount, ...invoicePayload } = payload;
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
      await trx<InvoiceLineItemRow>("invoice_line_items").where({ invoice_id: id }).delete();
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
  const deleted = await db<InvoiceRow>("invoices").where({ id }).delete();
  if (!deleted) {
    throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
  }
}

export async function findInvoiceByNumber(invoiceNo: string) {
  const invoice = await db<InvoiceRow>("invoices").where({ invoice_no: invoiceNo }).first();
  if (!invoice) {
    throw new AppError(404, "Invoice not found", "INVOICE_NOT_FOUND");
  }
  return attachLineItemsToInvoice(invoice, db);
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
    id: invoice.id,
    invoice_no: invoice.invoice_no,
    status: invoice.status,
    mpesa_ref: invoice.mpesa_ref,
    paid_at: invoice.paid_at,
  };
}

export async function startInvoicePayment(id: string, phone: string) {
  const invoice = await findInvoiceById(id);
  if (invoice.status === "paid") {
    throw new AppError(409, "Invoice is already paid", "INVOICE_ALREADY_PAID");
  }

  const token = await getDarajaAccessToken();
  const timestamp = getDarajaTimestamp();
  const password = Buffer.from(
    `${darajaConfig.shortcode}${darajaConfig.passkey}${timestamp}`,
  ).toString("base64");

  const response = await fetch(`${darajaConfig.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: darajaConfig.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(Number(invoice.amount)),
      PartyA: normalizePhone(phone),
      PartyB: darajaConfig.shortcode,
      PhoneNumber: normalizePhone(phone),
      CallBackURL: darajaConfig.callbackUrl,
      AccountReference: invoice.invoice_no,
      TransactionDesc: `Payment for ${invoice.invoice_no}`,
    }),
  });

  if (!response.ok) {
    throw new AppError(502, "M-Pesa payment request failed", "DARAJA_STK_FAILED");
  }

  const data = (await response.json()) as { CheckoutRequestID?: string };
  if (data.CheckoutRequestID) {
    await db<InvoiceRow>("invoices").where({ id }).update({ mpesa_ref: data.CheckoutRequestID });
  }

  return {
    invoice_id: id,
    checkout_request_id: data.CheckoutRequestID ?? null,
    status: "pending",
  };
}

export async function applyDarajaCallback(payload: DarajaCallbackBody) {
  const callback = payload.Body?.stkCallback;
  if (!callback?.CheckoutRequestID) {
    throw new AppError(400, "Invalid Daraja callback payload", "INVALID_DARAJA_CALLBACK");
  }

  const metadata = callback.CallbackMetadata?.Item ?? [];
  const receipt = metadata.find((item) => item.Name === "MpesaReceiptNumber")?.Value;
  const isPaid = callback.ResultCode === 0;

  const [updated] = await db<InvoiceRow>("invoices")
    .where({ mpesa_ref: callback.CheckoutRequestID })
    .update({
      status: isPaid ? "paid" : "failed",
      mpesa_ref: isPaid && receipt ? String(receipt) : callback.CheckoutRequestID,
      paid_at: isPaid ? db.fn.now() : null,
    })
    .returning("*");

  if (!updated) {
    throw new AppError(404, "Matching invoice payment was not found", "INVOICE_PAYMENT_NOT_FOUND");
  }

  return updated;
}

function generateInvoiceNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `INV-${stamp}-${suffix}`;
}

async function getDarajaAccessToken() {
  const credentials = Buffer.from(
    `${darajaConfig.consumerKey}:${darajaConfig.consumerSecret}`,
  ).toString("base64");
  const response = await fetch(
    `${darajaConfig.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    },
  );

  if (!response.ok) {
    throw new AppError(502, "Could not authenticate with Daraja", "DARAJA_AUTH_FAILED");
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new AppError(502, "Daraja did not return an access token", "DARAJA_AUTH_FAILED");
  }
  return data.access_token;
}

function getDarajaTimestamp() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `254${digits.slice(1)}`;
  }
  if (digits.startsWith("254")) {
    return digits;
  }
  return digits;
}

function computeLineItemTotal(
  lineItems?: Array<{ quantity: number; unit_price: number }>,
) {
  if (!lineItems) {
    return undefined;
  }
  return lineItems.reduce((total, item) => total + item.quantity * item.unit_price, 0);
}

async function attachLineItems(invoices: InvoiceRow[]) {
  return Promise.all(invoices.map((invoice) => attachLineItemsToInvoice(invoice, db)));
}

async function attachLineItemsToInvoice(
  invoice: InvoiceRow,
  connection: Knex,
) {
  const lineItems = await connection<InvoiceLineItemRow>("invoice_line_items")
    .select("*")
    .where({ invoice_id: invoice.id })
    .orderBy("created_at", "asc");

  return {
    ...invoice,
    line_items: lineItems,
  };
}
