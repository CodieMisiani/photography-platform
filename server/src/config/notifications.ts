import { env } from "./env.js";
import { GmailSMTPProvider } from "../services/notifications/providers/email/GmailSMTPProvider.js";
import { ResendProvider } from "../services/notifications/providers/email/ResendProvider.js";
import { BaileysProvider } from "../services/notifications/providers/whatsapp/BaileysProvider.js";
import { MetaAPIProvider } from "../services/notifications/providers/whatsapp/MetaAPIProvider.stub.js";

export function createEmailProvider() {
  return env.EMAIL_PROVIDER === "resend" ? new ResendProvider() : new GmailSMTPProvider();
}
export function createWhatsAppProvider() {
  return env.WHATSAPP_PROVIDER === "meta" ? new MetaAPIProvider() : new BaileysProvider();
}
