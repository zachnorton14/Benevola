const User = require("./User");
const Event = require("./Event");
const Attendance = require("./Attendance")
const Organization = require("./Organization");
const UserAvailability = require("./UserAvailibility");

Organization.hasMany(Event, { foreignKey: "organizationId" });
Event.belongsTo(Organization, { foreignKey: "organizationId" });

User.belongsToMany(Event, {
  through: Attendance,
  foreignKey: "userId",
  otherKey: "eventId",
});

Event.belongsToMany(User, {
  through: Attendance,
  foreignKey: "eventId",
  otherKey: "userId",
});

User.hasMany(UserAvailability, { foreignKey: "userId" });
UserAvailability.belongsTo(User, { foreignKey: "userId" });


module.exports = { User, Event, Attendance, Organization, UserAvailability };