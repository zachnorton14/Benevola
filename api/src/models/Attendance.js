const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const Attendance = sequelize.define("Attendance", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  eventId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
}, {
  tableName: "event_attendees",
  timestamps: true, // when this relationship was created. like when a user joins an event
  underscored: true,
});

module.exports = Attendance;