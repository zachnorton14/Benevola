const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'benevola.db'), // Path to your SQLite file
    logging: false // Set to console.log to see the raw SQL queries
});

// enables cascading and connects to db immediately
(async () => {
    await sequelize.authenticate();
    await sequelize.query("PRAGMA foreign_keys = ON;");
}
)();

module.exports = sequelize;