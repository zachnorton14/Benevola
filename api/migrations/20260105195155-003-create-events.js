"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("events", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      // underscored: true => organizationId becomes organization_id in the DB
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "organizations", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      title: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      // minutes
      duration: {
        type: Sequelize.SMALLINT,
        allowNull: true,
      },

      address: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },

      latitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      longitude: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      image: {
        type: Sequelize.STRING,
        allowNull: true,
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

    await queryInterface.addConstraint("events", {
      fields: ["latitude"],
      type: "check",
      name: "ck_events_latitude_range",
      where: {
        latitude: { [Sequelize.Op.between]: [-90, 90] },
      },
    });

    await queryInterface.addConstraint("events", {
      fields: ["longitude"],
      type: "check",
      name: "ck_events_longitude_range",
      where: {
        longitude: { [Sequelize.Op.between]: [-180, 180] },
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("events");
  },
};
