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
        // needs to be reuqired later, disabled for testing fe -> be communication
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING(120),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    capacity: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: { min: 1 }
    },
    time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    duration: {
        type: DataTypes.TIME,
        allowNull: false
    },
    tags: {
        // arrays are exclusive to PosgreSQL, I think we are using SQLlite
        //type: DataTypes.ARRAY(DataTypes.STRING),
        // trying out json for now
        type: DataTypes.STRING,
        allowNull: true,
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
        // need to find a good way to store image, do we upload in frontend maybe, then store url?
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'events', // Explicitly telling Sequelize to use the existing 'events' table
    timestamps: true,    // We already have date_time, and don't strictly need createdAt/updatedAt unless desired
                         // Update: its easiest for a user to submit everything in one form, so I changed this to true - owen 12/25
    underscored: true
});

module.exports = Event;
