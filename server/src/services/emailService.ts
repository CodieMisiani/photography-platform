import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env.js";

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
  if (!hasSmtpConfig()) {
    console.warn(
      "[emailService] SMTP env vars are incomplete; newsletter notification skipped.",
    );
    return;
  }

  const statusLabel = reactivated ? "reactivated" : "subscribed";
  const subscribedAtLabel = new Date(subscribedAt).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await getTransporter().sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: env.NEWSLETTER_NOTIFY_EMAIL,
    subject: `Newsletter ${statusLabel}: ${email}`,
    text: [
      "A newsletter subscriber was captured.",
      "",
      `Email: ${email}`,
      `Status: ${statusLabel}`,
      `Time: ${subscribedAtLabel}`,
    ].join("\n"),
  });
}
