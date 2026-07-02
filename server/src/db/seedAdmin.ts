import bcrypt from "bcryptjs";
import { db } from "./knex.js";
import { env } from "../config/env.js";

async function main() {
  const password = env.ADMIN_PASSWORD?.trim();
  const passwordHash = password
    ? await bcrypt.hash(password, 12)
    : env.ADMIN_PASSWORD_HASH?.trim();

  if (!passwordHash || passwordHash.includes("replace_with_bcrypt_hash")) {
    throw new Error(
      "Set ADMIN_PASSWORD or ADMIN_PASSWORD_HASH to a real bcrypt hash before seeding the admin user.",
    );
  }

  await db("admin_users")
    .insert({
      email: env.ADMIN_EMAIL.toLowerCase(),
      password_hash: passwordHash,
    })
    .onConflict("email")
    .merge({
      password_hash: passwordHash,
      updated_at: db.fn.now(),
    });

  console.log(`Admin user ready: ${env.ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
