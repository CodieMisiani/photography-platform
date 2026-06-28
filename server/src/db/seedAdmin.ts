import bcrypt from "bcryptjs";
import { db } from "./knex.js";
import { env } from "../config/env.js";

async function main() {
  const passwordHash = env.ADMIN_PASSWORD
    ? await bcrypt.hash(env.ADMIN_PASSWORD, 12)
    : env.ADMIN_PASSWORD_HASH;

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
