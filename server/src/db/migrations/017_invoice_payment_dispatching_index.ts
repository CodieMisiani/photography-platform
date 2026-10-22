import type { Knex } from "knex";

const activeStatuses = [
  "initiating",
  "dispatching",
  "pending",
  "verification_pending",
  "legacy_unverified",
];

export async function up(knex: Knex): Promise<void> {
  await knex.raw("drop index if exists invoice_payment_attempts_one_active_per_invoice_idx");
  await knex.raw(
    `create unique index invoice_payment_attempts_one_active_per_invoice_idx
     on invoice_payment_attempts (invoice_id)
     where status in (${activeStatuses.map((status) => `'${status}'`).join(", ")})`,
  );
}

export async function down(knex: Knex): Promise<void> {
  void knex;
  throw new Error(
    "Forward-only financial-history migration: do not remove dispatching protection; apply a reviewed forward migration.",
  );
}
