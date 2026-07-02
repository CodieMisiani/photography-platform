import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";
import { destroySession } from "../services/sessionService.js";

export async function changePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body as {
    currentPassword: string;
    newPassword: string;
  };
  const adminEmail = req.adminEmail;
  if (!adminEmail)
    throw new AppError(401, "Admin session required", "AUTH_REQUIRED");

  const admin = await db<{ id: string; password_hash: string }>("admin_users")
    .where({ email: adminEmail })
    .first();
  if (!admin) throw new AppError(404, "Admin account not found", "NOT_FOUND");

  const valid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!valid)
    throw new AppError(400, "Incorrect current password", "INVALID_PASSWORD");

  const hash = await bcrypt.hash(newPassword, 12);
  await db("admin_users")
    .where({ id: admin.id })
    .update({ password_hash: hash, updated_at: db.fn.now() });

  res.status(200).json({ ok: true });
}

export async function changeEmail(req: Request, res: Response) {
  const { currentPassword, newEmail } = req.body as {
    currentPassword: string;
    newEmail: string;
  };
  const adminEmail = req.adminEmail;
  if (!adminEmail)
    throw new AppError(401, "Admin session required", "AUTH_REQUIRED");

  const admin = await db<{ id: string; email: string; password_hash: string }>(
    "admin_users",
  )
    .where({ email: adminEmail })
    .first();
  if (!admin) throw new AppError(404, "Admin account not found", "NOT_FOUND");

  const valid = await bcrypt.compare(currentPassword, admin.password_hash);
  if (!valid)
    throw new AppError(400, "Incorrect current password", "INVALID_PASSWORD");

  if (newEmail.toLowerCase() === admin.email.toLowerCase()) {
    throw new AppError(400, "New email must be different", "INVALID_EMAIL");
  }

  await db("admin_users")
    .where({ id: admin.id })
    .update({ email: newEmail.toLowerCase(), updated_at: db.fn.now() });

  // Invalidate current session
  const sessionId = req.cookies?.[
    process.env.SESSION_COOKIE_NAME || "studio_admin_session"
  ] as string | undefined;
  if (sessionId) {
    try {
      await destroySession(sessionId);
    } catch (err) {
      // log but don't block
      console.error("Failed to destroy session after email change", err);
    }
  }

  res.status(200).json({ ok: true, reLoginRequired: true });
}
