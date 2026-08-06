import type { EmailMessage, IEmailProvider } from "./EmailProvider.interface.js";

/** Placeholder for a future Resend integration; selected only when implemented. */
export class ResendProvider implements IEmailProvider {
  isConfigured() { return false; }
  async send(_message: EmailMessage) {
    console.warn("[notifications] Resend provider is not configured; email skipped.");
    return { success: false };
  }
}
