import { Buffer } from "node:buffer";
import type { DarajaConfig } from "../config/daraja.js";
import { assertDarajaInitiationAllowed } from "../config/daraja.js";
import { AppError } from "../utils/AppError.js";

type StkPushInput = {
  amount: number;
  phone: string;
  invoiceNo: string;
};

export function createDarajaClient(
  config: DarajaConfig,
  fetchImpl: typeof fetch = fetch,
) {
  async function getAccessToken() {
    assertDarajaInitiationAllowed(config);
    const credentials = Buffer.from(
      `${config.DARAJA_CONSUMER_KEY}:${config.DARAJA_CONSUMER_SECRET}`,
    ).toString("base64");
    let response: Response;
    try {
      response = await fetchImpl(
        `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: { Authorization: `Basic ${credentials}` },
          signal: AbortSignal.timeout(30_000),
        },
      );
    } catch {
      throw authFailure();
    }

    if (!response.ok) {
      throw authFailure();
    }

    let data: { access_token?: string };
    try {
      data = (await response.json()) as { access_token?: string };
    } catch {
      throw authFailure();
    }
    if (!data.access_token) {
      throw authFailure();
    }
    return data.access_token;
  }

  async function startStkPush(input: StkPushInput) {
    assertDarajaInitiationAllowed(config);
    const token = await getAccessToken();
    assertDarajaInitiationAllowed(config);

    const timestamp = getDarajaTimestamp();
    const password = Buffer.from(
      `${config.DARAJA_SHORTCODE}${config.DARAJA_PASSKEY}${timestamp}`,
    ).toString("base64");

    let response: Response;
    try {
      response = await fetchImpl(
        `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(30_000),
          body: JSON.stringify({
            BusinessShortCode: config.DARAJA_SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: input.amount,
            PartyA: normalizePhone(input.phone),
            PartyB: config.DARAJA_SHORTCODE,
            PhoneNumber: normalizePhone(input.phone),
            CallBackURL: config.DARAJA_CALLBACK_URL,
            AccountReference: input.invoiceNo,
            TransactionDesc: `Payment for ${input.invoiceNo}`,
          }),
        },
      );
    } catch {
      throw uncertainOutcome();
    }

    if (!response.ok) throw uncertainOutcome();

    let data: { CheckoutRequestID?: string };
    try {
      data = (await response.json()) as { CheckoutRequestID?: string };
    } catch {
      throw uncertainOutcome();
    }
    if (!data.CheckoutRequestID) throw uncertainOutcome();
    return data.CheckoutRequestID;
  }

  return { getAccessToken, startStkPush };
}

function uncertainOutcome() {
  return new AppError(
    502,
    "M-Pesa payment request outcome is uncertain; do not retry yet",
    "DARAJA_STK_OUTCOME_UNKNOWN",
  );
}

function authFailure() {
  return new AppError(
    502,
    "Could not authenticate with Daraja before sending the STK request",
    "DARAJA_AUTH_FAILED",
  );
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
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  return digits;
}
