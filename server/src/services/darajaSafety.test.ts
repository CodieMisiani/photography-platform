import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createDarajaConfig, assertDarajaInitiationAllowed } from "../config/daraja.js";
import { parseEnvironment } from "../config/env.js";
import { createDarajaClient } from "./darajaClient.js";
import { createPaymentAttemptInitiator } from "./paymentAttemptService.js";

const testCredentials = {
  DARAJA_CONSUMER_KEY: "test-consumer-key",
  DARAJA_CONSUMER_SECRET: "test-consumer-secret",
  DARAJA_PASSKEY: "test-passkey",
  DARAJA_SHORTCODE: "174379",
  DARAJA_CALLBACK_URL: "https://sandbox.example.test/webhooks/daraja",
};

function fakeFetchForSandbox(requestedUrls: string[]) {
  return (async (input: string | URL | Request) => {
    const url = String(input);
    requestedUrls.push(url);
    assert.ok(url.startsWith("https://sandbox.safaricom.co.ke"));
    if (url.includes("/oauth/")) {
      return new Response(JSON.stringify({ access_token: "mock-access-token" }), {
        status: 200,
      });
    }
    return new Response(JSON.stringify({ CheckoutRequestID: "ws_CO_test_123" }), {
      status: 200,
    });
  }) as typeof fetch;
}

describe("Daraja environment safety boundary", () => {
  it("defaults development and test to sandbox and rejects missing or invalid production environment", () => {
    assert.equal(parseEnvironment({ NODE_ENV: "development" }).DARAJA_ENV, "sandbox");
    assert.equal(parseEnvironment({ NODE_ENV: "test" }).DARAJA_ENV, "sandbox");
    assert.throws(() => parseEnvironment({ NODE_ENV: "production" }));
    assert.throws(() =>
      parseEnvironment({ NODE_ENV: "test", DARAJA_ENV: "live" }),
    );
    assert.throws(() =>
      parseEnvironment({ NODE_ENV: "test", DARAJA_ENV: "production" }),
    );
  });

  it("uses mocked sandbox HTTP through config, attempt coordinator, and provider client", async () => {
    const settings = parseEnvironment({
      NODE_ENV: "test",
      DARAJA_ENV: "sandbox",
      ...testCredentials,
    });
    const config = createDarajaConfig(settings);
    const requestedUrls: string[] = [];
    const client = createDarajaClient(config, fakeFetchForSandbox(requestedUrls));
    let reservedAttempts = 0;
    let persistedCheckout: string | null = null;

    const start = createPaymentAttemptInitiator({
      assertInitiationAllowed: () => assertDarajaInitiationAllowed(config),
      reserve: async () => {
        reservedAttempts += 1;
        return { attempt: { id: "attempt-1", amount: 250 }, created: true };
      },
      getCheckoutRequestId: () => persistedCheckout,
      getAttemptState: () => "initiating" as const,
      getAttemptId: () => "attempt-1",
      markDispatching: async () => {},
      startProviderRequest: (attempt, phone) =>
        client.startStkPush({
          amount: attempt.amount,
          phone,
          invoiceNo: "INV-TEST-12345",
        }),
      saveCheckoutRequestId: async (_attemptId, checkoutRequestId) => {
        persistedCheckout = checkoutRequestId;
      },
    });

    const result = await start("invoice-1", "0712345678");
    assert.equal(result.checkout_request_id, "ws_CO_test_123");
    assert.equal(reservedAttempts, 1);
    assert.deepEqual(
      requestedUrls.map((url) => new URL(url).hostname),
      ["sandbox.safaricom.co.ke", "sandbox.safaricom.co.ke"],
    );
  });

  it("blocks unapproved production initiation before reserving an attempt or making HTTP requests", async () => {
    const settings = parseEnvironment({
      NODE_ENV: "production",
      DARAJA_ENV: "production",
      ...testCredentials,
    });
    const config = createDarajaConfig(settings);
    const requestedUrls: string[] = [];
    const client = createDarajaClient(config, (async (input: string | URL | Request) => {
      requestedUrls.push(String(input));
      return new Response("{}", { status: 200 });
    }) as typeof fetch);
    let reservedAttempts = 0;

    const start = createPaymentAttemptInitiator({
      assertInitiationAllowed: () => assertDarajaInitiationAllowed(config),
      reserve: async () => {
        reservedAttempts += 1;
        return { attempt: { id: "attempt-1", amount: 250 }, created: true };
      },
      getCheckoutRequestId: () => null,
      getAttemptState: () => "initiating" as const,
      getAttemptId: () => "attempt-1",
      markDispatching: async () => {},
      startProviderRequest: (_attempt, phone) =>
        client.startStkPush({
          amount: 250,
          phone,
          invoiceNo: "INV-TEST-12345",
        }),
      saveCheckoutRequestId: async () => {},
    });

    await assert.rejects(start("invoice-1", "0712345678"), {
      code: "DARAJA_INITIATION_DISABLED",
    });
    assert.equal(reservedAttempts, 0);
    assert.deepEqual(requestedUrls, []);
  });

  it("blocks sandbox initiation before reservation if required credentials are absent", async () => {
    const config = createDarajaConfig(
      parseEnvironment({ NODE_ENV: "development", DARAJA_ENV: "sandbox" }),
    );
    let reservedAttempts = 0;
    const start = createPaymentAttemptInitiator({
      assertInitiationAllowed: () => assertDarajaInitiationAllowed(config),
      reserve: async () => {
        reservedAttempts += 1;
        return { attempt: { id: "attempt-1" }, created: true };
      },
      getCheckoutRequestId: () => null,
      getAttemptState: () => "initiating" as const,
      getAttemptId: () => "attempt-1",
      markDispatching: async () => {},
      startProviderRequest: async () => "unused",
      saveCheckoutRequestId: async () => {},
    });

    await assert.rejects(start("invoice-1", "0712345678"), {
      code: "DARAJA_INITIATION_DISABLED",
    });
    assert.equal(reservedAttempts, 0);
  });

  it("requires production approval and complete live configuration at startup", () => {
    assert.throws(() =>
      parseEnvironment({
        NODE_ENV: "production",
        DARAJA_ENV: "production",
        DARAJA_PRODUCTION_INITIATION_ENABLED: "true",
      }),
    );

    const approved = parseEnvironment({
      NODE_ENV: "production",
      DARAJA_ENV: "production",
      DARAJA_PRODUCTION_INITIATION_ENABLED: "true",
      ...testCredentials,
    });
    assert.equal(approved.DARAJA_PRODUCTION_INITIATION_ENABLED, true);
    assert.equal(createDarajaConfig(approved).baseUrl, "https://api.safaricom.co.ke");
  });
});
