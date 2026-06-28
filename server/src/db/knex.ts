import knex from "knex";
import { env } from "../config/env.js";

export const db = knex({
  client: "pg",
  connection: env.DATABASE_URL,
  pool: {
    min: 0,
    max: 10,
  },
});
