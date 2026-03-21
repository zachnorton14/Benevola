"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('event_images', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            event_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'events', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            url: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            position: {
                type: Sequelize.SMALLINT,
                allowNull: false,
                defaultValue: 0,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('event_images');
    },
};
