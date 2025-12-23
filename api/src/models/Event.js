const { DataTypes } = require('sequelize');
const sequelize = require('../db/database');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
    },
    location: {
        type: DataTypes.STRING,
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    event_start_time: {
        type: DataTypes.DATE,
    },
    event_end_time: {
        type: DataTypes.DATE,
    }
});

module.exports = Event;
