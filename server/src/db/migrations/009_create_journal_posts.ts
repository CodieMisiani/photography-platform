import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // The initial Phase 1 SQL may already have been applied directly in Neon.
  // Treat that as the migration's completed state so deploy-time migrations stay safe.
  if (await knex.schema.hasTable("journal_posts")) return;
  await knex.schema.createTable("journal_posts", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("slug", 255).notNullable().unique();
    table.string("title", 255).notNullable();
    table.text("excerpt").notNullable();
    table.text("body").notNullable();
    table.text("cover_url");
    table.string("cloudinary_public_id", 255);
    table.string("category", 100);
    table.integer("read_time_minutes");
    table.boolean("is_published").notNullable().defaultTo(false);
    table.timestamp("published_at", { useTz: true });
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index("slug", "idx_journal_posts_slug");
    table.index(["is_published", "published_at"], "idx_journal_posts_published");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("journal_posts");
}
