require("dotenv").config();

const connection =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/photography_platform";

module.exports = {
  client: "pg",
  connection,
  migrations: {
    directory: "./src/db/migrations",
    extension: "ts"
  },
  pool: {
    min: 0,
    max: 10
  }
};
