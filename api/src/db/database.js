const { Sequelize } = require('sequelize');
const config = require('../../config/config');

/* One Sequelize instance for the whole process, built from the same config
   sequelize-cli uses so migrations and runtime can never disagree.

   In serverless this module is evaluated once per warm instance and reused
   across invocations, which is what keeps the connection pool from being
   rebuilt on every request. Do not create Sequelize inside a handler. */

const env = process.env.NODE_ENV || "development";
const cfg = config[env];

if (!cfg) {
    throw new Error(`No database config for NODE_ENV="${env}".`);
}

if (cfg.dialect === "postgres" && !cfg.url) {
    throw new Error(
        'DATABASE_URL is not set. Production needs a Postgres connection string ' +
        '— use the pooled Neon host, the one with "-pooler" in it.'
    );
}

// Passing the URL positionally: Sequelize only parses a connection string in
// that position, not from a `url` key on the options object.
const sequelize = cfg.url
    ? new Sequelize(cfg.url, cfg)
    : new Sequelize(cfg);

module.exports = sequelize;
