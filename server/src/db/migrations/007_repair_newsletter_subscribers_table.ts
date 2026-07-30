import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasNewsletterSubscribers = await knex.schema.hasTable(
    "newsletter_subscribers",
  );

  if (hasNewsletterSubscribers) {
    return;
  }

  await knex.schema.createTable("newsletter_subscribers", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email", 255).notNullable().unique();
    table
      .timestamp("subscribed_at", { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());
    table.boolean("is_active").notNullable().defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("newsletter_subscribers");
}
