import bcrypt from "bcryptjs";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export async function verifyAdminCredentials(email: string, password: string) {
  const admin = await db<AdminUserRow>("admin_users")
    .where({ email: email.toLowerCase() })
    .first();

  if (!admin) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const isValid = await bcrypt.compare(password, admin.password_hash);
  if (!isValid) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return { email: admin.email };
}
