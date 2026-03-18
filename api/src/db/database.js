const { Sequelize } = require('sequelize');
require("dotenv").config();

const env = process.env.NODE_ENV || "development";

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    ...(env === 'production' && {
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    }),
});

module.exports = sequelize;
