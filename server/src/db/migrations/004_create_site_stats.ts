import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("site_stats", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("key").notNullable().unique();
    table.string("label").notNullable();
    table.integer("value").notNullable().defaultTo(0);
    table.string("suffix");
    table.integer("sort_order").notNullable().defaultTo(0);
    table.boolean("is_visible").notNullable().defaultTo(true);
  });

  // Seed with default stats so the UI remains unchanged on deploy
  await knex("site_stats").insert([
    {
      key: "projects_complete",
      label: "Projects Completed",
      value: 128,
      suffix: "+",
      sort_order: 1,
      is_visible: true,
    },
    {
      key: "happy_clients",
      label: "Happy Clients",
      value: 94,
      suffix: "%",
      sort_order: 2,
      is_visible: true,
    },
    {
      key: "awards_won",
      label: "Awards Won",
      value: 12,
      suffix: "",
      sort_order: 3,
      is_visible: true,
    },
  ]);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("site_stats");
}
