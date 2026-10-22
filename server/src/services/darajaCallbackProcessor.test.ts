import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDarajaCallbackProcessor,
  type CallbackPayment,
  type VerifiedDarajaPayment,
} from "./darajaCallbackProcessor.js";

type StoredPayment = CallbackPayment & {
  status: "unpaid" | "paid" | "failed";
  receipt: string | null;
};

const checkoutRequestId = "ws_CO_test_checkout_123";
const callback = (id = checkoutRequestId, resultCode = 0) => ({
  Body: { stkCallback: { CheckoutRequestID: id, ResultCode: resultCode } },
});

function createHarness(
  verifyPayment: (
    id: string,
    payment: CallbackPayment,
  ) => Promise<VerifiedDarajaPayment | null>,
) {
  const state: StoredPayment = {
    id: "invoice-1",
    amount: "100.00",
    checkoutRequestId,
    status: "unpaid",
    receipt: null,
  };
  let writes = 0;
  const process = createDarajaCallbackProcessor<StoredPayment, StoredPayment>({
    findPayment: async (id) =>
      state.checkoutRequestId === id ? state : null,
    getExpectedPayment: ({ id, amount, checkoutRequestId: ref }) => ({
      id,
      amount,
      checkoutRequestId: ref,
    }),
    verifyPayment,
    persistVerifiedPayment: async (payment, verified) => {
      if (verified.status === "pending") return null;
      if (state.status === "paid" || state.status === "failed") return null;
      writes += 1;
      state.status = verified.status;
      state.receipt = verified.receipt ?? null;
      if (verified.status === "paid") state.checkoutRequestId = verified.receipt!;
      return payment;
    },
  });
  return { process, state, get writes() { return writes; } };
}

describe("Daraja callback verification gate", () => {
  it("does not apply a forged success callback when provider verification fails", async () => {
    const harness = createHarness(async () => null);
    assert.equal(await harness.process(callback()), null);
    assert.equal(harness.state.status, "unpaid");
    assert.equal(harness.writes, 0);
  });

  it("does not apply an unverified failure or cancellation callback", async () => {
    const harness = createHarness(async () => null);
    assert.equal(await harness.process(callback(checkoutRequestId, 1032)), null);
    assert.equal(harness.state.status, "unpaid");
    assert.equal(harness.writes, 0);
  });

  it("does not apply an unknown or mismatched checkout request", async () => {
    const harness = createHarness(async (id) => ({
      checkoutRequestId: `${id}-other`,
      status: "paid",
      amount: 100,
      receipt: "QWER123456",
    }));
    assert.equal(await harness.process(callback("unknown-checkout")), null);
    assert.equal(await harness.process(callback()), null);
    assert.equal(harness.state.status, "unpaid");
    assert.equal(harness.writes, 0);
  });

  it("resolves each checkout ID to its own attempt when an invoice has history", async () => {
    const attempts = [
      { ...createHarness(async () => null).state, checkoutRequestId: "checkout-old" },
      { ...createHarness(async () => null).state, checkoutRequestId: "checkout-new" },
    ];
    const writes: string[] = [];
    const process = createDarajaCallbackProcessor({
      findPayment: async (id) => attempts.find((attempt) => attempt.checkoutRequestId === id) ?? null,
      getExpectedPayment: (payment) => payment,
      verifyPayment: async (id) => ({
        checkoutRequestId: id,
        status: "paid" as const,
        amount: 100,
        receipt: `receipt-${id}`,
      }),
      persistVerifiedPayment: async (payment) => {
        writes.push(payment.checkoutRequestId);
        return payment;
      },
    });

    assert.equal(await process(callback("checkout-old")), attempts[0]);
    assert.deepEqual(writes, ["checkout-old"]);
  });

  it("records a verified payment only when its amount matches and it has a receipt", async () => {
    const harness = createHarness(async (id) => ({
      checkoutRequestId: id,
      status: "paid",
      amount: 100,
      receipt: "QWER123456",
    }));
    assert.ok(await harness.process(callback()));
    assert.equal(harness.state.status, "paid");
    assert.equal(harness.state.receipt, "QWER123456");

    const invalidAmount = createHarness(async (id) => ({
      checkoutRequestId: id,
      status: "paid",
      amount: 99,
      receipt: "ASDF123456",
    }));
    assert.equal(await invalidAmount.process(callback()), null);
    assert.equal(invalidAmount.state.status, "unpaid");
  });

  it("makes duplicate callbacks idempotent and prevents conflicting callbacks from overwriting payment", async () => {
    const harness = createHarness(async (id) => ({
      checkoutRequestId: id,
      status: "paid",
      amount: 100,
      receipt: "QWER123456",
    }));
    await harness.process(callback());
    await harness.process(callback());
    assert.equal(harness.writes, 1);
    assert.equal(harness.state.status, "paid");
    assert.equal(harness.state.receipt, "QWER123456");
  });

  it("records verified cancellation as failed, without changing it on duplicates", async () => {
    const harness = createHarness(async (id) => ({
      checkoutRequestId: id,
      status: "failed",
    }));
    await harness.process(callback(checkoutRequestId, 1032));
    await harness.process(callback(checkoutRequestId, 1032));
    assert.equal(harness.state.status, "failed");
    assert.equal(harness.writes, 1);
  });

  it("keeps a pending provider result unchanged", async () => {
    const harness = createHarness(async (id) => ({
      checkoutRequestId: id,
      status: "pending",
    }));
    assert.equal(await harness.process(callback()), null);
    assert.equal(harness.state.status, "unpaid");
    assert.equal(harness.writes, 0);
  });
});
