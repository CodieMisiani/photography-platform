import type { Knex } from "knex";

/**
 * The enum addition is intentionally isolated. Application code may use the
 * label only after this migration commits.
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    "alter type invoice_payment_attempt_status add value if not exists 'dispatching'",
  );
}

export async function down(knex: Knex): Promise<void> {
  void knex;
  throw new Error(
    "Forward-only financial-history migration: PostgreSQL enum labels are not safely removable; apply a reviewed forward migration instead.",
  );
}
