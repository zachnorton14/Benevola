"use strict";

/* The forgot-password flow was removed before launch: there was no mail
   transport wired up, so in production the endpoint minted a token, returned
   200 and sent nothing. A reset link the visitor never receives is worse than
   no reset link at all, because it looks like it worked.

   The table goes with it. `down` recreates it exactly as
   20260812000000-create-password-resets left it, so restoring the feature is
   a rollback plus the route code from git history. */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable("password_resets");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable("password_resets", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      principal_kind: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      principal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      token_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      used_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex("password_resets", ["principal_kind", "principal_id"]);
  },
};
