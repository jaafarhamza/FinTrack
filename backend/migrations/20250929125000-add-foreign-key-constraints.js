'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add foreign key constraint from Transactions to Categories
    await queryInterface.addConstraint('Transactions', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'fk_transactions_category',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add foreign key constraint from Budgets to Categories
    await queryInterface.addConstraint('Budgets', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'fk_budgets_category',
      references: {
        table: 'Categories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove foreign key constraints
    await queryInterface.removeConstraint('Transactions', 'fk_transactions_category');
    await queryInterface.removeConstraint('Budgets', 'fk_budgets_category');
  }
};
