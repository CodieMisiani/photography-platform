import type { Knex } from "knex";

const defaults = ["Weddings", "Portraits", "Corporate", "Events", "Concerts", "Travel", "Landscape", "Nature", "Graduation", "Lifestyle"];

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable("portfolio_categories"))) {
    await knex.schema.createTable("portfolio_categories", (table) => {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("name", 80).notNullable().unique();
      table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    });
    await knex("portfolio_categories").insert(defaults.map((name) => ({ name }))).onConflict("name").ignore();
  }
  if (!(await knex.schema.hasColumn("events", "is_published"))) await knex.schema.alterTable("events", (table) => table.boolean("is_published").notNullable().defaultTo(true));
  if (!(await knex.schema.hasColumn("project_photos", "alt_text"))) await knex.schema.alterTable("project_photos", (table) => table.string("alt_text", 255));
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasColumn("project_photos", "alt_text")) await knex.schema.alterTable("project_photos", (table) => table.dropColumn("alt_text"));
  if (await knex.schema.hasColumn("events", "is_published")) await knex.schema.alterTable("events", (table) => table.dropColumn("is_published"));
  await knex.schema.dropTableIfExists("portfolio_categories");
}
