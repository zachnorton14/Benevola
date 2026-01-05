const User = require("./User");
const Event = require("./Event");
const Tag = require("./Tag");
const EventTag = require("./EventTag");
const EventAttendance = require("./EventAttendance")
const Organization = require("./Organization");
const UserAvailability = require("./UserAvailibility");

Organization.hasMany(Event, { 
  foreignKey: { name: "organizationId" },
  onDelete: "CASCADE", 
});
Event.belongsTo(Organization, { 
  foreignKey: { name: "organizationId"},
});

User.belongsToMany(Event, {
  through: EventAttendance,
  foreignKey: "userId",
  otherKey: "eventId",
});
Event.belongsToMany(User, {
  through: EventAttendance,
  foreignKey: "eventId",
  otherKey: "userId",
});

Event.belongsToMany(Tag, {
  through: EventTag,
  foreignKey: "eventId",
  otherKey: "tagId",
});
Tag.belongsToMany(Event, {
  through: EventTag,
  foreignKey: "tagId",
  otherKey: "eventId",
});

User.hasMany(UserAvailability, { foreignKey: "userId" });
UserAvailability.belongsTo(User, { foreignKey: "userId" });


module.exports = { User, Event, Tag, EventTag, EventAttendance, Organization, UserAvailability };