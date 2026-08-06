import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("events", (table) => table.text("cover_url").nullable().alter());
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("events", (table) => table.text("cover_url").notNullable().alter());
}
