const { DataTypes } = require("sequelize");
const sequelize = require("../db/database");

const Tag = sequelize.define("Tag", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    slug: {     // a slug is basically a unique readable identifier for this tag meant for querying
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: { msg: "Slug cannot be empty" },
            is: {
                args: /^[a-z0-9-]+$/,
                msg: 'Slug must contain only lowercase letters, numbers, and hyphens',
            }
        }
    }
}, {
    tableName: "tags",
    timestamps: false,
});

module.exports = Tag;