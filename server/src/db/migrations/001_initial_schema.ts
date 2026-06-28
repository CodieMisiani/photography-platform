import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw('create extension if not exists "pgcrypto"');

  await knex.raw(`
    do $$ begin
      create type booking_status as enum ('pending', 'confirmed', 'declined');
    exception when duplicate_object then null;
    end $$;
  `);
  await knex.raw(`
    do $$ begin
      create type quote_status as enum ('new', 'responded', 'closed');
    exception when duplicate_object then null;
    end $$;
  `);
  await knex.raw(`
    do $$ begin
      create type invoice_status as enum ('unpaid', 'paid', 'failed');
    exception when duplicate_object then null;
    end $$;
  `);

  await knex.schema.createTable("events", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("title").notNullable();
    table.string("category").notNullable();
    table.text("cover_url").notNullable();
    table.date("event_date").notNullable();
    table.boolean("is_featured").notNullable().defaultTo(false);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("bookings", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("client_name").notNullable();
    table.string("whatsapp").notNullable();
    table.string("email").notNullable();
    table.date("event_date").notNullable();
    table.string("event_type").notNullable();
    table.specificType("status", "booking_status").notNullable().defaultTo("pending");
    table.text("notes");
  });

  await knex.schema.createTable("quote_requests", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("client_name").notNullable();
    table.string("whatsapp").notNullable();
    table.string("email").notNullable();
    table.text("description").notNullable();
    table.specificType("status", "quote_status").notNullable().defaultTo("new");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("invoices", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("invoice_no").notNullable().unique();
    table.string("client_name").notNullable();
    table.string("phone").notNullable();
    table.decimal("amount", 12, 2).notNullable();
    table.specificType("status", "invoice_status").notNullable().defaultTo("unpaid");
    table.string("mpesa_ref");
    table.timestamp("paid_at", { useTz: true });
  });

  await knex.schema.createTable("calendar_blocks", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.date("blocked_date").notNullable().unique();
    table.string("reason").notNullable();
    table.uuid("booking_id").references("id").inTable("bookings").onDelete("SET NULL");
  });

  await knex.schema.createTable("public_events", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("title").notNullable();
    table.string("venue").notNullable();
    table.date("event_date").notNullable();
    table.text("ticket_url");
    table.decimal("price", 12, 2).notNullable();
    table.boolean("is_published").notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("public_events");
  await knex.schema.dropTableIfExists("calendar_blocks");
  await knex.schema.dropTableIfExists("invoices");
  await knex.schema.dropTableIfExists("quote_requests");
  await knex.schema.dropTableIfExists("bookings");
  await knex.schema.dropTableIfExists("events");
  await knex.raw("drop type if exists invoice_status");
  await knex.raw("drop type if exists quote_status");
  await knex.raw("drop type if exists booking_status");
}
