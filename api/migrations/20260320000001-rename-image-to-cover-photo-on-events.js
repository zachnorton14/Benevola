"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.renameColumn('events', 'image', 'cover_photo');
    },

    async down(queryInterface) {
        await queryInterface.renameColumn('events', 'cover_photo', 'image');
    },
};
