import { env } from "./env.js";

export const darajaConfig = {
  baseUrl:
    env.DARAJA_ENV === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke",
  consumerKey: env.DARAJA_CONSUMER_KEY,
  consumerSecret: env.DARAJA_CONSUMER_SECRET,
  passkey: env.DARAJA_PASSKEY,
  shortcode: env.DARAJA_SHORTCODE,
  callbackUrl: env.DARAJA_CALLBACK_URL,
};
