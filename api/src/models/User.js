const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const User = sequelize.define("User", {
    id: { 
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: { 
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    displayName: {
        type: DataTypes.STRING(80),
        allowNull: true,
    },
    profilePic: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "user",
        validate: { isIn: [["user", "admin"]] }
    }
}, {
    tableName: "users",
    timestamps: true,
    underscored: true
})

module.exports = User;