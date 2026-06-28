import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { getSession } from "../services/sessionService.js";
import { AppError } from "../utils/AppError.js";

declare module "express-serve-static-core" {
  interface Request {
    adminEmail?: string;
  }
}

export async function requireAdminSession(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const sessionId = req.cookies?.[env.SESSION_COOKIE_NAME] as string | undefined;
  if (!sessionId) {
    next(new AppError(401, "Admin session required", "AUTH_REQUIRED"));
    return;
  }

  const session = await getSession(sessionId);
  if (!session) {
    next(new AppError(401, "Admin session expired", "SESSION_EXPIRED"));
    return;
  }

  req.adminEmail = session.email;
  next();
}
