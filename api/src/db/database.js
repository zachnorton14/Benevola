const { Sequelize } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'BenevaolaDB.db'), // Path to your SQLite file
    logging: false // Set to console.log to see the raw SQL queries
});

module.exports = sequelize;