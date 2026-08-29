'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('password_resets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },

      // Users and organizations are separate tables, so a reset has to say
      // which one it belongs to. No FK for that reason.
      principal_kind: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },

      principal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      // SHA-256 of the token we emailed. The raw token is never stored, so a
      // leaked database still cannot be used to reset anybody's password.
      token_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      // Set once redeemed, so a link cannot be replayed.
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('password_resets', ['principal_kind', 'principal_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('password_resets');
  },
};
