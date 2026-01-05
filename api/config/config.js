require("dotenv").config();
const path = require("path");

const devFallback = path.resolve(process.cwd(), "data", "dev.sqlite");
const prodFallback = path.resolve(process.cwd(), "data", "prod.sqlite");

module.exports = {
  development: {
    dialect: "sqlite",
    storage: process.env.SQLITE_STORAGE_DEV || devFallback,
    logging: false,
  },
  
  production: {
    dialect: "sqlite",
    storage: process.env.SQLITE_STORAGE_PROD || prodFallback,
    logging: false,
  },

  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  },
};
