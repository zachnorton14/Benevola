'use strict';

/* Twenty events across the next six months, all in North Carolina.
 *
 * The spread matters. A demo with four events in the same fortnight looks
 * abandoned by month two; this one keeps the listing populated for half a year
 * and gives the date filters a real range to work against.
 *
 * DATES ARE COMPUTED WHEN THE SEEDER RUNS, not when the file is read. Six
 * months after you seed, everything here is in the past and the site looks
 * empty again. Reseed, or shift the dates, before that happens.
 *
 * Addresses are real North Carolina streets and parks so the map and the
 * distance filter behave, but no event is real and none of the organizations
 * exist. The footer notice and the "Sample" tag on every event page are what
 * keep that honest — do not remove them from a public deployment.
 */

const DAY = 24 * 60 * 60 * 1000;

/** `days` from the moment of seeding, at a fixed local hour. */
const at = (days, hour) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};

/* Hero photographs, one per event, chosen to match what the event actually
   is. Every one is in the PUBLIC DOMAIN on Wikimedia Commons — nothing to
   license and no credit line owed — and served from upload.wikimedia.org,
   which permits hotlinking.

   Two rules if you swap one. Wikimedia renders thumbnails only at a fixed set
   of widths, so you cannot just edit the number in the URL; copy the URL
   Commons gives you. And check the licence on the file page — plenty of
   Commons images are CC BY or CC BY-SA, which oblige you to credit the
   photographer somewhere a visitor can see it. */
const HERO = {
  crabtree:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/September_15%2C_2012_Trash_collected_at_Anacosta_River_cleanup_%288165198795%29.jpg/1280px-September_15%2C_2012_Trash_collected_at_Anacosta_River_cleanup_%288165198795%29.jpg',
  boxpack:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/DHS_Secretary_Alejandro_Mayorkas_Volunteers_at_Capital_Area_Food_Bank_%2852519257457%29.jpg/1280px-DHS_Secretary_Alejandro_Mayorkas_Volunteers_at_Capital_Area_Food_Bank_%2852519257457%29.jpg',
  dogwalk:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Dog_Walking_in_Cache_Valley_%2851202415647%29.jpg/1280px-Dog_Walking_in_Cache_Valley_%2851202415647%29.jpg',
  reading:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Adopt-a-School_reading_program_100209-N-CM124-004.jpg/1280px-Adopt-a-School_reading_program_100209-N-CM124-004.jpg',
  mstrepair:
    'https://upload.wikimedia.org/wikipedia/commons/0/01/Removing_logs_from_Multnomah_Falls_Return_Trail_April_2018_%2840656142154%29.jpg',
  rampbuild:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Homes_for_Wounded_Warriors_120726-M-SP892-016.jpg/1280px-Homes_for_Wounded_Warriors_120726-M-SP892-016.jpg',
  fallslake:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/US_Army_51701_Englebright_Lake_cleans_up_for_National_Public_Lands_Day%2C_California_Coastal_Cleanup_Day.jpg/1280px-US_Army_51701_Englebright_Lake_cleans_up_for_National_Public_Lands_Day%2C_California_Coastal_Cleanup_Day.jpg',
  produce:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/2016_Feds_Feed_Families_-_Kickoff_%2820160617-OSEC-LSC-0260%29.jpg/1280px-2016_Feds_Feed_Families_-_Kickoff_%2820160617-OSEC-LSC-0260%29.jpg',
  kittens:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/FEMA_-_34985_-_Rescued_cats_in_Kansas.jpg/1280px-FEMA_-_34985_-_Rescued_cats_in_Kansas.jpg',
  summerread:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/%27Have_book%2C_will_travel%27%2C_reading_program_shows_children_summer_is_no_bummer_130716-M-OB827-014.jpg/1280px-%27Have_book%2C_will_travel%27%2C_reading_program_shows_children_summer_is_no_bummer_130716-M-OB827-014.jpg',
  waterbar:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/20150608-RD-ST-0012_%2818710585756%29.jpg/1280px-20150608-RD-ST-0012_%2818710585756%29.jpg',
  debris:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/%28Hurricane_Katrina-Hurricane_Rita%29_Cameron%2C_LA%2C_11-11-05_--_AmeriCorps_volunteers_Greg_Lucid%2C_Komal_Soin%2C_Kelly_Asplin%2C_%26_Casey_Schoemeberger_pile_debris_from_a_yard_in_their_truck_-_DPLA_-_7f032bfe522f890d8462efccb707d5e2.jpg/1280px-thumbnail.jpg',
  planting:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Students_plant_Doug_fir_seedlings_in_southwest_Oregon_%2826388917597%29.jpg/1280px-Students_plant_Doug_fir_seedlings_in_southwest_Oregon_%2826388917597%29.jpg',
  mobilepantry:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/DHS_Secretary_Alejandro_Mayorkas_Volunteers_at_Capital_Area_Food_Bank_%2852519730986%29.jpg/1280px-DHS_Secretary_Alejandro_Mayorkas_Volunteers_at_Capital_Area_Food_Bank_%2852519730986%29.jpg',
  adoption:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Blue_brindle_dog_looking_on_a_fence.jpg/1280px-Blue_brindle_dog_looking_on_a_fence.jpg',
  training:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Various_law_enforcement_explorers_standing_around_a_classroom.jpg/1280px-Various_law_enforcement_explorers_standing_around_a_classroom.jpg',
  brushcut:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/20170522-FS-Manti-La_Sal_NF-ET5A9825_%2834894450952%29.jpg/1280px-20170522-FS-Manti-La_Sal_NF-ET5A9825_%2834894450952%29.jpg',
  repairday:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/20150608-RD-ST-0011_%2818549168880%29.jpg/1280px-20150608-RD-ST-0011_%2818549168880%29.jpg',
  sampling:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Agriculture_Research_Service_%28ARS%29_%288412893122%29.jpg/1280px-Agriculture_Research_Service_%28ARS%29_%288412893122%29.jpg',
  holidaymeal:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Cherry_Point_Commissary_donates_more_than_30%2C000_lbs._to_food_bank_140702-M-SR938-031.jpg/1280px-Cherry_Point_Commissary_donates_more_than_30%2C000_lbs._to_food_bank_140702-M-SR938-031.jpg',
};

const EVENTS = [
  {
    org: 'hello@neusecurrent.org',
    title: 'Crabtree Creek Clean-Up',
    seed: 'crabtree',
    description:
      'A morning pulling litter and storm debris off the banks of Crabtree Creek between Umstead and the greenway bridge.\nWe supply gloves, grabbers, bags and waders. Wear boots you do not mind ruining and bring a water bottle.',
    capacity: 14, duration: 180, days: 4, hour: 9,
    address: 'Crabtree Creek Greenway, Raleigh, NC 27612',
    lat: 35.8235, lng: -78.6669,
    tags: ['environment', 'outdoor', 'hands-on', 'one-time', 'beginner-friendly'],
  },
  {
    org: 'volunteer@tarheeltable.org',
    title: 'Saturday Box Packing',
    seed: 'boxpack',
    description:
      'Assembly-line packing of weekend food boxes for families with school-age children. Roughly 400 boxes across the shift.\nStanding work, indoors, music on. Nothing over 20 pounds, and there are seated roles for anyone who needs one.',
    capacity: 30, duration: 210, days: 8, hour: 9,
    address: '1201 Corporation Pkwy, Raleigh, NC 27610',
    lat: 35.7621, lng: -78.5849,
    tags: ['food-security', 'indoor', 'hands-on', 'ongoing', 'beginner-friendly'],
  },
  {
    org: 'team@piedmontpaws.org',
    title: 'Weekend Dog Walking',
    seed: 'dogwalk',
    description:
      'Walk and socialise dogs waiting on foster placements. Two loops of the park with one dog each, then twenty minutes of quiet handling back at the kennels.\nWe match you to a dog that suits your experience. First-timers always get an easy one.',
    capacity: 8, duration: 120, days: 12, hour: 11,
    address: '3801 Hillsborough Rd, Durham, NC 27705',
    lat: 35.9998, lng: -78.9482,
    tags: ['animal-welfare', 'outdoor', 'hands-on', 'short-term', 'beginner-friendly'],
  },
  {
    org: 'contact@bullcitybuddies.org',
    title: 'After-School Reading Partners',
    seed: 'reading',
    description:
      'One hour a week reading with the same student through the term. You are not teaching phonics: you are the adult who turns up and listens, which turns out to matter more.\nTraining and materials provided at the first session. A background check is required before you start.',
    capacity: 16, duration: 60, days: 17, hour: 16,
    address: '2601 Fayetteville St, Durham, NC 27707',
    lat: 35.9612, lng: -78.9021,
    tags: ['education', 'tutoring', 'children', 'youth', 'long-term'],
  },
  {
    org: 'crew@blueridgecrew.org',
    title: 'Mountains-to-Sea Trail Repair',
    seed: 'mstrepair',
    description:
      'Rebuilding tread and drainage on a washed-out half-mile of the MST above Bent Creek. Expect mattocks, rock bars and a long walk in.\nWe teach the tools on site. Bring lunch, water and boots with ankle support.',
    capacity: 12, duration: 300, days: 22, hour: 8,
    address: 'Bent Creek Trailhead, Asheville, NC 28806',
    lat: 35.4934, lng: -82.6198,
    tags: ['environment', 'outdoor', 'manual-labor', 'experienced-volunteers', 'one-time'],
  },
  {
    org: 'hello@capefearrebuild.org',
    title: 'Porch Ramp Build',
    seed: 'rampbuild',
    description:
      'Building a wheelchair ramp for a neighbour who has not been able to leave her house unaided since the spring.\nOne experienced carpenter leads; everyone else measures, carries, holds and screws. No tools of your own required.',
    capacity: 10, duration: 360, days: 28, hour: 8,
    address: '418 Castle St, Wilmington, NC 28401',
    lat: 34.2298, lng: -77.9487,
    tags: ['housing-homelessness', 'manual-labor', 'hands-on', 'people-with-disabilities', 'one-time'],
  },
  {
    org: 'hello@neusecurrent.org',
    title: 'Falls Lake Shoreline Litter Sweep',
    seed: 'fallslake',
    description:
      'Working a marked stretch of shoreline with bags and grabbers, clearing what the boat traffic and the last high water left behind.\nSteady, sociable work on uneven ground. We run a boat out to the stretches you cannot reach on foot.',
    capacity: 16, duration: 240, days: 34, hour: 9,
    address: 'Falls Lake State Rec Area, Wake Forest, NC 27587',
    lat: 36.0193, lng: -78.6836,
    tags: ['environment', 'outdoor', 'administrative-support', 'one-time'],
  },
  {
    org: 'volunteer@tarheeltable.org',
    title: 'Weekday Produce Sort',
    seed: 'produce',
    description:
      'Sorting rescued produce from Wake County grocers into what goes out today, what freezes and what composts.\nCold room, so dress for it. Two-hour shift, easy to fit around a workday.',
    capacity: 12, duration: 120, days: 41, hour: 10,
    address: '1100 SE Maynard Rd, Cary, NC 27511',
    lat: 35.7745, lng: -78.7712,
    tags: ['food-security', 'indoor', 'hands-on', 'ongoing', 'short-term'],
  },
  {
    org: 'team@piedmontpaws.org',
    title: 'Kitten Socialising Afternoon',
    seed: 'kittens',
    description:
      'Handling and playing with under-socialised kittens so they are ready to be adopted rather than frightened of hands.\nSitting-down work. Genuinely one of the more pleasant afternoons available anywhere.',
    capacity: 6, duration: 150, days: 48, hour: 14,
    address: '5106 Chapel Hill Rd, Durham, NC 27707',
    lat: 35.9402, lng: -78.9711,
    tags: ['animal-welfare', 'indoor', 'hands-on', 'beginner-friendly', 'short-term'],
  },
  {
    org: 'contact@bullcitybuddies.org',
    title: 'Summer Reading Kickoff',
    seed: 'summerread',
    description:
      'A single morning helping run our summer sign-up: check-in desk, book selection, and reading one-to-one with whoever turns up.\nA good way to see what the tutoring programme is like before committing to a term.',
    capacity: 20, duration: 180, days: 56, hour: 10,
    address: '300 N Roxboro St, Durham, NC 27701',
    lat: 35.9975, lng: -78.8983,
    tags: ['education', 'children', 'event-support', 'one-time', 'beginner-friendly'],
  },
  {
    org: 'crew@blueridgecrew.org',
    title: 'Rocky Knob Shelter Repair',
    seed: 'waterbar',
    description:
      'Rebuilding the deck and benches of the trail shelter above Rocky Knob, which took a beating over the winter.\nHammers, saws and a great deal of measuring twice. We bring the tools and someone who knows how to use them.',
    capacity: 10, duration: 300, days: 64, hour: 8,
    address: 'Rocky Knob Park, Boone, NC 28607',
    lat: 36.2019, lng: -81.6304,
    tags: ['environment', 'outdoor', 'manual-labor', 'experienced-volunteers', 'one-time'],
  },
  {
    org: 'hello@capefearrebuild.org',
    title: 'Storm Debris Clear-Out',
    seed: 'debris',
    description:
      'Clearing fallen limbs and damaged fencing from four properties whose owners cannot do it themselves.\nChainsaw certified? Tell us when you sign up. Everyone else hauls, stacks and sweeps.',
    capacity: 24, duration: 240, days: 73, hour: 8,
    address: '1900 Oleander Dr, Wilmington, NC 28403',
    lat: 34.2145, lng: -77.9021,
    tags: ['community-development', 'outdoor', 'manual-labor', 'seniors', 'one-time'],
  },
  {
    org: 'hello@neusecurrent.org',
    title: 'Riverbank Tree Planting',
    seed: 'planting',
    description:
      'Planting willow and river birch along a stretch of bank that washed out last winter. Roots hold the soil and shade cools the water, so this is slow work that pays off for years.\nWe demonstrate the technique at the start. Suitable for families with older children.',
    capacity: 25, duration: 240, days: 82, hour: 9,
    address: 'Neuse River Access, Smithfield, NC 27577',
    lat: 35.5085, lng: -78.3394,
    tags: ['environment', 'outdoor', 'manual-labor', 'families', 'one-time'],
  },
  {
    org: 'volunteer@tarheeltable.org',
    title: 'Mobile Pantry Run',
    seed: 'mobilepantry',
    description:
      'Riding along on the van route through western Wake County: loading, setting up at each stop, and handing out.\nYou will meet the people the pantry actually serves, which changes how the sorting shifts feel afterwards.',
    capacity: 8, duration: 300, days: 92, hour: 8,
    address: '1000 Center St, Apex, NC 27502',
    lat: 35.7327, lng: -78.8503,
    tags: ['food-security', 'outdoor', 'hands-on', 'families', 'ongoing'],
  },
  {
    org: 'team@piedmontpaws.org',
    title: 'Adoption Day Support',
    seed: 'adoption',
    description:
      'Running the adoption stand at the Capital Boulevard pet supply: greeting, paperwork, and holding leads while families decide.\nSociable and busy. No animal handling experience needed for most of the roles.',
    capacity: 12, duration: 300, days: 103, hour: 10,
    address: '4601 Capital Blvd, Raleigh, NC 27604',
    lat: 35.8564, lng: -78.5769,
    tags: ['animal-welfare', 'event-support', 'indoor', 'one-time', 'beginner-friendly'],
  },
  {
    org: 'contact@bullcitybuddies.org',
    title: 'Tutor Training Morning',
    seed: 'training',
    description:
      'The three-hour session every new reading partner takes before being matched with a student. Covers the method, the safeguarding rules and what to do on a bad day.\nRequired once. Bring nothing but a pen.',
    capacity: 30, duration: 180, days: 115, hour: 9,
    address: '804 Old Fayetteville St, Durham, NC 27701',
    lat: 35.9856, lng: -78.9089,
    tags: ['education', 'teaching', 'mentoring', 'indoor', 'one-time'],
  },
  {
    org: 'crew@blueridgecrew.org',
    title: 'Parkway Brush Cutting',
    seed: 'brushcut',
    description:
      'Cutting back rhododendron and briar closing in on two miles of connector trail near milepost 393.\nLoppers and hand saws only, no power tools. Steady work, good company, spectacular views.',
    capacity: 16, duration: 270, days: 128, hour: 9,
    address: 'Blue Ridge Pkwy MP 393, Asheville, NC 28805',
    lat: 35.5289, lng: -82.5121,
    tags: ['environment', 'outdoor', 'manual-labor', 'hands-on', 'one-time'],
  },
  {
    org: 'hello@capefearrebuild.org',
    title: 'Neighbour Repair Day',
    seed: 'repairday',
    description:
      'Six small jobs across one Leland street in a day: a handrail, two screen doors, a leaking gutter and whatever else we find.\nBring a cordless drill if you have one. If you do not, bring yourself.',
    capacity: 18, duration: 300, days: 142, hour: 8,
    address: '1029 Village Rd NE, Leland, NC 28451',
    lat: 34.2563, lng: -78.0447,
    tags: ['housing-homelessness', 'community-development', 'manual-labor', 'seniors', 'one-time'],
  },
  {
    org: 'hello@neusecurrent.org',
    title: 'Water Quality Sampling Day',
    seed: 'sampling',
    description:
      'Collecting and logging samples at eight points along the river inside the city. Training takes twenty minutes and the kit is provided.\nThe results go into the state database, so the care you take with the labels genuinely matters.',
    capacity: 12, duration: 210, days: 158, hour: 9,
    address: 'Anderson Point Park, Raleigh, NC 27610',
    lat: 35.7889, lng: -78.5486,
    tags: ['environment', 'outdoor', 'technical-support', 'experienced-volunteers', 'ongoing'],
  },
  {
    org: 'volunteer@tarheeltable.org',
    title: 'Holiday Meal Assembly',
    seed: 'holidaymeal',
    description:
      'Our largest shift of the year: assembling and loading roughly 1,200 holiday meal boxes over a single long day.\nCome for the morning, the afternoon, or both. Lunch is provided, and it is a genuinely good day out.',
    capacity: 40, duration: 300, days: 174, hour: 9,
    address: '2211 New Bern Ave, Raleigh, NC 27610',
    lat: 35.7833, lng: -78.5975,
    tags: ['food-security', 'indoor', 'hands-on', 'families', 'one-time'],
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const select = sql => queryInterface.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });

    const orgs = await select('SELECT id, email FROM organizations');
    const orgId = Object.fromEntries(orgs.map(o => [o.email, o.id]));

    const missing = [...new Set(EVENTS.map(e => e.org))].filter(e => !orgId[e]);
    if (missing.length) {
      throw new Error(
        `Cannot seed events: no organization for ${missing.join(', ')}. ` +
        'Run the organization seeder first.'
      );
    }

    /* Skip anything already seeded, so running this twice does not double the
       listing. Titles are unique across this file by design. */
    const present = await queryInterface.sequelize.query(
      'SELECT title FROM events WHERE title IN (:titles)',
      { type: Sequelize.QueryTypes.SELECT, replacements: { titles: EVENTS.map(e => e.title) } }
    );
    const seeded = new Set(present.map(e => e.title));
    const fresh = EVENTS.filter(e => !seeded.has(e.title));
    if (!fresh.length) return;

    await queryInterface.bulkInsert(
      'events',
      fresh.map(e => ({
        organization_id: orgId[e.org],
        title: e.title,
        description: e.description,
        capacity: e.capacity,
        duration: e.duration,
        date: at(e.days, e.hour),
        address: e.address,
        latitude: e.lat,
        longitude: e.lng,
        image: HERO[e.seed],
        created_at: now,
        updated_at: now,
      }))
    );

    /* Attach the causes. Tag ids come from the tag seeder, so look them up by
       slug rather than assuming anything about their numbering. */
    const events = await select('SELECT id, title FROM events');
    const eventId = Object.fromEntries(events.map(e => [e.title, e.id]));

    const tags = await select('SELECT id, slug FROM tags');
    const tagId = Object.fromEntries(tags.map(t => [t.slug, t.id]));

    const unknown = [...new Set(EVENTS.flatMap(e => e.tags))].filter(s => !tagId[s]);
    if (unknown.length) {
      throw new Error(`Cannot seed events: no tag with slug ${unknown.join(', ')}.`);
    }

    const links = [];
    for (const e of fresh) {
      for (const slug of e.tags) {
        if (eventId[e.title]) links.push({ event_id: eventId[e.title], tag_id: tagId[slug] });
      }
    }
    // event_tags carries no timestamps, so insert only the two keys.
    if (links.length) await queryInterface.bulkInsert('event_tags', links);
  },

  async down(queryInterface, Sequelize) {
    const titles = EVENTS.map(e => e.title);
    const events = await queryInterface.sequelize.query(
      'SELECT id FROM events WHERE title IN (:titles)',
      { type: Sequelize.QueryTypes.SELECT, replacements: { titles } }
    );
    const ids = events.map(e => e.id);

    if (ids.length) {
      await queryInterface.bulkDelete('event_tags', { event_id: { [Sequelize.Op.in]: ids } });
      await queryInterface.bulkDelete('event_attendees', { event_id: { [Sequelize.Op.in]: ids } });
      await queryInterface.bulkDelete('events', { id: { [Sequelize.Op.in]: ids } });
    }
  },
};
