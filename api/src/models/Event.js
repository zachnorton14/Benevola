const { DataTypes, SMALLINT } = require('sequelize');
const sequelize = require('../db/database');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(120),
        allowNull: false
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: -180, max: 180 },
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: { min: -90, max: 90 },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dateTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    eventCapacity: {
        type: DataTypes.SMALLINT,
        allowNull: true,
        validate: { min: 1 }
    },
    duration: {
        type: DataTypes.TIME,

    }
}, {
    tableName: 'events', // Explicitly telling Sequelize to use the existing 'events' table
    timestamps: false,    // We already have date_time, and don't strictly need createdAt/updatedAt unless desired
    underscored: true
});

module.exports = Event;
