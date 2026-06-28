import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export async function verifyAdminCredentials(email: string, password: string) {
  if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const isValid = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
  if (!isValid) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return { email: env.ADMIN_EMAIL };
}
