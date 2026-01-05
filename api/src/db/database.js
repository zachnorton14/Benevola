const { Sequelize } = require('sequelize');
const path = require('path');
require("dotenv").config()

const env = process.env.NODE_ENV || "development";

const storageFromEnv =
  env === "production"
    ? process.env.SQLITE_STORAGE_PROD
    : process.env.SQLITE_STORAGE_DEV;

const fallbackStorage = path.resolve(
    process.cwd(),
    "data",
    env === "production" ? "prod.sqlite" : "dev.sqlite"
);

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storageFromEnv || fallbackStorage,
    logging: false
});

module.exports = sequelize;