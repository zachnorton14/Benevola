const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const Organization = sequelize.define("Organization", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT, allowNull: true
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
    phone: { 
        type: DataTypes.STRING(30),
        allowNull: true
    },
    bannerImg: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    iconImg: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: "organizations",
    timestamps: true,
    underscored: true,
});

module.exports = Organization;