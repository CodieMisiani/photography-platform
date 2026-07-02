import bcrypt from "bcryptjs";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";

type AdminUserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export async function verifyAdminCredentials(email: string, password: string) {
  console.log("[authService] verifyAdminCredentials", {
    email,
    passwordProvided: typeof password === "string",
  });
  const admin = await db<AdminUserRow>("admin_users")
    .where({ email: email.toLowerCase() })
    .first();

  console.log("[authService] admin row", { admin });

  if (!admin) {
    console.error(
      "[authService] no admin found for email",
      email.toLowerCase(),
    );
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  console.log("[authService] password hash", {
    hash: admin.password_hash?.slice(0, 20),
  });
  let isValid = false;
  try {
    isValid = await bcrypt.compare(password, admin.password_hash);
  } catch (error) {
    console.error("[authService] bcrypt.compare failed", error, {
      hash: admin.password_hash,
    });
    throw error;
  }

  console.log("[authService] password compare result", { isValid });
  if (!isValid) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return { email: admin.email };
}
