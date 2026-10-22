import type { Knex } from "knex";

const activeStatuses = ["initiating", "pending", "verification_pending", "legacy_unverified"];

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    do $$ begin
      create type invoice_payment_attempt_status as enum (
        'initiating', 'pending', 'verification_pending',
        'succeeded', 'failed', 'cancelled', 'legacy_unverified'
      );
    exception when duplicate_object then null;
    end $$;
  `);

  await knex.schema.createTable("invoice_payment_attempts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("invoice_id")
      .notNullable()
      .references("id")
      .inTable("invoices")
      .onDelete("CASCADE");
    table.string("checkout_request_id").unique();
    table.string("legacy_reference");
    table.specificType("status", "invoice_payment_attempt_status").notNullable();
    table.decimal("expected_amount", 12, 2).notNullable();
    table.string("currency", 3).notNullable().defaultTo("KES");
    table.string("provider_receipt").unique();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(["invoice_id", "created_at"], "invoice_payment_attempts_invoice_created_idx");
  });

  await knex.raw(
    `create unique index invoice_payment_attempts_one_active_per_invoice_idx
     on invoice_payment_attempts (invoice_id)
     where status in (${activeStatuses.map((status) => `'${status}'`).join(", ")})`,
  );

  // Historical mpesa_ref values have represented both checkout IDs and receipts.
  // Preserve their exact value without asserting which kind of reference they are.
  await knex.raw(`
    insert into invoice_payment_attempts (
      invoice_id, legacy_reference, status, expected_amount, currency,
      created_at, updated_at
    )
    select
      id,
      mpesa_ref,
      'legacy_unverified'::invoice_payment_attempt_status,
      ceil(amount)::numeric(12,2),
      'KES',
      now(),
      now()
    from invoices
    where mpesa_ref is not null
  `);
}

export async function down(knex: Knex): Promise<void> {
  void knex;
  throw new Error(
    "Forward-only financial-history migration: do not roll back. Payment attempts may contain provider outcomes, receipts, or uncertainty evidence; restore from an approved backup or apply a reviewed forward migration.",
  );
}
