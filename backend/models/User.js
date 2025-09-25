const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 50]
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  balance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.0,
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
    allowNull: false
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = User;
