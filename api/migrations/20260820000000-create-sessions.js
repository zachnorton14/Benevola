"use strict";

/* Session storage, replacing Redis.

   The shape here is not ours to choose: it must match the model
   connect-session-sequelize defines internally (lib/model.js) — sid as a
   36-char primary key, plus expires and data. Note the camelCase timestamps:
   the rest of our models set `underscored: true` individually, but the session
   model is defined by the library without it, so it expects "createdAt" and
   "updatedAt" rather than created_at/updated_at.

   Creating the table here rather than calling store.sync() at boot keeps DDL
   out of the request path — on serverless that would otherwise run on every
   cold start. */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Sessions", {
      sid: {
        type: Sequelize.STRING(36),
        primaryKey: true,
        allowNull: false,
      },

      expires: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      data: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Expired-session cleanup filters on this column.
    await queryInterface.addIndex("Sessions", ["expires"], {
      name: "ix_sessions_expires",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Sessions");
  },
};
