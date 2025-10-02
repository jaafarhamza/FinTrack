const User = require('./User');
const Category = require('./Category');

User.hasMany(Category, { 
  foreignKey: 'userId', 
  as: 'categories',
  onDelete: 'CASCADE'
});

Category.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user'
});

module.exports = {
  User,
  Category
};
