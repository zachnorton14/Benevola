const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const EventAttendance = sequelize.define("Attendance", {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  eventId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
}, {
  tableName: "event_attendees",
  timestamps: true, // when this relationship was created. like when a user joins an event
  underscored: true,
});

module.exports = EventAttendance;