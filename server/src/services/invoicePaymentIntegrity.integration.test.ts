import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { invoicePatchSchema } from "../routes/schemas.js";

const databaseUrl = process.env.PAYMENT_TEST_DATABASE_URL;
const redisUrl = process.env.REDIS_URL;
let parsedDatabaseUrl: URL | undefined;
let parsedRedisUrl: URL | undefined;
try {
  if (databaseUrl) parsedDatabaseUrl = new URL(databaseUrl);
} catch {
  // Invalid opt-in values are treated as disabled below.
}
try {
  if (redisUrl) parsedRedisUrl = new URL(redisUrl);
} catch {
  // Invalid opt-in values are treated as disabled below.
}
const safeTestDatabase = Boolean(
  parsedDatabaseUrl &&
    ["localhost", "127.0.0.1"].includes(parsedDatabaseUrl.hostname) &&
    (parsedDatabaseUrl.port === "" || parsedDatabaseUrl.port === "5432") &&
    process.env.PAYMENT_TEST_DATABASE_DISPOSABLE === "1" &&
    process.env.PAYMENT_TEST_REDIS_DISPOSABLE === "1" &&
    parsedDatabaseUrl.pathname === "/photography_platform_test" &&
    !/neon/i.test(databaseUrl ?? "") &&
  parsedRedisUrl &&
    ["localhost", "127.0.0.1"].includes(parsedRedisUrl.hostname) &&
    (parsedRedisUrl.port === "" || parsedRedisUrl.port === "6379") &&
    ["redis:", "rediss:"].includes(parsedRedisUrl.protocol),
);

if (!safeTestDatabase || !databaseUrl) {
  describe("PostgreSQL invoice payment integrity", { skip: "Set PAYMENT_TEST_DATABASE_URL to the isolated local photography_platform_test database" }, () => {
    it("requires an explicitly isolated PostgreSQL test database", () => {});
  });
} else {
  process.env.DATABASE_URL = databaseUrl;
  process.env.NODE_ENV = "test";
  process.env.CLIENT_ORIGIN = "http://localhost:5173";
  process.env.DARAJA_ENV = "sandbox";
  process.env.DARAJA_PRODUCTION_INITIATION_ENABLED = "false";
  process.env.DARAJA_CONSUMER_KEY = "integration-test-key";
  process.env.DARAJA_CONSUMER_SECRET = "integration-test-secret";
  process.env.DARAJA_PASSKEY = "integration-test-passkey";
  process.env.DARAJA_SHORTCODE = "174379";
  process.env.DARAJA_CALLBACK_URL = "http://localhost:4000/webhooks/daraja";

  let providerMode: "success" | "malformed" | "timeout" | "hold" | "auth-failure" | "rejected" = "success";
  let providerGate: Promise<void> | null = null;
  let releaseProvider: (() => void) | null = null;
  let providerDispatched: (() => void) | null = null;
  const createdInvoiceIds: string[] = [];
  const providerUrls: string[] = [];
  const mockedFetch: typeof fetch = async (input) => {
    const url = String(input);
    providerUrls.push(url);
    if (!url.startsWith("https://sandbox.safaricom.co.ke/")) {
      throw new Error(`Unexpected non-sandbox provider request: ${url}`);
    }
    if (url.includes("/oauth/")) {
      return new Response(JSON.stringify(providerMode === "auth-failure" ? {} : { access_token: "integration-token" }), {
        status: providerMode === "auth-failure" ? 401 : 200,
        headers: { "content-type": "application/json" },
      });
    }
    if (providerMode === "timeout") throw new Error("simulated network timeout");
    if (providerMode === "hold") {
      providerDispatched?.();
      await providerGate;
    }
    if (providerMode === "rejected") {
      return new Response(JSON.stringify({ ResponseCode: "1" }), { status: 400 });
    }
    return new Response(
      JSON.stringify(
        providerMode === "success"
          ? { CheckoutRequestID: `ws_CO_${randomUUID()}` }
          : { ResponseCode: "0" },
      ),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockedFetch;

  const { db } = await import("../db/knex.js");
  const {
    applyDarajaCallback,
    createInvoice,
    deleteInvoice,
    reconcileInvoicePayment,
    startInvoicePayment,
    updateInvoice,
  } = await import("./invoiceService.js");
  let apiServer: Server | undefined;
  let apiBaseUrl = "";
  let createAdminSession: typeof import("../services/sessionService.js").createSession;
  let destroyAdminSession: typeof import("../services/sessionService.js").destroySession;
  let redisClient: typeof import("../config/redis.js").redis | undefined;
  let adminCookieName = "studio_admin_session";
  globalThis.fetch = originalFetch;
  before(async () => {
    const result = await db.raw(
      "select current_database() as name, inet_server_addr()::text as address",
    );
    assert.equal(result.rows?.[0]?.name, "photography_platform_test");
    assert.ok(result.rows?.[0]?.address, "database must be a TCP local disposable service");
    const [{ createApp }, sessionService, { redis }, { env }] = await Promise.all([
      import("../app.js"),
      import("../services/sessionService.js"),
      import("../config/redis.js"),
      import("../config/env.js"),
    ]);
    assert.equal(new URL(env.REDIS_URL).hostname, parsedRedisUrl?.hostname);
    assert.equal(await redis.ping(), "PONG");
    redisClient = redis;
    createAdminSession = sessionService.createSession;
    destroyAdminSession = sessionService.destroySession;
    adminCookieName = env.SESSION_COOKIE_NAME;
    apiServer = createApp(async () => ({
      ok: true,
      services: { postgres: { ok: true }, redis: { ok: true } },
    })).listen(0, "127.0.0.1");
    await once(apiServer, "listening");
    apiBaseUrl = `http://127.0.0.1:${(apiServer.address() as AddressInfo).port}`;
  });
  after(async () => {
    try {
      if (apiServer?.listening) {
        apiServer.close();
        await once(apiServer, "close");
      }
      if (createdInvoiceIds.length) {
        const ids = createdInvoiceIds;
        await db.raw("alter table invoice_payment_reconciliations disable trigger user");
        try {
          await db("invoice_payment_reconciliations").whereIn("invoice_id", ids).delete();
          await db("invoice_payment_attempts").whereIn("invoice_id", ids).delete();
          await db("invoice_line_items").whereIn("invoice_id", ids).delete();
          await db("invoices").whereIn("id", ids).delete();
        } finally {
          await db.raw("alter table invoice_payment_reconciliations enable trigger user");
        }
      }
    } finally {
      try {
        if (redisClient) await redisClient.quit();
      } finally {
        await db.destroy();
      }
    }
  });

  async function makeInvoice() {
    const suffix = randomUUID();
    const invoice = await createInvoice({
      invoice_no: `INTEGRITY-${suffix}`,
      client_name: "Integrity Test",
      phone: "+254712345678",
      amount: 1250,
    });
    createdInvoiceIds.push(invoice.id);
    return invoice;
  }

  async function makeAttempt(
    invoiceId: string,
    status:
      | "initiating"
      | "dispatching"
      | "pending"
      | "verification_pending"
      | "legacy_unverified"
      | "succeeded"
      | "failed"
      | "cancelled",
    checkoutRequestId: string | null = null,
  ) {
    const [attempt] = await db("invoice_payment_attempts")
      .insert({
        invoice_id: invoiceId,
        status,
        checkout_request_id: checkoutRequestId,
        expected_amount: "1250.00",
        currency: "KES",
      })
      .returning("*");
    return attempt as { id: string; status: string };
  }

  async function apiRequest(path: string, init: RequestInit = {}) {
    return fetch(`${apiBaseUrl}${path}`, init);
  }

  describe("PostgreSQL invoice payment integrity", () => {
    it("enforces session, Origin, CSRF, validation and state conflicts on the real payment routes", async () => {
      const invoice = await makeInvoice();
      const attempt = await makeAttempt(invoice.id, "pending");
      const historyPath = `/admin/invoices/${invoice.id}/payment-history`;
      const reconcilePath = `/admin/invoices/${invoice.id}/reconcile`;
      assert.equal((await apiRequest(historyPath)).status, 401);
      assert.equal((await apiRequest(reconcilePath, { method: "POST" })).status, 401);

      const session = await createAdminSession("admin@example.com");
      const cookie = `${adminCookieName}=${session.sessionId}`;
      try {
        const read = await apiRequest(historyPath, {
          headers: { Cookie: cookie, Origin: "http://localhost:5173" },
        });
        assert.equal(read.status, 200);
        assert.match(read.headers.get("cache-control") ?? "", /no-store/i);

        for (const headers of [
          { Cookie: cookie, Origin: "http://localhost:5173" },
          { Cookie: cookie, Origin: "http://localhost:5173", "X-CSRF-Token": "invalid" },
          { Cookie: cookie, Origin: "https://unapproved.example", "X-CSRF-Token": session.csrfToken },
        ]) {
          assert.equal(
            (await apiRequest(reconcilePath, {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({ attempt_id: attempt.id, outcome: "failed", reason: "Owner verified a terminal failure.", evidence_reference: "evidence-123" }),
            })).status,
            403,
          );
        }

        const invalid = await apiRequest(reconcilePath, {
          method: "POST",
          headers: {
            Cookie: cookie,
            Origin: "http://localhost:5173",
            "X-CSRF-Token": session.csrfToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attempt_id: attempt.id, outcome: "paid", reason: "short", evidence_reference: "x" }),
        });
        assert.equal(invalid.status, 400);

        const accepted = await apiRequest(reconcilePath, {
          method: "POST",
          headers: {
            Cookie: cookie,
            Origin: "http://localhost:5173",
            "X-CSRF-Token": session.csrfToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attempt_id: attempt.id, outcome: "failed", reason: "Owner verified a terminal failure.", evidence_reference: "evidence-123" }),
        });
        assert.equal(accepted.status, 200);
        assert.equal((await apiRequest(reconcilePath, {
          method: "POST",
          headers: {
            Cookie: cookie,
            Origin: "http://localhost:5173",
            "X-CSRF-Token": session.csrfToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ attempt_id: attempt.id, outcome: "failed", reason: "Owner verified a terminal failure.", evidence_reference: "evidence-456" }),
        })).status, 409);
      } finally {
        await destroyAdminSession(session.sessionId);
      }
    });

    it("prevents deletion when any attempt state or legacy invoice reference exists", async () => {
      for (const status of [
        "initiating",
        "pending",
        "verification_pending",
        "legacy_unverified",
        "succeeded",
        "failed",
        "manually_reconciled",
      ] as const) {
        const invoice = await makeInvoice();
        await makeAttempt(invoice.id, status === "manually_reconciled" ? "failed" : status);
        if (status === "manually_reconciled") {
          await db("invoice_payment_attempts")
            .where({ invoice_id: invoice.id })
            .update({ status });
        }
        await assert.rejects(deleteInvoice(invoice.id), {
          code: "INVOICE_PAYMENT_HISTORY_PRESERVED",
        });
        if (status === "pending") {
          await assert.rejects(db("invoices").where({ id: invoice.id }).delete(), {
            code: "23503",
          });
          await assert.rejects(
            db("invoice_payment_attempts").insert({
              invoice_id: invoice.id,
              status: "initiating",
              expected_amount: "1250.00",
              currency: "KES",
            }),
            { code: "23505" },
          );
        }
      }

      const referencedInvoice = await makeInvoice();
      await db("invoices")
        .where({ id: referencedInvoice.id })
        .update({ mpesa_ref: `historical-${randomUUID()}` });
      await assert.rejects(deleteInvoice(referencedInvoice.id), {
        code: "INVOICE_PAYMENT_HISTORY_PRESERVED",
      });
      const paidInvoice = await makeInvoice();
      await db("invoices").where({ id: paidInvoice.id }).update({ status: "paid" });
      await assert.rejects(deleteInvoice(paidInvoice.id), {
        code: "INVOICE_PAYMENT_HISTORY_PRESERVED",
      });
    });

    it("allows deletion only for an unpaid invoice without payment evidence", async () => {
      const invoice = await makeInvoice();
      await deleteInvoice(invoice.id);
      assert.equal(await db("invoices").where({ id: invoice.id }).first(), undefined);
    });

    it("refuses financial-history migration rollback without dropping empty or populated tables", async () => {
      const attemptMigration = await import("../db/migrations/014_invoice_payment_attempts.js");
      const reconciliationMigration = await import("../db/migrations/015_invoice_payment_reconciliation.js");

      const emptyInvoice = await makeInvoice();
      await assert.rejects(attemptMigration.down(db), /Forward-only financial-history migration/);
      await assert.rejects(reconciliationMigration.down(db), /Forward-only financial-history migration/);
      assert.equal(await db.schema.hasTable("invoice_payment_attempts"), true);
      assert.equal(await db("invoice_payment_attempts").where({ invoice_id: emptyInvoice.id }).count("id").first().then((row) => Number(row?.count)), 0);

      const populatedInvoice = await makeInvoice();
      const attempt = await makeAttempt(populatedInvoice.id, "pending");
      await db("invoice_payment_reconciliations").insert({
        invoice_id: populatedInvoice.id,
        payment_attempt_id: attempt.id,
        actor_email: "admin@example.com",
        previous_invoice_status: "unpaid",
        new_invoice_status: "failed",
        previous_attempt_status: "pending",
        new_attempt_status: "manually_reconciled",
        reason: "Owner-approved historical record for rollback protection test.",
        evidence_reference: `rollback-${randomUUID()}`,
      });
      await assert.rejects(attemptMigration.down(db), /Forward-only financial-history migration/);
      await assert.rejects(reconciliationMigration.down(db), /Forward-only financial-history migration/);
      assert.equal(await db("invoice_payment_attempts").where({ id: attempt.id }).first().then((row) => row?.status), "pending");
      assert.equal(await db("invoice_payment_reconciliations").where({ payment_attempt_id: attempt.id }).count("id").first().then((row) => Number(row?.count)), 1);
    });

    it("serializes deletion with reservation and preserves an attempt inserted under the invoice lock", async () => {
      const invoice = await makeInvoice();
      const reservation = await db.transaction();
      try {
        await reservation("invoices").where({ id: invoice.id }).forUpdate().first();
        await reservation("invoice_payment_attempts").insert({
          invoice_id: invoice.id,
          status: "initiating",
          expected_amount: "1250.00",
          currency: "KES",
        });
        const deletion = deleteInvoice(invoice.id);
        await reservation.commit();
        await assert.rejects(deletion, { code: "INVOICE_PAYMENT_HISTORY_PRESERVED" });
      } catch (error) {
        if (!reservation.isCompleted()) await reservation.rollback();
        throw error;
      }
    });

    it("rejects generic financial edits and preserves the invoice amount after attempts exist", async () => {
      const invoice = await makeInvoice();
      await assert.rejects(
        updateInvoice(invoice.id, { status: "paid" } as never),
        { code: "INVOICE_FINANCIAL_EDIT_FORBIDDEN" },
      );
      await assert.rejects(
        updateInvoice(invoice.id, { mpesa_ref: "manual" } as never),
        { code: "INVOICE_FINANCIAL_EDIT_FORBIDDEN" },
      );
      assert.equal(invoicePatchSchema.safeParse({ status: "failed" }).success, false);

      await makeAttempt(invoice.id, "failed");
      await assert.rejects(
        updateInvoice(invoice.id, { amount: 1251 }),
        { code: "PAYMENT_HISTORY_PRESERVED" },
      );
      await updateInvoice(invoice.id, { client_name: "Corrected client name" });
      await assert.rejects(
        updateInvoice(invoice.id, { invoice_no: `CHANGED-${randomUUID()}` }),
        { code: "PAYMENT_HISTORY_PRESERVED" },
      );
      await assert.rejects(
        updateInvoice(invoice.id, {
          line_items: [{ description: "Rewritten service", quantity: 1, unit_price: 1250 }],
        }),
        { code: "PAYMENT_HISTORY_PRESERVED" },
      );
      await assert.rejects(deleteInvoice(invoice.id), {
        code: "INVOICE_PAYMENT_HISTORY_PRESERVED",
      });
    });

    it("keeps a legacy reference blocking after unrelated edits", async () => {
      const invoice = await makeInvoice();
      await db("invoices")
        .where({ id: invoice.id })
        .update({ mpesa_ref: `legacy-${randomUUID()}` });
      await updateInvoice(invoice.id, { client_name: "Corrected client name" });
      const before = providerUrls.length;
      const result = await startInvoicePayment(invoice.id, "+254712345678");
      const [attempt] = await db("invoice_payment_attempts").where({ invoice_id: invoice.id });
      assert.equal(attempt.status, "legacy_unverified");
      assert.equal(result.attempt_status, "verification_pending");
      assert.equal(providerUrls.length, before);
    });

    it("atomically records manual reconciliation and refuses audit updates or deletes", async () => {
      const invoice = await makeInvoice();
      const checkoutId = `ws_CO_${randomUUID()}`;
      const attempt = await makeAttempt(invoice.id, "legacy_unverified", checkoutId);
      await reconcileInvoicePayment(invoice.id, {
        attemptId: attempt.id,
        outcome: "paid",
        reason: "Matched the settlement record to the customer invoice.",
        evidenceReference: `settlement-${randomUUID()}`,
        actorEmail: "admin@example.com",
      });
      const reconciledInvoice = await db("invoices").where({ id: invoice.id }).first();
      const reconciledAttempt = await db("invoice_payment_attempts").where({ id: attempt.id }).first();
      const [audit] = await db("invoice_payment_reconciliations").where({ invoice_id: invoice.id });
      assert.equal(reconciledInvoice.status, "paid");
      assert.equal(reconciledAttempt.status, "manually_reconciled");
      assert.equal(audit.actor_email, "admin@example.com");
      assert.equal(audit.previous_invoice_status, "unpaid");
      assert.equal(audit.new_invoice_status, "paid");
      assert.equal(audit.previous_attempt_status, "legacy_unverified");
      assert.equal(audit.new_attempt_status, "manually_reconciled");
      await assert.rejects(
        db("invoice_payment_reconciliations").where({ id: audit.id }).update({ reason: "rewritten" }),
      );
      await assert.rejects(db("invoice_payment_reconciliations").where({ id: audit.id }).delete());
      assert.equal(await applyDarajaCallback({ Body: { stkCallback: { CheckoutRequestID: checkoutId, ResultCode: 0 } } }), null);
      assert.equal((await db("invoices").where({ id: invoice.id }).first()).status, "paid");
    });

    it("rolls back the audit and attempt transition if the invoice transition fails", async () => {
      const invoice = await makeInvoice();
      const attempt = await makeAttempt(invoice.id, "pending");
      await db.raw(`
        create function fail_test_invoice_reconciliation() returns trigger language plpgsql as $$
        begin
          if old.id = '${invoice.id}'::uuid then
            raise exception 'simulated invoice transition failure';
          end if;
          return new;
        end $$;
        create trigger fail_test_invoice_reconciliation before update on invoices
        for each row execute function fail_test_invoice_reconciliation();
      `);
      try {
        await assert.rejects(
          reconcileInvoicePayment(invoice.id, {
            attemptId: attempt.id,
            outcome: "failed",
            reason: "Verified external settlement evidence shows no payment.",
            evidenceReference: `evidence-${randomUUID()}`,
            actorEmail: "admin@example.com",
          }),
        );
      } finally {
        await db.raw("drop trigger if exists fail_test_invoice_reconciliation on invoices");
        await db.raw("drop function if exists fail_test_invoice_reconciliation()");
      }
      assert.equal((await db("invoices").where({ id: invoice.id }).first()).status, "unpaid");
      assert.equal((await db("invoice_payment_attempts").where({ id: attempt.id }).first()).status, "pending");
      assert.equal(await db("invoice_payment_reconciliations").where({ invoice_id: invoice.id }).count("id").first().then((row) => Number(row?.count)), 0);
    });

    it("acknowledges duplicate and conflicting callbacks without changing unresolved state", async () => {
      const invoice = await makeInvoice();
      const checkoutId = `ws_CO_${randomUUID()}`;
      const attempt = await makeAttempt(invoice.id, "pending", checkoutId);
      for (const resultCode of [0, 1, 0]) {
        assert.equal(
          await applyDarajaCallback({
            Body: { stkCallback: { CheckoutRequestID: checkoutId, ResultCode: resultCode } },
          }),
          null,
        );
      }
      assert.equal((await db("invoices").where({ id: invoice.id }).first()).status, "unpaid");
      assert.equal((await db("invoice_payment_attempts").where({ id: attempt.id }).first()).status, "pending");
    });

    it("reuses a single concurrent reservation and never calls a live provider host", async () => {
      const invoice = await makeInvoice();
      providerMode = "success";
      const before = providerUrls.length;
      const results = await Promise.all([
        startInvoicePayment(invoice.id, "+254712345678"),
        startInvoicePayment(invoice.id, "+254712345678"),
      ]);
      const attempts = await db("invoice_payment_attempts").where({ invoice_id: invoice.id });
      assert.equal(attempts.length, 1);
      assert.equal(providerUrls.slice(before).filter((url) => url.includes("processrequest")).length, 1);
      assert.ok(providerUrls.slice(before).every((url) => url.startsWith("https://sandbox.safaricom.co.ke/")));
      assert.equal(results.filter((result) => result.checkout_request_id).length, 1);
    });

    it("quarantines an in-flight provider request from reconciliation and retries", async () => {
      const invoice = await makeInvoice();
      providerMode = "hold";
      providerGate = new Promise<void>((resolve) => {
        releaseProvider = resolve;
      });
      const dispatchPromise = new Promise<void>((resolve) => {
        providerDispatched = resolve;
      });
      const before = providerUrls.length;
      const firstRequest = startInvoicePayment(invoice.id, "+254712345678");
      await dispatchPromise;
      const [attempt] = await db("invoice_payment_attempts").where({ invoice_id: invoice.id });
      assert.equal(attempt.status, "dispatching");
      await assert.rejects(
        reconcileInvoicePayment(invoice.id, {
          attemptId: attempt.id,
          outcome: "failed",
          reason: "The provider request has not reached a known terminal state.",
          evidenceReference: `review-${randomUUID()}`,
          actorEmail: "admin@example.com",
        }),
        { code: "PAYMENT_ATTEMPT_INITIATION_IN_FLIGHT" },
      );
      const secondRequest = await startInvoicePayment(invoice.id, "+254712345678");
      assert.equal(secondRequest.attempt_status, "verification_pending");
      assert.equal(providerUrls.slice(before).filter((url) => url.includes("processrequest")).length, 1);

      releaseProvider?.();
      await firstRequest;
      assert.equal((await db("invoice_payment_attempts").where({ id: attempt.id }).first()).status, "pending");
      providerMode = "success";
      providerGate = null;
      providerDispatched = null;
      releaseProvider = null;
    });

    it("keeps malformed, timed-out, and checkout-persistence failures unresolved and blocks retries", async () => {
      for (const mode of ["malformed", "timeout", "rejected"] as const) {
        const invoice = await makeInvoice();
        providerMode = mode;
        const before = providerUrls.length;
        await assert.rejects(startInvoicePayment(invoice.id, "+254712345678"), {
          code: "DARAJA_STK_OUTCOME_UNKNOWN",
        });
        const [attempt] = await db("invoice_payment_attempts").where({ invoice_id: invoice.id });
        assert.equal(attempt.status, "dispatching");
        await startInvoicePayment(invoice.id, "+254712345678");
        assert.equal(providerUrls.slice(before).filter((url) => url.includes("processrequest")).length, 1);
      }

      const invoice = await makeInvoice();
      const [attempt] = await db("invoice_payment_attempts")
        .insert({ invoice_id: invoice.id, status: "initiating", expected_amount: "1250.00", currency: "KES" })
        .returning("*");
      await db.raw(`
        create function fail_test_checkout_persist() returns trigger language plpgsql as $$
        begin
          if new.id = '${attempt.id}'::uuid and new.status = 'pending' then
            raise exception 'simulated checkout persistence failure';
          end if;
          return new;
        end $$;
        create trigger fail_test_checkout_persist before update on invoice_payment_attempts
        for each row execute function fail_test_checkout_persist();
      `);
      try {
        providerMode = "success";
        const before = providerUrls.length;
        await assert.rejects(startInvoicePayment(invoice.id, "+254712345678"));
        assert.equal((await db("invoice_payment_attempts").where({ id: attempt.id }).first()).status, "dispatching");
        await startInvoicePayment(invoice.id, "+254712345678");
        assert.equal(providerUrls.slice(before).filter((url) => url.includes("processrequest")).length, 1);
      } finally {
        await db.raw("drop trigger if exists fail_test_checkout_persist on invoice_payment_attempts");
        await db.raw("drop function if exists fail_test_checkout_persist()");
      }
    });

    it("releases only a known pre-STK authentication failure for safe retry", async () => {
      const invoice = await makeInvoice();
      providerMode = "auth-failure";
      await assert.rejects(startInvoicePayment(invoice.id, "+254712345678"), {
        code: "DARAJA_AUTH_FAILED",
      });
      const [failedAttempt] = await db("invoice_payment_attempts").where({ invoice_id: invoice.id });
      assert.equal(failedAttempt.status, "failed");

      providerMode = "success";
      await startInvoicePayment(invoice.id, "+254712345678");
      const attempts = await db("invoice_payment_attempts").where({ invoice_id: invoice.id }).orderBy("created_at", "asc");
      assert.equal(attempts.length, 2);
      assert.equal(attempts[0].status, "failed");
      assert.equal(attempts[1].status, "pending");
    });
  });
}
