"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("user_availabilities", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      day_of_week: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });


    await queryInterface.addConstraint("user_availabilities", {
      fields: ["day_of_week"],
      type: "check",
      name: "ck_user_availabilities_day_of_week_range",
      where: {
        day_of_week: { [Sequelize.Op.between]: [0, 6] },
      },
    });

    await queryInterface.addConstraint("user_availabilities", {
      fields: ["start_time", "end_time"],
      type: "check",
      name: "ck_user_availabilities_time_order",
      where: Sequelize.literal("end_time > start_time"),
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("user_availabilities");
  },
};