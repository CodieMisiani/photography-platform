import { env } from "./env.js";
import { AppError } from "../utils/AppError.js";

export type DarajaSettings = Pick<
  typeof env,
  | "NODE_ENV"
  | "DARAJA_ENV"
  | "DARAJA_PRODUCTION_INITIATION_ENABLED"
  | "DARAJA_CONSUMER_KEY"
  | "DARAJA_CONSUMER_SECRET"
  | "DARAJA_PASSKEY"
  | "DARAJA_SHORTCODE"
  | "DARAJA_CALLBACK_URL"
>;

export type DarajaConfig = DarajaSettings & { baseUrl: string };

export function createDarajaConfig(settings: DarajaSettings): DarajaConfig {
  return {
    ...settings,
    baseUrl:
      settings.DARAJA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke",
  };
}

export const darajaConfig = createDarajaConfig(env);

/** Reject unsafe or incomplete payment configuration before reserving an attempt. */
export function assertDarajaInitiationAllowed(config: DarajaConfig): void {
  const expectedBaseUrl =
    config.DARAJA_ENV === "sandbox"
      ? "https://sandbox.safaricom.co.ke"
      : config.DARAJA_ENV === "production"
        ? "https://api.safaricom.co.ke"
        : null;

  if (!expectedBaseUrl || config.baseUrl !== expectedBaseUrl) {
    throw disabledConfiguration();
  }

  if (
    config.DARAJA_ENV === "production" &&
    (config.NODE_ENV !== "production" ||
      !config.DARAJA_PRODUCTION_INITIATION_ENABLED)
  ) {
    throw disabledConfiguration();
  }

  if (
    !config.DARAJA_CONSUMER_KEY.trim() ||
    !config.DARAJA_CONSUMER_SECRET.trim() ||
    !config.DARAJA_PASSKEY.trim() ||
    !config.DARAJA_SHORTCODE.trim()
  ) {
    throw disabledConfiguration();
  }

  try {
    const callback = new URL(config.DARAJA_CALLBACK_URL);
    const protocolAllowed =
      config.DARAJA_ENV === "production"
        ? callback.protocol === "https:"
        : callback.protocol === "https:" || callback.protocol === "http:";
    if (!protocolAllowed) throw new Error("Invalid callback protocol");
  } catch {
    throw disabledConfiguration();
  }
}

function disabledConfiguration() {
  return new AppError(
    503,
    "M-Pesa payment initiation is disabled by server configuration",
    "DARAJA_INITIATION_DISABLED",
  );
}
