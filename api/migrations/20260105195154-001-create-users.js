'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { 
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false, 
        autoIncrement: true
      },

      username: { 
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      password_hash: { 
        type: Sequelize.STRING,
        allowNull: true
      },

      display_name: { 
        type: Sequelize.STRING(80),
        allowNull: true
      },

      profile_pic: { 
        type: Sequelize.STRING(255),
        allowNull: true
      },

      role: { 
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "user"
      },
      
      created_at: { 
        type: Sequelize.DATE,
        allowNull: false
      },

      updated_at: { 
        type: Sequelize.DATE,
        allowNull: false
      },
    });

    await queryInterface.addConstraint("users", {
      fields: ["role"],
      type: "check",
      name: "ck_users_role_valid",
      where: {
        role: ["user", "admin"],
      },
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('users');
  }
};
