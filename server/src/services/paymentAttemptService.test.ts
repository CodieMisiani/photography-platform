import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPaymentAttemptInitiator } from "./paymentAttemptService.js";

type Attempt = {
  id: string;
  invoiceId: string;
  status:
    | "initiating"
    | "dispatching"
    | "pending"
    | "verification_pending"
    | "legacy_unverified"
    | "failed";
  checkoutRequestId: string | null;
};

function createHarness() {
  const attempts: Attempt[] = [];
  let invoicePaid = false;
  let providerCalls = 0;
  let failProvider = false;
  let failSave = false;
  const start = createPaymentAttemptInitiator<Attempt>({
    assertInitiationAllowed: () => {},
    reserve: async (invoiceId) => {
      if (invoicePaid) throw new Error("INVOICE_ALREADY_PAID");
      const active = attempts.find(
        (attempt) =>
          attempt.invoiceId === invoiceId &&
          (attempt.status === "initiating" ||
            attempt.status === "dispatching" ||
            attempt.status === "pending" ||
            attempt.status === "verification_pending" ||
            attempt.status === "legacy_unverified"),
      );
      if (active) return { attempt: active, created: false };
      const attempt: Attempt = {
        id: `attempt-${attempts.length + 1}`,
        invoiceId,
        status: "initiating",
        checkoutRequestId: null,
      };
      attempts.push(attempt);
      return { attempt, created: true };
    },
    getCheckoutRequestId: (attempt) => attempt.checkoutRequestId,
    getAttemptState: (attempt) =>
      attempt.status === "initiating"
        ? "initiating"
        : attempt.status === "dispatching" ||
            attempt.status === "legacy_unverified" ||
            attempt.status === "verification_pending"
          ? "verification_pending"
          : "pending",
    getAttemptId: (attempt) => attempt.id,
    markDispatching: async (id) => {
      const attempt = attempts.find((item) => item.id === id);
      if (!attempt || attempt.status !== "initiating") {
        throw new Error("attempt was already resolved");
      }
      attempt.status = "dispatching";
    },
    startProviderRequest: async (attempt) => {
      providerCalls += 1;
      if (failProvider) throw new Error("ambiguous provider outcome");
      return `checkout-${attempt.id}`;
    },
    saveCheckoutRequestId: async (id, checkoutRequestId) => {
      if (failSave) throw new Error("database unavailable");
      const attempt = attempts.find((item) => item.id === id)!;
      attempt.checkoutRequestId = checkoutRequestId;
      attempt.status = "pending";
    },
  });
  return {
    start,
    attempts,
    set invoicePaid(value: boolean) {
      invoicePaid = value;
    },
    set failProvider(value: boolean) {
      failProvider = value;
    },
    set failSave(value: boolean) {
      failSave = value;
    },
    get providerCalls() {
      return providerCalls;
    },
  };
}

describe("payment attempt initiation policy", () => {
  it("creates and persists the first attempt before returning its checkout ID", async () => {
    const harness = createHarness();
    const result = await harness.start("invoice-1", "+254712345678");
    assert.deepEqual(result, {
      checkout_request_id: "checkout-attempt-1",
      status: "pending",
      attempt_status: "pending",
    });
    assert.equal(harness.attempts.length, 1);
    assert.equal(harness.attempts[0].status, "pending");
    assert.equal(harness.providerCalls, 1);
  });

  it("reuses a pending attempt instead of creating another prompt", async () => {
    const harness = createHarness();
    const first = await harness.start("invoice-1", "0712345678");
    const second = await harness.start("invoice-1", "0712345678");
    assert.deepEqual(second, first);
    assert.equal(harness.attempts.length, 1);
    assert.equal(harness.providerCalls, 1);
  });

  it("serializes concurrent requests through the reservation and sends once", async () => {
    const harness = createHarness();
    const [first, second] = await Promise.all([
      harness.start("invoice-1", "0712345678"),
      harness.start("invoice-1", "0712345678"),
    ]);
    assert.equal(harness.attempts.length, 1);
    assert.equal(harness.providerCalls, 1);
    assert.equal(first.checkout_request_id, "checkout-attempt-1");
    assert.equal(second.checkout_request_id, null);
    assert.equal(second.attempt_status, "verification_pending");
  });

  it("does not retry an ambiguous provider outcome and keeps the attempt active", async () => {
    const harness = createHarness();
    harness.failProvider = true;
    await assert.rejects(harness.start("invoice-1", "0712345678"));
    harness.failProvider = false;
    const retry = await harness.start("invoice-1", "0712345678");
    assert.equal(retry.checkout_request_id, null);
    assert.equal(retry.attempt_status, "verification_pending");
    assert.equal(harness.attempts.length, 1);
    assert.equal(harness.attempts[0].status, "dispatching");
    assert.equal(harness.providerCalls, 1);
  });

  it("does not initiate if reservation fails and retains an attempt if checkout persistence fails", async () => {
    const harness = createHarness();
    harness.invoicePaid = true;
    await assert.rejects(harness.start("invoice-1", "0712345678"));
    assert.equal(harness.providerCalls, 0);

    harness.invoicePaid = false;
    harness.failSave = true;
    await assert.rejects(harness.start("invoice-1", "0712345678"));
    harness.failSave = false;
    await harness.start("invoice-1", "0712345678");
    assert.equal(harness.attempts.length, 1);
    assert.equal(harness.attempts[0].status, "dispatching");
    assert.equal(harness.providerCalls, 1);
  });

  it("permits a fresh attempt after a terminal failure without replacing history", async () => {
    const harness = createHarness();
    await harness.start("invoice-1", "0712345678");
    harness.attempts[0].status = "failed";
    const second = await harness.start("invoice-1", "0712345678");
    assert.equal(harness.attempts.length, 2);
    assert.equal(harness.attempts[0].checkoutRequestId, "checkout-attempt-1");
    assert.equal(second.checkout_request_id, "checkout-attempt-2");
    assert.equal(harness.providerCalls, 2);
  });

  it("keeps attempts for different invoices separate", async () => {
    const harness = createHarness();
    await harness.start("invoice-1", "0712345678");
    await harness.start("invoice-2", "0712345678");
    assert.equal(harness.attempts.length, 2);
    assert.deepEqual(
      harness.attempts.map((attempt) => attempt.invoiceId),
      ["invoice-1", "invoice-2"],
    );
    assert.equal(harness.attempts[0].checkoutRequestId, "checkout-attempt-1");
    assert.equal(harness.attempts[1].checkoutRequestId, "checkout-attempt-2");
  });

  it("does not send a prompt for a legacy reference that needs reconciliation", async () => {
    const harness = createHarness();
    harness.attempts.push({
      id: "legacy-attempt",
      invoiceId: "invoice-1",
      status: "legacy_unverified",
      checkoutRequestId: null,
    });
    const result = await harness.start("invoice-1", "0712345678");
    assert.equal(result.attempt_status, "verification_pending");
    assert.equal(result.checkout_request_id, null);
    assert.equal(harness.providerCalls, 0);
  });
});
