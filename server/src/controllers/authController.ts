import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { verifyAdminCredentials } from "../services/authService.js";
import {
  createSession,
  destroySession,
  getSession,
} from "../services/sessionService.js";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: env.COOKIE_SECURE ? ("none" as const) : ("lax" as const),
  secure: env.COOKIE_SECURE,
  maxAge: 8 * 60 * 60 * 1000,
  path: "/",
};

export async function login(req: Request, res: Response) {
  const admin = await verifyAdminCredentials(req.body.email, req.body.password);
  const sessionId = await createSession(admin.email);
  res.cookie(env.SESSION_COOKIE_NAME, sessionId, sessionCookieOptions);
  res.status(200).json({ admin });
}

export async function logout(req: Request, res: Response) {
  const sessionId = req.cookies?.[env.SESSION_COOKIE_NAME] as
    | string
    | undefined;
  if (sessionId) {
    await destroySession(sessionId);
  }
  res.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });
  res.status(204).send();
}

export async function me(req: Request, res: Response) {
  const sessionId = req.cookies?.[env.SESSION_COOKIE_NAME] as
    | string
    | undefined;
  if (!sessionId) {
    res.status(200).json({ admin: null });
    return;
  }

  const session = await getSession(sessionId);
  res.status(200).json({ admin: session ? { email: session.email } : null });
}
