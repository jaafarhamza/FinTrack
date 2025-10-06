'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'emailNotifications', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
    
    await queryInterface.addColumn('Users', 'budgetAlertThreshold', {
      type: Sequelize.INTEGER,
      defaultValue: 90,
      allowNull: false,
      comment: 'Percentage threshold for budget warnings (default 90%)'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'emailNotifications');
    await queryInterface.removeColumn('Users', 'budgetAlertThreshold');
  }
};
