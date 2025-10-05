const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Budget = sequelize.define('Budget', {
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
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2020,
      max: 2030
    }
  },
  maxAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  spentAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Categories',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
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
  tableName: 'Budgets',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['categoryId']
    },
    {
      fields: ['month', 'year']
    },
    {
      fields: ['userId', 'month', 'year']
    }
  ],
  hooks: {
    beforeCreate: async (budget) => {
      // Check for duplicate budget for same category, month, year
      const existingBudget = await Budget.findOne({
        where: {
          userId: budget.userId,
          categoryId: budget.categoryId,
          month: budget.month,
          year: budget.year
        }
      });
      
      if (existingBudget) {
        throw new Error('Budget already exists for this category in this month/year');
      }
    }
  }
});

// Instance
Budget.prototype.getRemainingAmount = function() {
  return parseFloat(this.maxAmount) - parseFloat(this.spentAmount);
};

Budget.prototype.getSpentPercentage = function() {
  return (parseFloat(this.spentAmount) / parseFloat(this.maxAmount)) * 100;
};

Budget.prototype.isExceeded = function() {
  return parseFloat(this.spentAmount) > parseFloat(this.maxAmount);
};

Budget.prototype.getStatusColor = function() {
  if (this.isExceeded()) return 'red';
  if (this.getSpentPercentage() >= 90) return 'yellow';
  return 'green';
};

Budget.getMonthlyBudgets = async function(userId, year, month) {
  return await this.findAll({
    where: { userId, year, month },
    include: [
      {
        model: require('./Category'),
        as: 'category',
        attributes: ['id', 'name']
      }
    ],
    order: [['maxAmount', 'DESC']]
  });
};

Budget.updateSpentAmounts = async function(userId, year, month) {
  const { Transaction } = require('./index');
  const { Op } = require('sequelize');
  
  const budgets = await this.findAll({
    where: { userId, year, month }
  });
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  for (const budget of budgets) {
    let spentAmount = 0;
    
    if (budget.categoryId) {
      const expenses = await Transaction.findAll({
        where: {
          userId,
          type: 'Expense',
          categoryId: budget.categoryId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      spentAmount = expenses.reduce((total, transaction) => {
        return total + parseFloat(transaction.amount);
      }, 0);
    } else {
      const expenses = await Transaction.findAll({
        where: {
          userId,
          type: 'Expense',
          date: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      spentAmount = expenses.reduce((total, transaction) => {
        return total + parseFloat(transaction.amount);
      }, 0);
    }
    await budget.update({ spentAmount });
  }
};

module.exports = Budget;
