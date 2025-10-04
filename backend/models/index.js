const User = require('./User');
const Category = require('./Category');
const SavingGoal = require('./SavingGoal');
const Transaction = require('./Transaction');

User.hasMany(Category, { 
  foreignKey: 'userId', 
  as: 'categories',
  onDelete: 'CASCADE'
});

User.hasMany(SavingGoal, { 
  foreignKey: 'userId', 
  as: 'savingGoals',
  onDelete: 'CASCADE'
});

User.hasMany(Transaction, { 
  foreignKey: 'userId', 
  as: 'transactions',
  onDelete: 'CASCADE'
});

Category.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

Category.hasMany(Transaction, { 
  foreignKey: 'categoryId', 
  as: 'transactions',
  onDelete: 'SET NULL'
});

SavingGoal.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

Transaction.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

Transaction.belongsTo(Category, { 
  foreignKey: 'categoryId', 
  as: 'category'
});

module.exports = {
  User,
  Category,
  SavingGoal,
  Transaction
};
