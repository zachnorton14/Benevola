const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

/* A single recorded login attempt. Rows are pruned by the limiter itself
   rather than by a scheduled job, because a serverless instance is frozen
   between requests and any timer we set would mostly never fire. */
const LoginAttempt = sequelize.define("LoginAttempt", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    key: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
}, {
    tableName: "login_attempts",
    underscored: true,
    // Only created_at matters; an attempt is never updated.
    updatedAt: false,
});

module.exports = LoginAttempt;
