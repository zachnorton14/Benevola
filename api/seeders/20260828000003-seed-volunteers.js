'use strict';

const bcrypt = require('bcryptjs');

/* Volunteers, plus the RSVPs that make the rest of the app worth looking at.
 *
 * Without attendees every roster is empty and every event reads "all places
 * left", so the capacity meter and the organizer's roster panel cannot be seen
 * at all. The spread below is deliberate — it covers nearly-full, healthy,
 * quiet and untouched, so every state of the meter is reachable from the
 * seeded data:
 *
 *   Weekend Dog Walking          7 of 8    nearly full
 *   Kitten Socialising Afternoon 4 of 6    filling
 *   Saturday Box Packing         6 of 30   healthy
 *   Crabtree Creek Clean-Up      5 of 14   healthy
 *   Porch Ramp Build             3 of 10   quiet
 *   Riverbank Tree Planting      2 of 25   quiet
 *   everything else              0         empty-state
 *
 * Same shared password as the organizations. Local demo data only.
 */

const DEMO_PASSWORD = 'demopass123';

/* pravatar returns a consistent portrait per identifier, which suits avatars
   better than the landscape placeholders used for events. Needs the internet. */
const avatar = who => `https://i.pravatar.cc/300?u=${who}`;

const VOLUNTEERS = [
  { username: 'jane_okafor',   email: 'jane@example.com',   displayName: 'Jane Okafor' },
  { username: 'marcus_reyes',  email: 'marcus@example.com', displayName: 'Marcus Reyes' },
  { username: 'priya_shah',    email: 'priya@example.com',  displayName: 'Priya Shah' },
  { username: 'tom_lindqvist', email: 'tom@example.com',    displayName: 'Tom Lindqvist' },
  { username: 'aisha_bello',   email: 'aisha@example.com',  displayName: 'Aisha Bello' },
  { username: 'dev_ramanathan', email: 'dev@example.com',   displayName: 'Dev Ramanathan' },
  { username: 'sofia_marek',   email: 'sofia@example.com',  displayName: 'Sofia Marek' },
];

const ALL = VOLUNTEERS.map(v => v.email);

/** Event title -> the volunteers signed up for it. */
const RSVPS = {
  'Weekend Dog Walking':          ALL,
  'Kitten Socialising Afternoon': ['jane@example.com', 'priya@example.com', 'sofia@example.com', 'dev@example.com'],
  'Saturday Box Packing':         ['jane@example.com', 'marcus@example.com', 'priya@example.com', 'tom@example.com', 'aisha@example.com', 'dev@example.com'],
  'Crabtree Creek Clean-Up':      ['jane@example.com', 'marcus@example.com', 'priya@example.com', 'aisha@example.com', 'sofia@example.com'],
  'Porch Ramp Build':             ['marcus@example.com', 'tom@example.com', 'dev@example.com'],
  'Riverbank Tree Planting':      ['jane@example.com', 'tom@example.com'],
  // Every other event is left empty on purpose: the "nobody has signed on yet"
  // roster state has to be reachable too.
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const select = sql => queryInterface.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });

    /* Skip anyone already seeded, so a second run does not collide with the
       unique constraint on email. */
    const present = await queryInterface.sequelize.query(
      'SELECT email FROM users WHERE email IN (:emails)',
      { type: Sequelize.QueryTypes.SELECT, replacements: { emails: ALL } }
    );
    const seeded = new Set(present.map(u => u.email));
    const fresh = VOLUNTEERS.filter(v => !seeded.has(v.email));

    if (fresh.length) {
      const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
      await queryInterface.bulkInsert(
        'users',
        fresh.map(v => ({
          username: v.username,
          email: v.email,
          display_name: v.displayName,
          password_hash: passwordHash,
          profile_pic: avatar(v.username),
          role: 'user',
          created_at: now,
          updated_at: now,
        }))
      );
    }

    const users = await select('SELECT id, email FROM users');
    const userId = Object.fromEntries(users.map(u => [u.email, u.id]));

    const events = await select('SELECT id, title FROM events');
    const eventId = Object.fromEntries(events.map(e => [e.title, e.id]));

    /* An RSVP is a (user, event) pair, so re-running must not duplicate one.
       Read what is already there and insert only the difference. */
    const existing = await select('SELECT user_id, event_id FROM event_attendees');
    const already = new Set(existing.map(r => `${r.user_id}:${r.event_id}`));

    const rows = [];
    for (const [title, emails] of Object.entries(RSVPS)) {
      if (!eventId[title]) continue; // event seeder did not run; skip quietly
      for (const email of emails) {
        const uid = userId[email];
        if (!uid) continue;
        const key = `${uid}:${eventId[title]}`;
        if (already.has(key)) continue;
        already.add(key);
        rows.push({
          user_id: uid,
          event_id: eventId[title],
          created_at: now,
          updated_at: now,
        });
      }
    }
    if (rows.length) await queryInterface.bulkInsert('event_attendees', rows);
  },

  async down(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM users WHERE email IN (:emails)',
      { type: Sequelize.QueryTypes.SELECT, replacements: { emails: ALL } }
    );
    const ids = users.map(u => u.id);

    if (ids.length) {
      await queryInterface.bulkDelete('event_attendees', { user_id: { [Sequelize.Op.in]: ids } });
    }
    await queryInterface.bulkDelete('users', { email: { [Sequelize.Op.in]: ALL } });
  },
};
