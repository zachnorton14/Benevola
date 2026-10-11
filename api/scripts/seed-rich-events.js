const sequelize = require('../src/db/database');
const Organization = require('../src/models/Organization');
const Event = require('../src/models/Event');
const Tag = require('../src/models/Tag');
require('../src/models/associations');

const DAY = 24 * 60 * 60 * 1000;
const at = (days, hour) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const RICH_EVENTS = [
  {
    orgName: 'Paws & Care Animal Rescue',
    email: 'contact@pawsrescue.org',
    orgDesc: 'Local animal shelter and adoption center serving community animals.',
    title: 'Weekend Dog Walking & Socialization',
    description: 'Walk and socialize shelter dogs waiting on foster placements. Help exercise dogs, practice basic leash manners, and give them park time before adoption.',
    capacity: 12, duration: 120, days: 2, hour: 10,
    address: '3801 Hillsborough Rd, Durham, NC 27705',
    lat: 35.9998, lng: -78.9482,
    coverPhoto: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
    tags: ['animal-welfare', 'outdoor', 'hands-on', 'beginner-friendly']
  },
  {
    orgName: 'Paws & Care Animal Rescue',
    email: 'contact@pawsrescue.org',
    orgDesc: 'Local animal shelter and adoption center serving community animals.',
    title: 'Kitten Care & Socialization Afternoon',
    description: 'Spend an afternoon handling and playing with young rescued kittens so they build confidence and get ready for adoptive families.',
    capacity: 8, duration: 150, days: 4, hour: 14,
    address: '5106 Chapel Hill Rd, Durham, NC 27707',
    lat: 35.9402, lng: -78.9711,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/FEMA_-_34985_-_Rescued_cats_in_Kansas.jpg/1280px-FEMA_-_34985_-_Rescued_cats_in_Kansas.jpg',
    tags: ['animal-welfare', 'indoor', 'hands-on', 'beginner-friendly']
  },
  {
    orgName: 'Tar Heel Table Food Bank',
    email: 'volunteer@tarheeltable.org',
    orgDesc: 'Regional food security organization delivering meals and produce to local pantries.',
    title: 'Community Food Kitchen & Packing',
    description: 'Assembly-line packing of weekend food boxes for families with school-age children. Assist with packing non-perishables and fresh produce.',
    capacity: 30, duration: 180, days: 3, hour: 9,
    address: '1201 Corporation Pkwy, Raleigh, NC 27610',
    lat: 35.7621, lng: -78.5849,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/DHS_Secretary_Alejandro_Mayorkas_Volunteers_at_Capital_Area_Food_Bank_%2852519257457%29.jpg/1280px-DHS_Secretary_Alejandro_Mayorkas_Volunteers_at_Capital_Area_Food_Bank_%2852519257457%29.jpg',
    tags: ['food-security', 'indoor', 'hands-on', 'ongoing', 'families']
  },
  {
    orgName: 'Tar Heel Table Food Bank',
    email: 'volunteer@tarheeltable.org',
    orgDesc: 'Regional food security organization delivering meals and produce to local pantries.',
    title: 'Fresh Produce Sorting & Distribution',
    description: 'Sorting farm-fresh produce from local grocery donors into family share boxes for mobile food pantries.',
    capacity: 15, duration: 120, days: 5, hour: 10,
    address: '1100 SE Maynard Rd, Cary, NC 27511',
    lat: 35.7745, lng: -78.7712,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/2016_Feds_Feed_Families_-_Kickoff_%2820160617-OSEC-LSC-0260%29.jpg/1280px-2016_Feds_Feed_Families_-_Kickoff_%2820160617-OSEC-LSC-0260%29.jpg',
    tags: ['food-security', 'indoor', 'hands-on', 'beginner-friendly']
  },
  {
    orgName: 'Neuse River Conservancy',
    email: 'hello@neusecurrent.org',
    orgDesc: 'Environmental conservation group preserving local waterways, trails, and greenways.',
    title: 'Crabtree Creek Greenway Clean-Up',
    description: 'Join a morning riverbank cleanup pulling litter and debris from Crabtree Creek greenway trails. Gloves, grabbers, and bags provided.',
    capacity: 20, duration: 180, days: 6, hour: 9,
    address: 'Crabtree Creek Greenway, Raleigh, NC 27612',
    lat: 35.8235, lng: -78.6669,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/September_15%2C_2012_Trash_collected_at_Anacosta_River_cleanup_%288165198795%29.jpg/1280px-September_15%2C_2012_Trash_collected_at_Anacosta_River_cleanup_%288165198795%29.jpg',
    tags: ['environment', 'outdoor', 'hands-on', 'one-time', 'beginner-friendly']
  },
  {
    orgName: 'Neuse River Conservancy',
    email: 'hello@neusecurrent.org',
    orgDesc: 'Environmental conservation group preserving local waterways, trails, and greenways.',
    title: 'Riverbank Willow & Tree Planting',
    description: 'Plant native willow and birch saplings along riverbanks to prevent soil erosion and shade wildlife habitats.',
    capacity: 25, duration: 240, days: 9, hour: 9,
    address: 'Neuse River Access, Smithfield, NC 27577',
    lat: 35.5085, lng: -78.3394,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Students_plant_Doug_fir_seedlings_in_southwest_Oregon_%2826388917597%29.jpg/1280px-Students_plant_Doug_fir_seedlings_in_southwest_Oregon_%2826388917597%29.jpg',
    tags: ['environment', 'outdoor', 'manual-labor', 'families']
  },
  {
    orgName: 'Bull City Youth Mentors',
    email: 'contact@bullcitybuddies.org',
    orgDesc: 'Youth development nonprofit providing tutoring, reading partners, and career mentorship.',
    title: 'After-School Reading Partners',
    description: 'Read one-on-one with elementary school students after school. Inspire confidence and foster a love of reading.',
    capacity: 16, duration: 60, days: 7, hour: 16,
    address: '2601 Fayetteville St, Durham, NC 27707',
    lat: 35.9612, lng: -78.9021,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Adopt-a-School_reading_program_100209-N-CM124-004.jpg/1280px-Adopt-a-School_reading_program_100209-N-CM124-004.jpg',
    tags: ['education', 'tutoring', 'children', 'youth', 'long-term']
  },
  {
    orgName: 'Bull City Youth Mentors',
    email: 'contact@bullcitybuddies.org',
    orgDesc: 'Youth development nonprofit providing tutoring, reading partners, and career mentorship.',
    title: 'STEM & Homework Club Tutor',
    description: 'Help middle school students with math, science, and reading homework in a supportive group environment.',
    capacity: 12, duration: 90, days: 10, hour: 15,
    address: '300 N Roxboro St, Durham, NC 27701',
    lat: 35.9975, lng: -78.8983,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Various_law_enforcement_explorers_standing_around_a_classroom.jpg/1280px-Various_law_enforcement_explorers_standing_around_a_classroom.jpg',
    tags: ['education', 'tutoring', 'youth', 'teaching']
  },
  {
    orgName: 'Blue Ridge Trail Crew',
    email: 'crew@blueridgecrew.org',
    orgDesc: 'Volunteer trail builders repairing hiking paths and mountain parks across North Carolina.',
    title: 'Mountains-to-Sea Trail Repair',
    description: 'Rebuild trail tread and drainage on washed-out sections of the MST. Learn trail building tools on site.',
    capacity: 12, duration: 300, days: 11, hour: 8,
    address: 'Bent Creek Trailhead, Asheville, NC 28806',
    lat: 35.4934, lng: -82.6198,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Removing_logs_from_Multnomah_Falls_Return_Trail_April_2018_%2840656142154%29.jpg',
    tags: ['environment', 'outdoor', 'manual-labor', 'experienced-volunteers']
  },
  {
    orgName: 'Cape Fear Housing Rebuild',
    email: 'hello@capefearrebuild.org',
    orgDesc: 'Community rebuilding initiative repairing homes and building accessibility ramps for neighbors.',
    title: 'Senior Home Accessibility Ramp Build',
    description: 'Construct a wooden wheelchair ramp for a senior neighbor needing safe home access. Led by experienced carpenters.',
    capacity: 10, duration: 360, days: 14, hour: 8,
    address: '418 Castle St, Wilmington, NC 28401',
    lat: 34.2298, lng: -77.9487,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Homes_for_Wounded_Warriors_120726-M-SP892-016.jpg/1280px-Homes_for_Wounded_Warriors_120726-M-SP892-016.jpg',
    tags: ['housing-homelessness', 'manual-labor', 'hands-on', 'people-with-disabilities', 'seniors']
  },
  {
    orgName: 'Cape Fear Housing Rebuild',
    email: 'hello@capefearrebuild.org',
    orgDesc: 'Community rebuilding initiative repairing homes and building accessibility ramps for neighbors.',
    title: 'Community Repair & Yard Clean-Up',
    description: 'Help elderly homeowners with light repairs, yard maintenance, screen door replacement, and porch fixing.',
    capacity: 15, duration: 240, days: 16, hour: 9,
    address: '1029 Village Rd NE, Leland, NC 28451',
    lat: 34.2563, lng: -78.0447,
    coverPhoto: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/20150608-RD-ST-0011_%2818549168880%29.jpg/1280px-20150608-RD-ST-0011_%2818549168880%29.jpg',
    tags: ['housing-homelessness', 'community-development', 'seniors', 'manual-labor']
  }
];

async function runSeed() {
  console.log('Syncing database...');
  await sequelize.sync({ force: true });

  const allTags = [
    { name: "Children", slug: "children" },
    { name: "Youth", slug: "youth" },
    { name: "Seniors", slug: "seniors" },
    { name: "Families", slug: "families" },
    { name: "People With Disabilities", slug: "people-with-disabilities" },
    { name: "Environment", slug: "environment" },
    { name: "Education", slug: "education" },
    { name: "Health/Wellness", slug: "health-wellness" },
    { name: "Food Security", slug: "food-security" },
    { name: "Housing/Homelessness", slug: "housing-homelessness" },
    { name: "Animal Welfare", slug: "animal-welfare" },
    { name: "Community Development", slug: "community-development" },
    { name: "Social Justice", slug: "social-justice" },
    { name: "Mentoring", slug: "mentoring" },
    { name: "Tutoring", slug: "tutoring" },
    { name: "Teaching", slug: "teaching" },
    { name: "Administrative Support", slug: "administrative-support" },
    { name: "Event Support", slug: "event-support" },
    { name: "Manual Labor", slug: "manual-labor" },
    { name: "Outdoor", slug: "outdoor" },
    { name: "Indoor", slug: "indoor" },
    { name: "Hands On", slug: "hands-on" },
    { name: "One Time", slug: "one-time" },
    { name: "Ongoing", slug: "ongoing" },
    { name: "Short Term", slug: "short-term" },
    { name: "Long Term", slug: "long-term" },
    { name: "Beginner Friendly", slug: "beginner-friendly" },
    { name: "Experienced Volunteers", slug: "experienced-volunteers" }
  ];

  const dbTags = await Tag.bulkCreate(allTags);
  const tagMap = new Map(dbTags.map(t => [t.slug, t.id]));
  console.log(`Created ${dbTags.length} category tags.`);

  let seededCount = 0;
  for (const item of RICH_EVENTS) {
    let [org] = await Organization.findOrCreate({
      where: { email: item.email },
      defaults: {
        name: item.orgName,
        email: item.email,
        description: item.orgDesc,
        address: item.address,
        phone: '919-555-0100'
      }
    });

    const ev = await Event.create({
      organizationId: org.id,
      title: item.title,
      description: item.description,
      capacity: item.capacity,
      duration: item.duration,
      date: at(item.days, item.hour),
      address: item.address,
      latitude: item.lat,
      longitude: item.lng,
      coverPhoto: item.coverPhoto
    });

    const tagIds = item.tags.map(s => tagMap.get(s)).filter(Boolean);
    if (tagIds.length) {
      await ev.setTags(tagIds);
    }
    seededCount++;
  }

  console.log(`Successfully seeded ${seededCount} diverse volunteer events!`);
}

runSeed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
