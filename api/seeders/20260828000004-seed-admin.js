'use strict';

const bcrypt = require('bcryptjs');

/* One administrator, so the admin role is testable straight after seeding.
 *
 * Admins are volunteer accounts carrying role = 'admin'. They own the shared
 * tag vocabulary and can moderate any organization's content. There is no way
 * to become one over HTTP — the profile endpoint refuses to change `role` — so
 * promotion happens here or through `npm run admin:grant`.
 *
 * This account's password is in this file, which is fine locally and not fine
 * on a public deployment. Before seeding anything public, change it here or
 * delete this seeder and promote a real account with `npm run admin:grant`.
 */

const ADMIN = {
  username: 'site_admin',
  email: 'admin@benevola.test',
  displayName: 'Site Admin',
  password: 'demopass123',
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    /* Exactly one admin, and re-running must not create a second. */
    const present = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email = :email OR role = :role',
      {
        type: Sequelize.QueryTypes.SELECT,
        replacements: { email: ADMIN.email, role: 'admin' },
      }
    );
    if (present.length) return;

    const passwordHash = await bcrypt.hash(ADMIN.password, 12);

    await queryInterface.bulkInsert('users', [{
      username: ADMIN.username,
      email: ADMIN.email,
      display_name: ADMIN.displayName,
      password_hash: passwordHash,
      profile_pic: `https://i.pravatar.cc/300?u=${ADMIN.username}`,
      role: 'admin',
      created_at: now,
      updated_at: now,
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ADMIN.email });
  },
};
