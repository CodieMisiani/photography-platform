import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("project_photos", (table) => {
    table.string("cloudinary_public_id", 255).nullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  // External URLs intentionally have no Cloudinary public ID, so this cannot be
  // made non-nullable safely after rows have been created through the fallback.
}
