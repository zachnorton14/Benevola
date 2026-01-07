"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1) Resolve org IDs from your seeded orgs (by email is safest/unique)
    const orgEmails = [
      "contact@helpinghands.org",
      "info@greenearth.org",
      "hello@youthalliance.org",
      "support@healthpartners.org",
      "contact@artsforall.org",
      "info@techbridge.org",
      "admin@safehaven.org",
      "rescue@animalcare.org",
      "contact@globaledu.org",
      "help@vetsupport.org",
    ];

    const [orgRows] = await queryInterface.sequelize.query(
      `SELECT id, email FROM organizations WHERE email IN (${orgEmails.map(() => "?").join(",")})`,
      { replacements: orgEmails }
    );

    const emailToOrgId = new Map(orgRows.map((r) => [r.email, r.id]));

    const missingOrgs = orgEmails.filter((e) => !emailToOrgId.has(e));
    if (missingOrgs.length) {
      throw new Error(
        `Seed error: missing organizations for emails: ${missingOrgs.join(", ")}. Did you run the org seeder first?`
      );
    }

    // 2) Insert 10 events. We use explicit IDs to make joining + down() easy.
    const events = [
      // Helping Hands Network (food, families, indoor, beginner-friendly)
      {
        id: 201,
        organization_id: emailToOrgId.get("contact@helpinghands.org"),
        title: "Food Pantry Packing Night",
        description: "Pack pantry boxes for families. Light lifting, teamwork.",
        capacity: 25,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 120,
        address: "123 Hope St, Springfield, IL",
        latitude: 39.7817,
        longitude: -89.6501,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Green Earth Initiative (outdoor + manual labor)
      {
        id: 202,
        organization_id: emailToOrgId.get("info@greenearth.org"),
        title: "Riverbank Cleanup",
        description: "Trash pickup and sorting along the river. Gloves provided.",
        capacity: null, // edge: unlimited capacity
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        duration: 120,
        address: "456 Forest Ave, Portland, OR",
        latitude: 45.5152,
        longitude: -122.6784,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Youth Empowerment Alliance (mentoring + youth)
      {
        id: 203,
        organization_id: emailToOrgId.get("hello@youthalliance.org"),
        title: "After-School Tutoring: Math Help",
        description: "Work 1:1 with students. Great for patient volunteers.",
        capacity: 10, // edge: small capacity
        date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        duration: 90,
        address: "789 Unity Blvd, Austin, TX",
        latitude: 30.2672,
        longitude: -97.7431,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Community Health Partners (health/wellness + event support)
      {
        id: 204,
        organization_id: emailToOrgId.get("support@healthpartners.org"),
        title: "Community Health Fair Support",
        description: "Help with check-in, wayfinding, and accessibility support.",
        capacity: 50,
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        duration: 180,
        address: "101 Wellness Way, Denver, CO",
        latitude: 39.7392,
        longitude: -104.9903,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Arts for All (indoor + one-time)
      {
        id: 205,
        organization_id: emailToOrgId.get("contact@artsforall.org"),
        title: "Art Supply Sorting + Studio Setup",
        description: "Organize donated supplies and help set up studio stations.",
        capacity: 18,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        duration: 90,
        address: "202 Creative Ln, Brooklyn, NY",
        latitude: 40.6782,
        longitude: -73.9442,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // TechBridge Foundation (technical support + remote)
      {
        id: 206,
        organization_id: emailToOrgId.get("info@techbridge.org"),
        title: "Remote Resume Clinic (Tech Support)",
        description: "Help participants format resumes and troubleshoot basic tools.",
        capacity: 100,
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        duration: 60, // edge: short duration
        address: "Online (Zoom)",
        latitude: 37.3382,
        longitude: -121.8863, // still required by your model
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Safe Haven Shelter (housing/homelessness)
      {
        id: 207,
        organization_id: emailToOrgId.get("admin@safehaven.org"),
        title: "Shelter Dinner Service",
        description: "Serve dinner and help with cleanup. Team-based and fast-paced.",
        capacity: 20,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        duration: 150,
        address: "404 Shelter Rd, Phoenix, AZ",
        latitude: 33.4484,
        longitude: -112.0740,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Animal Care Society (animal welfare + outdoor)
      {
        id: 208,
        organization_id: emailToOrgId.get("rescue@animalcare.org"),
        title: "Dog Walking + Kennel Enrichment",
        description: "Walk dogs and assist with enrichment activities. Closed-toe shoes required.",
        capacity: 16,
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        duration: 120,
        address: "505 Paw Print St, Madison, WI",
        latitude: 43.0731,
        longitude: -89.4012,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Global Education Fund (education + admin support)
      {
        id: 209,
        organization_id: emailToOrgId.get("contact@globaledu.org"),
        title: "Book Drive: Inventory + Packing",
        description: "Inventory donated books and pack shipments for partner schools.",
        capacity: 30,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        duration: 120,
        address: "606 Knowledge Ave, Boston, MA",
        latitude: 42.3601,
        longitude: -71.0589,
        image: null,
        created_at: now,
        updated_at: now,
      },

      // Veterans Support Group (social support + ongoing/long-term feel)
      {
        id: 210,
        organization_id: emailToOrgId.get("help@vetsupport.org"),
        title: "Ongoing Peer Support Check-ins",
        description: "Monthly check-ins with veterans. Commitment expected; training provided.",
        capacity: 60,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 45,
        address: "707 Honor Rd, San Diego, CA",
        latitude: 32.7157,
        longitude: -117.1611,
        image: null,
        created_at: now,
        updated_at: now,
      },
    ];

    await queryInterface.bulkInsert("events", events, {});

    // 3) Attach tags via event_tags (lookup by slug -> id)
    const neededSlugs = [
      "food-security",
      "families",
      "indoor",
      "beginner-friendly",
      "one-time",
      "environment",
      "outdoor",
      "manual-labor",
      "youth",
      "education",
      "tutoring",
      "mentoring",
      "health-wellness",
      "event-support",
      "technical-support",
      "remote",
      "housing-homelessness",
      "animal-welfare",
      "administrative-support",
      "ongoing",
      "long-term",
      "community-development",
    ];

    const [tagRows] = await queryInterface.sequelize.query(
      `SELECT id, slug FROM tags WHERE slug IN (${neededSlugs.map(() => "?").join(",")})`,
      { replacements: neededSlugs }
    );
    const slugToId = new Map(tagRows.map((r) => [r.slug, r.id]));

    const missingSlugs = neededSlugs.filter((s) => !slugToId.has(s));
    if (missingSlugs.length) {
      throw new Error(
        `Seed error: missing tags for slugs: ${missingSlugs.join(", ")}. Did you run the tags seeder first?`
      );
    }

    const link = (eventId, slugs) =>
      slugs.map((slug) => ({ event_id: eventId, tag_id: slugToId.get(slug) }));

    const eventTags = [
      ...link(201, ["food-security", "families", "indoor", "beginner-friendly", "one-time"]),
      ...link(202, ["environment", "outdoor", "manual-labor", "one-time", "community-development"]),
      ...link(203, ["youth", "education", "tutoring", "mentoring", "beginner-friendly", "indoor"]),
      ...link(204, ["health-wellness", "event-support", "one-time"]),
      ...link(205, ["indoor", "one-time"]),
      ...link(206, ["technical-support", "remote", "education"]),
      ...link(207, ["housing-homelessness", "one-time"]),
      ...link(208, ["animal-welfare", "outdoor", "one-time"]),
      ...link(209, ["education", "administrative-support", "one-time"]),
      ...link(210, ["ongoing", "long-term", "mentoring"]),
    ];

    await queryInterface.bulkInsert("event_tags", eventTags, {});
  },

  async down(queryInterface) {
    // Delete join rows first
    await queryInterface.bulkDelete(
      "event_tags",
      { event_id: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210] },
      {}
    );

    // Then events
    await queryInterface.bulkDelete(
      "events",
      { id: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210] },
      {}
    );
  },
};
