import type { Knex } from "knex";
export async function up(knex: Knex): Promise<void> { await knex.schema.createTable("baileys_session", (table) => { table.string("id", 50).primary().defaultTo("default"); table.jsonb("session").notNullable(); table.timestamp("updated_at", { useTz: true }).notNullable().defaultTo(knex.fn.now()); }); }
export async function down(knex: Knex): Promise<void> { await knex.schema.dropTableIfExists("baileys_session"); }
