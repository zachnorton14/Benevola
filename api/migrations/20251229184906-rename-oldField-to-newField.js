'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn("events", "address", "date");
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn("events", "date", "time");
  }
};
