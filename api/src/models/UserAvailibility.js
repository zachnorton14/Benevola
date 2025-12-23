const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const UserAvailability = sequelize.define("UserAvailability", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  
    dayOfWeek: {
      type: DataTypes.INTEGER,   // 0 = Sunday, 1 = Monday, ...
      allowNull: false,
      validate: { min: 0, max: 6 }
    },
  
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    }
  
  }, {
    tableName: "user_availabilities",
    underscored: true,
  });

module.exports = UserAvailability