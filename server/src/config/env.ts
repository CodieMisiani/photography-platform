import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgres://postgres:postgres@localhost:5432/photography_platform"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  SESSION_COOKIE_NAME: z.string().min(1).default("studio_admin_session"),
  SESSION_SECRET: z.string().min(16).default("development-session-secret-change-me"),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  ADMIN_PASSWORD_HASH: z.string().min(1).default("$2b$12$replace_with_bcrypt_hash"),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  DARAJA_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  DARAJA_CONSUMER_KEY: z.string().optional().default(""),
  DARAJA_CONSUMER_SECRET: z.string().optional().default(""),
  DARAJA_PASSKEY: z.string().optional().default(""),
  DARAJA_SHORTCODE: z.string().optional().default(""),
  DARAJA_CALLBACK_URL: z.string().optional().default(""),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  COOKIE_SECURE: parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production",
};
