const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const EventTag = sequelize.define("EventTag", {
    eventId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true 
    },
}, {
    tableName: "event_tags",
    timestamps: false,
    underscored: true,
});

module.exports = EventTag;