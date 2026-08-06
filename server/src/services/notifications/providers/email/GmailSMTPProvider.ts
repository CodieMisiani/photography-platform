import nodemailer from "nodemailer";
import { env } from "../../../../config/env.js";
import type { EmailMessage, IEmailProvider } from "./EmailProvider.interface.js";

export class GmailSMTPProvider implements IEmailProvider {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
  });

  isConfigured() {
    return Boolean(env.GMAIL_USER && env.GMAIL_APP_PASSWORD);
  }

  async send(message: EmailMessage) {
    if (!this.isConfigured()) {
      console.warn("[notifications] Gmail is not configured; email skipped.");
      return { success: false };
    }
    const result = await this.transporter.sendMail({
      from: `"Malume Photography" <${env.GMAIL_USER}>`,
      ...message,
    });
    return { success: true, messageId: result.messageId };
  }
}
