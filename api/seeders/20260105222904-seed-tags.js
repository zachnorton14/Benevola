"use strict";

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const tags = [
      { name: "Children", slug: "children" },
      { name: "Youth", slug: "youth" },
      { name: "Seniors", slug: "seniors" },
      { name: "Families", slug: "families" },
      { name: "People With Disabilities", slug: "people-with-disabilities" },
      { name: "Immigrants/Refugees", slug: "immigrants-refugees" },
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
      { name: "Fundraising", slug: "fundraising" },
      { name: "Technical Support", slug: "technical-support" },
      { name: "Manual Labor", slug: "manual-labor" },
      { name: "Outdoor", slug: "outdoor" },
      { name: "Indoor", slug: "indoor" },
      { name: "Hands On", slug: "hands-on" },
      { name: "One Time", slug: "one-time" },
      { name: "Ongoing", slug: "ongoing" },
      { name: "Short Term", slug: "short-term" },
      { name: "Long Term", slug: "long-term" },
      { name: "Remote", slug: "remote" },
      { name: "Beginner Friendly", slug: "beginner-friendly" },
      { name: "Experienced Volunteers", slug: "experienced-volunteers" },
    ].map(t => ({ ...t, created_at: now, updated_at: now }));

    await queryInterface.bulkInsert("tags", tags, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "tags",
      { slug: tagsSlugs() },
      {}
    );

    function tagsSlugs() {
      return [
        "children",
        "youth",
        "seniors",
        "families",
        "people-with-disabilities",
        "immigrants-refugees",
        "environment",
        "education",
        "health-wellness",
        "food-security",
        "housing-homelessness",
        "animal-welfare",
        "community-development",
        "social-justice",
        "mentoring",
        "tutoring",
        "teaching",
        "administrative-support",
        "event-support",
        "fundraising",
        "technical-support",
        "manual-labor",
        "outdoor",
        "indoor",
        "hands-on",
        "one-time",
        "ongoing",
        "short-term",
        "long-term",
        "remote",
        "beginner-friendly",
        "experienced-volunteers",
      ];
    }
  },
};
