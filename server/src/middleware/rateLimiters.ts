import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { env } from "../config/env.js";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const accountChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Prefer session cookie as the key when present to rate-limit per admin session.
    const sessionKey = req.cookies?.[env.SESSION_COOKIE_NAME];
    if (sessionKey) return `session:${sessionKey}`;
    // Fallback to the library helper to safely handle IPv4 and IPv6 addresses.
    const ip = req.ip ?? "";
    return ipKeyGenerator(ip);
  },
});

export const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
