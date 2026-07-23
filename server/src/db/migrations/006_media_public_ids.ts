import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("events", (table) => {
    table.text("cover_public_id");
  });

  await knex.schema.alterTable("public_events", (table) => {
    table.text("image_public_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("public_events", (table) => {
    table.dropColumn("image_public_id");
  });

  await knex.schema.alterTable("events", (table) => {
    table.dropColumn("cover_public_id");
  });
}
