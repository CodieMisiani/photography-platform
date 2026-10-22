import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Manual outcomes are deliberately distinct from provider-verified states.
  await knex.raw(
    "alter type invoice_payment_attempt_status add value if not exists 'manually_reconciled'",
  );

  await knex.schema.alterTable("invoice_payment_attempts", (table) => {
    table.dropForeign(
      "invoice_id",
      "invoice_payment_attempts_invoice_id_foreign",
    );
    table
      .foreign("invoice_id", "invoice_payment_attempts_invoice_id_foreign")
      .references("id")
      .inTable("invoices")
      .onDelete("RESTRICT");
  });
  await knex.schema.alterTable("invoice_payment_attempts", (table) => {
    table.unique(
      ["invoice_id", "id"],
      "invoice_payment_attempts_invoice_id_id_unique",
    );
  });

  await knex.schema.createTable("invoice_payment_reconciliations", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("invoice_id")
      .notNullable()
      .references("id")
      .inTable("invoices")
      .onDelete("RESTRICT");
    table.uuid("payment_attempt_id").notNullable();
    table.string("actor_email", 255).notNullable();
    table.specificType("previous_invoice_status", "invoice_status").notNullable();
    table.specificType("new_invoice_status", "invoice_status").notNullable();
    table
      .specificType("previous_attempt_status", "invoice_payment_attempt_status")
      .notNullable();
    table
      .specificType("new_attempt_status", "invoice_payment_attempt_status")
      .notNullable();
    table.text("reason").notNullable();
    table.string("evidence_reference", 255).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(["invoice_id", "created_at"], "invoice_payment_reconciliations_invoice_created_idx");
    table.check("char_length(trim(reason)) >= 10", [], "invoice_payment_reconciliations_reason_check");
    table.check("char_length(trim(evidence_reference)) >= 3", [], "invoice_payment_reconciliations_evidence_check");
    table.check("new_invoice_status in ('paid', 'failed')", [], "invoice_payment_reconciliations_outcome_check");
    // Compare as text. PostgreSQL cannot safely use a freshly added enum value
    // in the same transaction that adds the label, but text comparison is safe.
    table.check("new_attempt_status::text = 'manually_reconciled'", [], "invoice_payment_reconciliations_attempt_outcome_check");
    table.check(
      "previous_attempt_status in ('initiating', 'pending', 'verification_pending', 'legacy_unverified')",
      [],
      "invoice_payment_reconciliations_previous_attempt_check",
    );
  });

  await knex.raw(`
    alter table invoice_payment_reconciliations
    add constraint invoice_payment_reconciliations_attempt_invoice_foreign
    foreign key (invoice_id, payment_attempt_id)
    references invoice_payment_attempts (invoice_id, id)
    on delete restrict
  `);

  await knex.raw(`
    create function prevent_invoice_payment_reconciliation_mutation()
    returns trigger language plpgsql as $$
    begin
      raise exception 'invoice payment reconciliation records are append-only';
    end;
    $$;

    create trigger invoice_payment_reconciliations_append_only
    before update or delete on invoice_payment_reconciliations
    for each row execute function prevent_invoice_payment_reconciliation_mutation();

    create trigger invoice_payment_reconciliations_no_truncate
    before truncate on invoice_payment_reconciliations
    for each statement execute function prevent_invoice_payment_reconciliation_mutation();
  `);
}

export async function down(knex: Knex): Promise<void> {
  void knex;
  throw new Error(
    "Forward-only financial-history migration: do not roll back. Restore from an approved backup or apply a reviewed forward migration; reconciliation and attempt history must be preserved.",
  );
}
