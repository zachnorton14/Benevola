const { Sequelize } = require('sequelize');
require("dotenv").config({ quiet: true });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 2,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    ...(process.env.DB_SSL == 'true' && { dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    }),
});

module.exports = sequelize;
