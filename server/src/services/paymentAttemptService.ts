export type ReservedPaymentAttempt<Attempt> = {
  attempt: Attempt;
  created: boolean;
};

/**
 * Coordinates one durable attempt reservation with the external STK request.
 * The reservation must be committed before calling Daraja. Failed/ambiguous
 * requests deliberately keep the reservation active so a retry cannot create
 * a second prompt without independent reconciliation.
 */
export function createPaymentAttemptInitiator<Attempt>(dependencies: {
  assertInitiationAllowed: () => void;
  reserve: (invoiceId: string) => Promise<ReservedPaymentAttempt<Attempt>>;
  getCheckoutRequestId: (attempt: Attempt) => string | null;
  getAttemptState: (attempt: Attempt) =>
    | "initiating"
    | "pending"
    | "verification_pending";
  startProviderRequest: (
    attempt: Attempt,
    phone: string,
  ) => Promise<string>;
  markDispatching: (attemptId: string) => Promise<void>;
  saveCheckoutRequestId: (
    attemptId: string,
    checkoutRequestId: string,
  ) => Promise<void>;
  getAttemptId: (attempt: Attempt) => string;
}) {
  return async function start(invoiceId: string, phone: string) {
    dependencies.assertInitiationAllowed();
    const reservation = await dependencies.reserve(invoiceId);
    if (!reservation.created) {
      return {
        checkout_request_id: dependencies.getCheckoutRequestId(
          reservation.attempt,
        ),
        status: "pending" as const,
        attempt_status: dependencies.getAttemptState(reservation.attempt),
      };
    }

    // Commit this transition before making any request that could trigger an
    // STK prompt. Reconciliation can safely resolve `initiating`, but must
    // quarantine `dispatching` while the provider outcome may be in flight.
    await dependencies.markDispatching(
      dependencies.getAttemptId(reservation.attempt),
    );
    const checkoutRequestId = await dependencies.startProviderRequest(
      reservation.attempt,
      phone,
    );
    await dependencies.saveCheckoutRequestId(
      dependencies.getAttemptId(reservation.attempt),
      checkoutRequestId,
    );

    return {
      checkout_request_id: checkoutRequestId,
      status: "pending" as const,
      attempt_status: "pending" as const,
    };
  };
}
