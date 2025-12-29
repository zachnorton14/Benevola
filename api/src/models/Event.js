const { DataTypes } = require('sequelize');
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
    title: {
        type: DataTypes.STRING(120),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
    },
    capacity: {
        type: DataTypes.INTEGER, 
    },
    startTime: {
        type: DataTypes.DATE,
    },
    duration: {         // length of event in minutes
        type: DataTypes.SMALLINT,
    },
    tags: {
        type: DataTypes.STRING,
    },
    address: {           // if leaflet fails and for screenreaders
        type: DataTypes.STRING(150),
    },
    latitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: -90, max: 90 },
    },
    longitude: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: { min: -180, max: 180 },
    },
    image: {
        type: DataTypes.STRING,
    }
}, {
    tableName: 'events', // Explicitly telling Sequelize to use the existing 'events' table
    timestamps: true,
    underscored: true
});

module.exports = Event;
