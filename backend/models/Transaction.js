const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: true,
      isBefore: function(value) {
        if (value && new Date(value) > new Date()) {
          throw new Error('Transaction date cannot be in the future');
        }
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true
    }
  },
  type: {
    type: DataTypes.ENUM('Income', 'Expense'),
    allowNull: false,
    validate: {
      isIn: [['Income', 'Expense']]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
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
  tableName: 'Transactions',
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
      fields: ['date']
    },
    {
      fields: ['type']
    },
    {
      fields: ['userId', 'date']
    }
  ],
  hooks: {
    beforeCreate: async (transaction) => {
      if (transaction.amount < 0) {
        throw new Error('Transaction amount must be positive');
      }
    }
  }
});

// Instance
Transaction.prototype.getFormattedAmount = function() {
  return parseFloat(this.amount).toFixed(2);
};

Transaction.prototype.getFormattedDate = function() {
  return new Date(this.date).toLocaleDateString();
};

Transaction.prototype.isIncome = function() {
  return this.type === 'Income';
};

Transaction.prototype.isExpense = function() {
  return this.type === 'Expense';
};

Transaction.getTotalByType = async function(userId, type, startDate = null, endDate = null) {
  const { Op } = require('sequelize');
  const whereClause = { userId, type };
  
  if (startDate && endDate) {
    whereClause.date = {
      [Op.between]: [startDate, endDate]
    };
  }
  
  const result = await this.sum('amount', { where: whereClause });
  return result || 0;
};

Transaction.getMonthlyTotals = async function(userId, year, month) {
  const { Op } = require('sequelize');
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  const income = await this.getTotalByType(userId, 'Income', startDate, endDate);
  const expenses = await this.getTotalByType(userId, 'Expense', startDate, endDate);
  
  return {
    income: parseFloat(income),
    expenses: parseFloat(expenses),
    net: parseFloat(income) - parseFloat(expenses)
  };
};

module.exports = Transaction;
