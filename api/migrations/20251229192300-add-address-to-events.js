'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("events", "address", {
      type: Sequelize.STRING(150),
      defaultValue: "Unknown", // required if existing rows exist
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("events", "address");
  },
};
