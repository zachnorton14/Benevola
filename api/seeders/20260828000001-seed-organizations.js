'use strict';

const bcrypt = require('bcryptjs');

/* Six North Carolina organizations, each with a working login.
 *
 * These are invented. None of them is a real charity, and the site says so —
 * see the standing notice in the footer and the "Sample" tag on every event
 * page. If you ever seed a public database, keep that labelling.
 *
 * Every seeded account shares one password so the dataset is usable for demos
 * and manual testing. That is fine locally and a bad idea anywhere public:
 * anyone who reads this file can sign in as any of these organizations.
 */

const DEMO_PASSWORD = 'demopass123';

/* picsum.photos serves Unsplash photography under a free licence and returns a
   stable image for a given seed, so an organization keeps the same picture
   across reseeds instead of shuffling. Needs an internet connection.

   The images are not topical. If you want a photograph that matches the cause,
   swap the URL for a specific one — https://images.unsplash.com/photo-<id> is
   free to hotlink under the Unsplash licence. */
const banner = seed => `https://picsum.photos/seed/${seed}-banner/1600/500`;
const icon   = seed => `https://picsum.photos/seed/${seed}-icon/300/300`;

const ORGS = [
  {
    slug: 'neuse-current',
    name: 'Neuse Current Coalition',
    email: 'hello@neusecurrent.org',
    description:
      'We look after the Neuse and the creeks that feed it, from Falls Lake down through Johnston County. Most of the work is hands-on: pulling debris out of the water, replanting washed-out banks, and sampling water quality month to month.\nNo experience needed for any of it. We bring the gloves, the waders and the coffee.',
    phone: '+1 919 555 0142',
    address: 'Raleigh, NC',
  },
  {
    slug: 'tarheel-table',
    name: 'Tarheel Table',
    email: 'volunteer@tarheeltable.org',
    description:
      'A food rescue and pantry network across Wake County, moving surplus from grocers and farms to about 1,100 households a week. Volunteers sort donations, pack boxes and help families through the shop on distribution days.\nShifts are short and social. Come once, or come every week.',
    phone: '+1 919 555 0188',
    address: 'Raleigh, NC',
  },
  {
    slug: 'piedmont-paws',
    name: 'Piedmont Paws Collective',
    email: 'team@piedmontpaws.org',
    description:
      'A foster-based rescue for dogs and cats waiting on permanent homes in the Triangle. We need walkers, socialisers, transport drivers, and people willing to sit quietly with a nervous animal until it decides you are safe.',
    phone: '+1 919 555 0119',
    address: 'Durham, NC',
  },
  {
    slug: 'bull-city-readers',
    name: 'Bull City Book Buddies',
    email: 'contact@bullcitybuddies.org',
    description:
      'Free after-school reading support for students in grades 2 to 8 across Durham Public Schools. Volunteers are paired with the same student for a whole term, because consistency turns out to be most of what makes it work.\nTraining is provided. A background check is required before your first session.',
    phone: '+1 919 555 0173',
    address: 'Durham, NC',
  },
  {
    slug: 'blue-ridge-crew',
    name: 'Blue Ridge Trail Crew',
    email: 'crew@blueridgecrew.org',
    description:
      'Trail maintenance in the mountains — waterbars, steps, brush cutting and storm damage on the paths around Asheville and the High Country. Physical work outdoors, in most weathers, with tools we teach you to use on the day.',
    phone: '+1 828 555 0164',
    address: 'Asheville, NC',
  },
  {
    slug: 'cape-fear-rebuild',
    name: 'Cape Fear Rebuild',
    email: 'hello@capefearrebuild.org',
    description:
      'Storm recovery and home repair along the southeastern coast: roofing, drywall, ramps for neighbours who cannot manage steps any more. Skilled trades are welcome and so is anyone willing to carry, sweep and hold the other end.',
    phone: '+1 910 555 0155',
    address: 'Wilmington, NC',
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    /* Re-running the seeder must not double the data. Anything already here
       by email is left alone rather than inserted again. */
    const existing = await queryInterface.sequelize.query(
      'SELECT email FROM organizations WHERE email IN (:emails)',
      { type: Sequelize.QueryTypes.SELECT, replacements: { emails: ORGS.map(o => o.email) } }
    );
    const seeded = new Set(existing.map(o => o.email));
    const fresh = ORGS.filter(o => !seeded.has(o.email));
    if (!fresh.length) return;

    // One hash reused across the seed data: these accounts share a password,
    // so there is nothing gained by salting each one separately.
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

    await queryInterface.bulkInsert(
      'organizations',
      fresh.map(o => ({
        name: o.name,
        email: o.email,
        description: o.description,
        phone: o.phone,
        address: o.address,
        password_hash: passwordHash,
        banner_img: banner(o.slug),
        icon_img: icon(o.slug),
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('organizations', {
      email: { [Sequelize.Op.in]: ORGS.map(o => o.email) },
    });
  },
};
