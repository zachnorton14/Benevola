"use strict";

/* events.description was STRING(255), but the field is a free-form textarea with
   no limit in the UI and no max in the zod schema — and organizations.description
   was already TEXT. SQLite hid the mismatch: it treats VARCHAR(n) as an affinity
   and ignores n, so over-length descriptions stored fine in development. Postgres
   enforces the limit, and the seeded events (up to 273 characters) fail to insert.

   Only Postgres needs the DDL. On SQLite the two types are already
   interchangeable, and changeColumn there rebuilds the whole table, which would
   mean dropping and recreating the latitude/longitude CHECK constraints for a
   change that has no effect. */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    if (queryInterface.sequelize.getDialect() !== "postgres") return;
    await queryInterface.changeColumn("events", "description", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  // Narrowing back fails if any description is longer than 255. That is
  // deliberate: the alternative is truncating rows on a rollback.
  async down(queryInterface, Sequelize) {
    if (queryInterface.sequelize.getDialect() !== "postgres") return;
    await queryInterface.changeColumn("events", "description", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },
};
