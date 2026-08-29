#!/usr/bin/env node
'use strict';

require('dotenv').config({ quiet: true });

const User = require('../src/models/User');

/* Grant or revoke the admin role.
 *
 *   npm run admin:grant  -- jane@example.com
 *   npm run admin:revoke -- jane@example.com
 *   npm run admin:list
 *
 * This lives outside the API on purpose. The self-service profile endpoint
 * refuses to change `role`, so there is deliberately no way to promote
 * yourself over HTTP: somebody with database access has to do it.
 */

const [, , action, identifier] = process.argv;

const usage = () => {
  console.log(`
Usage:
  node scripts/make-admin.js grant  <email-or-username>
  node scripts/make-admin.js revoke <email-or-username>
  node scripts/make-admin.js list
`);
};

(async () => {
  try {
    if (action === 'list') {
      const admins = await User.findAll({ where: { role: 'admin' } });
      if (admins.length === 0) {
        console.log('No administrators yet. Grant one with:\n  npm run admin:grant -- you@example.com');
      } else {
        console.log(`${admins.length} administrator(s):`);
        for (const a of admins) console.log(`  ${a.username.padEnd(18)} ${a.email}`);
      }
      process.exit(0);
    }

    if (!['grant', 'revoke'].includes(action) || !identifier) {
      usage();
      process.exit(1);
    }

    const key = identifier.includes('@') ? 'email' : 'username';
    const user = await User.findOne({ where: { [key]: identifier } });

    if (!user) {
      console.error(`No user with ${key} "${identifier}".`);
      console.error('Note: organizations cannot be administrators, only volunteer accounts.');
      process.exit(1);
    }

    const role = action === 'grant' ? 'admin' : 'user';

    if (user.role === role) {
      console.log(`${user.username} is already ${role === 'admin' ? 'an administrator' : 'a regular user'}. Nothing to do.`);
      process.exit(0);
    }

    user.role = role;
    await user.save();

    console.log(
      action === 'grant'
        ? `${user.username} (${user.email}) is now an administrator.`
        : `${user.username} (${user.email}) is no longer an administrator.`
    );
    console.log('They will need to log out and back in for the change to take effect.');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
