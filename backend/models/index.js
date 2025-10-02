const User = require('./User');
const Category = require('./Category');
const SavingGoal = require('./SavingGoal');

User.hasMany(Category, { 
  foreignKey: 'userId', 
  as: 'categories',
  onDelete: 'CASCADE'
});

Category.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

User.hasMany(SavingGoal, { 
  foreignKey: 'userId', 
  as: 'savingGoals',
  onDelete: 'CASCADE'
});

SavingGoal.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

module.exports = {
  User,
  Category,
  SavingGoal
};
