const User = require("./User");
const Event = require("./Event");
const Tag = require("./Tag");
const EventTag = require("./EventTag");
const Attendance = require("./Attendance")
const Organization = require("./Organization");
const UserAvailability = require("./UserAvailibility");

Organization.hasMany(Event, { 
  foreignKey: { name: "organizationId", allowNull: false },
  onDelete: "CASCADE", 
});
Event.belongsTo(Organization, { 
  foreignKey: { name: "organizationId", allowNull: false },
});

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

Event.belongsToMany(Tag, {
  through: EventTag,
  foreignKey: "eventId"
});
Tag.belongsToMany(Event, {
  through: EventTag,
  foreignKey: "tagId"
});

User.hasMany(UserAvailability, { foreignKey: "userId" });
UserAvailability.belongsTo(User, { foreignKey: "userId" });


module.exports = { User, Event, Tag, EventTag, Attendance, Organization, UserAvailability };