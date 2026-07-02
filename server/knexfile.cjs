require("dotenv").config();

const connection =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/photography_platform";

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  client: "pg",
  connection,
  migrations: {
    directory: isProduction ? "./dist/db/migrations" : "./src/db/migrations",
    extension: isProduction ? "js" : "ts",
  },
  pool: {
    min: 0,
    max: 10,
  },
};
