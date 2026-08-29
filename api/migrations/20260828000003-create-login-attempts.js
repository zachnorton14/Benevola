"use strict";

/* One row per login attempt, so the rate limit survives what serverless does
   to memory.

   An in-process counter is the usual way to do this, and it is close to
   useless on Vercel: every cold start begins with an empty map, concurrent
   invocations do not share one, and an attacker's requests land across many
   instances. The database is the only state all instances agree on, which is
   the same reason sessions live there. */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("login_attempts", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      /* Who is being limited. Currently the client IP, taken from req.ip,
         which is only trustworthy because index.js sets `trust proxy` in
         production. Not a foreign key: an attempt is recorded before we know
         whether the account exists, and saying otherwise would leak which
         addresses are registered. */
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Every read is "attempts for this key since a cutoff", so index both.
    await queryInterface.addIndex("login_attempts", ["key", "created_at"], {
      name: "ix_login_attempts_key_created",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("login_attempts");
  },
};
