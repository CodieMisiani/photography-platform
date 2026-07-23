import { db } from "../db/knex.js";

const REQUIRED_TABLES = [
  "events",
  "bookings",
  "quote_requests",
  "invoices",
  "calendar_blocks",
  "public_events",
  "admin_users",
  "invoice_line_items",
  "site_stats",
  "newsletter_subscribers",
];

export async function assertRequiredTablesExist() {
  const missingTables: string[] = [];

  for (const tableName of REQUIRED_TABLES) {
    const exists = await db.schema.hasTable(tableName);
    if (!exists) {
      missingTables.push(tableName);
    }
  }

  if (missingTables.length > 0) {
    throw new Error(
      [
        "Database schema is incomplete.",
        `Missing table(s): ${missingTables.join(", ")}.`,
        "Run `npm run migrate` against the configured DATABASE_URL before starting the server.",
      ].join(" "),
    );
  }
}
