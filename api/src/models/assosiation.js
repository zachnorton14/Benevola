const Event = require('../models/Event');
const User = require('../models/User');
const UserAvailability = require('./UserAvailibility');

Event.belongsToMany(User, { through: Signups });
User.belongsToMany(Event, { through: Signups });

UserAvailability.belongsTo(User, {through: Schedules});
User.hasOne(UserAvailability);
