'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('organizations', [
      {
        name: 'Helping Hands Network',
        description: 'Providing food, shelter, and support to families in need.',
        email: 'contact@helpinghands.org',
        password_hash: 'hashed_password_1',
        phone: '555-123-4567',
        address: '123 Hope St, Springfield, IL',
        banner_img: 'https://example.com/banners/helpinghands.jpg',
        icon_img: 'https://example.com/icons/helpinghands.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Green Earth Initiative',
        description: 'Focused on environmental protection and sustainability.',
        email: 'info@greenearth.org',
        password_hash: 'hashed_password_2',
        phone: '555-234-5678',
        address: '456 Forest Ave, Portland, OR',
        banner_img: 'https://example.com/banners/greenearth.jpg',
        icon_img: 'https://example.com/icons/greenearth.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Youth Empowerment Alliance',
        description: 'Empowering youth through education and mentorship.',
        email: 'hello@youthalliance.org',
        password_hash: 'hashed_password_3',
        phone: '555-345-6789',
        address: '789 Unity Blvd, Austin, TX',
        banner_img: 'https://example.com/banners/youth.jpg',
        icon_img: 'https://example.com/icons/youth.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Community Health Partners',
        description: 'Improving access to healthcare in underserved communities.',
        email: 'support@healthpartners.org',
        password_hash: 'hashed_password_4',
        phone: '555-456-7890',
        address: '101 Wellness Way, Denver, CO',
        banner_img: 'https://example.com/banners/health.jpg',
        icon_img: 'https://example.com/icons/health.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Arts for All',
        description: 'Making art accessible to everyone.',
        email: 'contact@artsforall.org',
        password_hash: 'hashed_password_5',
        phone: '555-567-8901',
        address: '202 Creative Ln, Brooklyn, NY',
        banner_img: 'https://example.com/banners/arts.jpg',
        icon_img: 'https://example.com/icons/arts.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'TechBridge Foundation',
        description: 'Bridging the digital divide through technology education.',
        email: 'info@techbridge.org',
        password_hash: 'hashed_password_6',
        phone: '555-678-9012',
        address: '303 Innovation Dr, San Jose, CA',
        banner_img: 'https://example.com/banners/tech.jpg',
        icon_img: 'https://example.com/icons/tech.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Safe Haven Shelter',
        description: 'Providing shelter and safety for those experiencing homelessness.',
        email: 'admin@safehaven.org',
        password_hash: 'hashed_password_7',
        phone: '555-789-0123',
        address: '404 Shelter Rd, Phoenix, AZ',
        banner_img: 'https://example.com/banners/safehaven.jpg',
        icon_img: 'https://example.com/icons/safehaven.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Animal Care Society',
        description: 'Rescuing and rehoming animals in need.',
        email: 'rescue@animalcare.org',
        password_hash: 'hashed_password_8',
        phone: '555-890-1234',
        address: '505 Paw Print St, Madison, WI',
        banner_img: 'https://example.com/banners/animals.jpg',
        icon_img: 'https://example.com/icons/animals.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Global Education Fund',
        description: 'Supporting education initiatives worldwide.',
        email: 'contact@globaledu.org',
        password_hash: 'hashed_password_9',
        phone: '555-901-2345',
        address: '606 Knowledge Ave, Boston, MA',
        banner_img: 'https://example.com/banners/education.jpg',
        icon_img: 'https://example.com/icons/education.png',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Veterans Support Group',
        description: 'Helping veterans transition to civilian life.',
        email: 'help@vetsupport.org',
        password_hash: 'hashed_password_10',
        phone: '555-012-3456',
        address: '707 Honor Rd, San Diego, CA',
        banner_img: 'https://example.com/banners/veterans.jpg',
        icon_img: 'https://example.com/icons/veterans.png',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('organizations', null, {});
  }
};