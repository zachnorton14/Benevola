const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const TokenBlacklist = sequelize.define("TokenBlacklist", {
    id: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    token: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Optimizes lookups
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    }
}, {
    tableName: "token_blacklist",
    timestamps: true,
    underscored: true
});

module.exports = TokenBlacklist;
