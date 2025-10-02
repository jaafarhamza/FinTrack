const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SavingGoal = sequelize.define('SavingGoal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  targetAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currentAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
      isAfter: function(value) {
        if (value && new Date(value) <= new Date()) {
          throw new Error('Deadline must be in the future');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('Active', 'Completed', 'Paused'),
    allowNull: false,
    defaultValue: 'Active'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'SavingGoals',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    }
  ],
  hooks: {
    beforeUpdate: async (savingGoal) => {
      if (savingGoal.currentAmount >= savingGoal.targetAmount && savingGoal.status !== 'Completed') {
        savingGoal.status = 'Completed';
      }
      else if (savingGoal.currentAmount < savingGoal.targetAmount && savingGoal.status === 'Completed') {
        savingGoal.status = 'Active';
      }
    }
  }
});

SavingGoal.prototype.getProgressPercentage = function() {
  return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
};

SavingGoal.prototype.isCompleted = function() {
  return this.currentAmount >= this.targetAmount;
};

SavingGoal.prototype.getRemainingAmount = function() {
  return Math.max(this.targetAmount - this.currentAmount, 0);
};

module.exports = SavingGoal;
