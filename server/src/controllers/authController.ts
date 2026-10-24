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

type AuthDependencies = {
  verifyCredentials: typeof verifyAdminCredentials;
  createSession: typeof createSession;
  destroySession: typeof destroySession;
  getSession: typeof getSession;
  cookieName: string;
  cookieOptions: typeof sessionCookieOptions;
};

/** Exposed for deterministic request-flow tests; production handlers use real services. */
export function createAuthHandlers(dependencies: AuthDependencies) {
  return {
    async login(req: Request, res: Response) {
      const admin = await dependencies.verifyCredentials(
        req.body.email,
        req.body.password,
      );
      const { sessionId, csrfToken } = await dependencies.createSession(
        admin.email,
      );
      res.cookie(
        dependencies.cookieName,
        sessionId,
        dependencies.cookieOptions,
      );
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({ admin, csrfToken });
    },

    async logout(req: Request, res: Response) {
      const sessionId = req.cookies?.[dependencies.cookieName] as
        | string
        | undefined;
      if (sessionId) {
        await dependencies.destroySession(sessionId);
      }
      res.clearCookie(dependencies.cookieName, { path: "/" });
      res.setHeader("Cache-Control", "no-store");
      res.status(204).send();
    },

    async me(req: Request, res: Response) {
      const sessionId = req.cookies?.[dependencies.cookieName] as
        | string
        | undefined;
      const session = sessionId
        ? await dependencies.getSession(sessionId)
        : null;
      res.setHeader("Cache-Control", "no-store");
      res.status(200).json({
        admin: session ? { email: session.email } : null,
        csrfToken: session?.csrfToken ?? null,
      });
    },
  };
}

const authHandlers = createAuthHandlers({
  verifyCredentials: verifyAdminCredentials,
  createSession,
  destroySession,
  getSession,
  cookieName: env.SESSION_COOKIE_NAME,
  cookieOptions: sessionCookieOptions,
});

export const { login, logout, me } = authHandlers;
