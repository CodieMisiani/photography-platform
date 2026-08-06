import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // The initial Phase 1 SQL may already have been applied directly in Neon.
  // Treat that as the migration's completed state so deploy-time migrations stay safe.
  if (await knex.schema.hasTable("project_photos")) return;
  await knex.schema.createTable("project_photos", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table
      .uuid("event_id")
      .notNullable()
      .references("id")
      .inTable("events")
      .onDelete("CASCADE");
    table.text("cloudinary_url").notNullable();
    table.string("cloudinary_public_id", 255).notNullable();
    table.string("caption", 255);
    table.integer("sort_order").notNullable().defaultTo(0);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index("event_id", "idx_project_photos_event_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("project_photos");
}
