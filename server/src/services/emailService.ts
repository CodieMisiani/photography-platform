import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { deliverNewsletterNotification } from "./newsletterDelivery.js";

let transporter: Transporter | null = null;

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendNewsletterSignupNotification({
  email,
  subscribedAt,
  reactivated,
}: {
  email: string;
  subscribedAt: string;
  reactivated: boolean;
}) {
  const statusLabel = reactivated ? "reactivated" : "subscribed";
  const subscribedAtLabel = new Date(subscribedAt).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await deliverNewsletterNotification({
    smtpConfigured: hasSmtpConfig(),
    recipient: env.NEWSLETTER_NOTIFY_EMAIL,
    message: {
      from: env.SMTP_FROM || env.SMTP_USER,
      subject: `Newsletter ${statusLabel}: ${email}`,
      text: [
        "A newsletter subscriber was captured.",
        "",
        `Email: ${email}`,
        `Status: ${statusLabel}`,
        `Time: ${subscribedAtLabel}`,
      ].join("\n"),
    },
    sendMail: (message) => getTransporter().sendMail(message),
    onSkipped: () =>
      console.warn(
        "[emailService] SMTP or newsletter recipient configuration is incomplete; newsletter notification skipped.",
      ),
  });
}
