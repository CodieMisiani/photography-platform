import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { getSession } from "../services/sessionService.js";
import { AppError } from "../utils/AppError.js";

declare module "express-serve-static-core" {
  interface Request {
    adminEmail?: string;
  }
}

type SessionLookup = (sessionId: string) => ReturnType<typeof getSession>;

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const defaultAllowedOrigins = env.CLIENT_ORIGIN;

function hasAllowedOrigin(
  origin: string | undefined,
  allowedOrigins: string[],
) {
  return Boolean(origin && allowedOrigins.includes(origin));
}

function hasValidCsrfToken(expected: string, received: string | undefined) {
  if (!received || !/^[a-f\d]{64}$/i.test(received)) return false;
  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function createRequireAdminSession(
  lookupSession: SessionLookup = getSession,
  allowedOrigins: string[] = defaultAllowedOrigins,
) {
  return async function requireAdminSession(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    const sessionId = req.cookies?.[env.SESSION_COOKIE_NAME] as
      | string
      | undefined;
    if (!sessionId) {
      next(new AppError(401, "Admin session required", "AUTH_REQUIRED"));
      return;
    }

    const session = await lookupSession(sessionId);
    if (!session) {
      next(new AppError(401, "Admin session expired", "SESSION_EXPIRED"));
      return;
    }

    if (!safeMethods.has(req.method.toUpperCase())) {
      const origin = req.get("origin");
      if (!hasAllowedOrigin(origin, allowedOrigins)) {
        next(
          new AppError(
            403,
            "Request origin is not allowed",
            "CSRF_ORIGIN_INVALID",
          ),
        );
        return;
      }

      if (!hasValidCsrfToken(session.csrfToken, req.get("x-csrf-token"))) {
        next(
          new AppError(
            403,
            "CSRF token is missing or invalid",
            "CSRF_TOKEN_INVALID",
          ),
        );
        return;
      }
    }

    req.adminEmail = session.email;
    next();
  };
}

export const requireAdminSession = createRequireAdminSession();

export function createRequireAllowedOrigin(
  allowedOrigins: string[] = defaultAllowedOrigins,
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!hasAllowedOrigin(req.get("origin"), allowedOrigins)) {
      next(
        new AppError(
          403,
          "Request origin is not allowed",
          "CSRF_ORIGIN_INVALID",
        ),
      );
      return;
    }
    next();
  };
}

export const requireAllowedOrigin = createRequireAllowedOrigin();
