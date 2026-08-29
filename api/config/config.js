require("dotenv").config();
const path = require("path");

/* Single source of truth for both sequelize-cli (migrations, seeders) and the
   running app — src/db/database.js reads this file rather than rebuilding the
   same logic, so a migration can never connect somewhere the API doesn't.

   Development stays on SQLite: no service to install, and `npm run db:fresh`
   is a file delete. Production is Postgres because the API runs serverless,
   where the filesystem is per-instance and wiped on every cold start — a
   SQLite file there loses data rather than merely being slow. */

const devFallback = path.resolve(process.cwd(), "data", "dev.sqlite");

// Neon (and every hosted Postgres) requires TLS. The CA is not one Node ships
// with, hence rejectUnauthorized: false — the connection is still encrypted.
//
// `?sslmode=disable` in the URL turns TLS off, matching libpq. It exists so the
// Postgres code paths can be exercised against a Postgres on localhost (a
// container, or an in-process PGlite) without a hosted database. Neon refuses
// unencrypted connections outright, so this cannot silently downgrade it.
const sslFor = (url) =>
  /[?&]sslmode=disable(&|$)/.test(url || "")
    ? false
    : { require: true, rejectUnauthorized: false };

const postgres = (url) => ({
  url,
  dialect: "postgres",
  dialectOptions: { ssl: sslFor(url) },
  // Serverless invocations are short and may run many at once, so each holds
  // as few connections as it can. Use Neon's *pooled* host (the one with
  // `-pooler` in it) so the real fan-in happens server-side.
  pool: { max: 2, min: 0, idle: 10000, acquire: 30000 },
  logging: false,
});

/* Seeders are recorded in a SequelizeData table, exactly as migrations are
   recorded in SequelizeMeta. Without this, sequelize-cli re-runs every seeder
   on every `db:seed:all` and the second run collides with unique constraints.
   The seeders each guard themselves as well, for the case where a run stops
   half way. */
const seederStorage = {
  seederStorage: "sequelize",
  seederStorageTableName: "SequelizeData",
};

module.exports = {
  development: {
    ...seederStorage,
    dialect: "sqlite",
    storage: process.env.SQLITE_STORAGE_DEV || devFallback,
    logging: false,
  },

  production: { ...postgres(process.env.DATABASE_URL), ...seederStorage },

  test: {
    ...seederStorage,
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
};
