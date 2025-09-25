"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add firstName and lastName columns to Users table
     */
    await queryInterface.addColumn("Users", "firstName", {
      type: Sequelize.STRING,
      allowNull: true, // Allow null for existing users
      after: "id", // Place after id column
    });

    await queryInterface.addColumn("Users", "lastName", {
      type: Sequelize.STRING,
      allowNull: true, // Allow null for existing users
      after: "firstName", // Place after firstName column
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Remove firstName and lastName columns from Users table
     */
    await queryInterface.removeColumn("Users", "firstName");
    await queryInterface.removeColumn("Users", "lastName");
  },
};
