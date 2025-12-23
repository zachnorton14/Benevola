Organization.hasMany(Event, { foreignKey: "organizationId" });
Event.belongsTo(Organization, { foreignKey: "organizationId" });

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

User.hasMany(UserAvailability, { foreignKey: "userId" });
UserAvailability.belongsTo(User, { foreignKey: "userId" });


module.exports = { User, Event, Attendance };