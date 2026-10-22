export type CallbackPayment = {
  id: string;
  amount: string;
  checkoutRequestId: string;
};

export type VerifiedDarajaPayment = {
  checkoutRequestId: string;
  status: "paid" | "failed" | "pending";
  amount?: number;
  receipt?: string;
};

type CallbackPayload = {
  Body?: {
    stkCallback?: {
      ResultCode?: number;
      CheckoutRequestID?: string;
    };
  };
};

export function createDarajaCallbackProcessor<Payment, Result>(dependencies: {
  findPayment: (checkoutRequestId: string) => Promise<Payment | null>;
  getExpectedPayment: (payment: Payment) => CallbackPayment;
  verifyPayment: (
    checkoutRequestId: string,
    payment: CallbackPayment,
  ) => Promise<VerifiedDarajaPayment | null>;
  persistVerifiedPayment: (
    payment: Payment,
    verified: VerifiedDarajaPayment,
  ) => Promise<Result | null>;
}) {
  return async function processCallback(payload: CallbackPayload) {
    const callback = payload.Body?.stkCallback;
    const checkoutRequestId = callback?.CheckoutRequestID;
    if (!checkoutRequestId) return null;

    const paymentRecord = await dependencies.findPayment(checkoutRequestId);
    if (!paymentRecord) return null;
    const payment = dependencies.getExpectedPayment(paymentRecord);
    if (payment.checkoutRequestId !== checkoutRequestId) return null;

    const verified = await dependencies.verifyPayment(
      checkoutRequestId,
      payment,
    );
    if (
      !verified ||
      verified.checkoutRequestId !== checkoutRequestId ||
      verified.status === "pending"
    ) {
      return null;
    }

    if (verified.status === "paid") {
      const expectedAmount = Math.ceil(Number(payment.amount));
      if (
        !Number.isFinite(expectedAmount) ||
        verified.amount !== expectedAmount ||
        !verified.receipt?.trim()
      ) {
        return null;
      }
    }

    return dependencies.persistVerifiedPayment(paymentRecord, verified);
  };
}
