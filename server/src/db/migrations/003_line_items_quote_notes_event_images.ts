import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("quote_requests", (table) => {
    table.text("notes");
  });

  await knex.schema.alterTable("public_events", (table) => {
    table.text("image_url");
  });

  await knex.schema.createTable("invoice_line_items", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("invoice_id")
      .notNullable()
      .references("id")
      .inTable("invoices")
      .onDelete("CASCADE");
    table.string("description").notNullable();
    table.integer("quantity").notNullable().defaultTo(1);
    table.decimal("unit_price", 12, 2).notNullable();
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("invoice_line_items");
  await knex.schema.alterTable("public_events", (table) => {
    table.dropColumn("image_url");
  });
  await knex.schema.alterTable("quote_requests", (table) => {
    table.dropColumn("notes");
  });
}
