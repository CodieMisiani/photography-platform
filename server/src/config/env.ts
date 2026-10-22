import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().optional(),
  DATABASE_URL: z
    .string()
    .min(1)
    .default(
      "postgres://postgres:postgres@localhost:5432/photography_platform",
    ),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("studio_admin_session"),
  SESSION_SECRET: z
    .string()
    .min(16)
    .default("development-session-secret-change-me"),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  ADMIN_EMAIL: z.string().email().default("admin@malumephotography.com"),
  ADMIN_PASSWORD: z.string().min(8).optional().default(""),
  ADMIN_PASSWORD_HASH: z.string().optional().default(""),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  CLOUDINARY_FOLDER: z.string().optional().default("malume-photography"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  SMTP_FROM: z.string().optional().default(""),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  NEWSLETTER_NOTIFY_EMAIL: z.string().email().optional(),
  EMAIL_PROVIDER: z.enum(["gmail", "resend"]).default("gmail"),
  GMAIL_USER: z.string().optional().default(""),
  GMAIL_APP_PASSWORD: z.string().optional().default(""),
  WHATSAPP_PROVIDER: z.enum(["baileys", "meta"]).default("baileys"),
  BAILEYS_SESSION_PATH: z.string().optional().default("./baileys-session"),
  DARAJA_ENV: z.enum(["sandbox", "production"]).optional(),
  DARAJA_PRODUCTION_INITIATION_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  DARAJA_CONSUMER_KEY: z.string().optional().default(""),
  DARAJA_CONSUMER_SECRET: z.string().optional().default(""),
  DARAJA_PASSKEY: z.string().optional().default(""),
  DARAJA_SHORTCODE: z.string().optional().default(""),
  DARAJA_CALLBACK_URL: z.string().optional().default(""),
}).superRefine((values, context) => {
  if (values.NODE_ENV === "production" && !values.DARAJA_ENV) {
    context.addIssue({
      code: "custom",
      path: ["DARAJA_ENV"],
      message: "DARAJA_ENV must be explicitly set in production",
    });
  }

  if (values.DARAJA_ENV === "production" && values.NODE_ENV !== "production") {
    context.addIssue({
      code: "custom",
      path: ["DARAJA_ENV"],
      message: "Production Daraja is only allowed when NODE_ENV=production",
    });
  }

  if (values.DARAJA_PRODUCTION_INITIATION_ENABLED) {
    if (values.NODE_ENV !== "production" || values.DARAJA_ENV !== "production") {
      context.addIssue({
        code: "custom",
        path: ["DARAJA_PRODUCTION_INITIATION_ENABLED"],
        message:
          "Production initiation approval requires NODE_ENV=production and DARAJA_ENV=production",
      });
    }

    for (const key of [
      "DARAJA_CONSUMER_KEY",
      "DARAJA_CONSUMER_SECRET",
      "DARAJA_PASSKEY",
      "DARAJA_SHORTCODE",
    ] as const) {
      if (!values[key].trim()) {
        context.addIssue({
          code: "custom",
          path: [key],
          message: `${key} is required when production initiation is approved`,
        });
      }
    }

    try {
      const callback = new URL(values.DARAJA_CALLBACK_URL);
      if (callback.protocol !== "https:") throw new Error("HTTPS required");
    } catch {
      context.addIssue({
        code: "custom",
        path: ["DARAJA_CALLBACK_URL"],
        message:
          "A valid HTTPS DARAJA_CALLBACK_URL is required when production initiation is approved",
      });
    }
  }
});

export function parseEnvironment(source: NodeJS.ProcessEnv = process.env) {
  const parsed = envSchema.parse(source);
  const darajaEnvironment = parsed.DARAJA_ENV ?? "sandbox";
const clientOrigins = (
  parsed.CLIENT_ORIGIN ??
  (parsed.NODE_ENV === "production"
    ? "https://photography-platform-eta.vercel.app,https://malumeph.com"
    : "http://localhost:5173")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const validatedClientOrigins = z
  .array(z.string().url())
  .min(1)
  .superRefine((origins, context) => {
    origins.forEach((origin, index) => {
      const parsedOrigin = new URL(origin);
      if (
        !["http:", "https:"].includes(parsedOrigin.protocol) ||
        parsedOrigin.origin !== origin
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Each CLIENT_ORIGIN entry must be an origin without a path or trailing slash",
          path: [index],
        });
      }
    });
  })
  .parse([...new Set(clientOrigins)]);

  return {
    ...parsed,
    DARAJA_ENV: darajaEnvironment,
    CLIENT_ORIGIN: validatedClientOrigins,
    COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production",
    ADMIN_PASSWORD: parsed.ADMIN_PASSWORD?.trim() || undefined,
    ADMIN_PASSWORD_HASH: parsed.ADMIN_PASSWORD_HASH?.trim() || "",
  };
}

export const env = parseEnvironment();
