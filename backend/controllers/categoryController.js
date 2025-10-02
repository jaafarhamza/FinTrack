const { Category } = require('../models');
const { Op } = require('sequelize');

// Show categories
const showCategories = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: categories,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Show categories error:', error);
    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: [],
      error: 'An error occurred while loading categories.',
      success: null
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      const categories = await Category.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('categories', {
        title: 'Categories - FinTrack',
        user: req.session.user,
        categories: categories,
        error: 'Category name must be at least 2 characters long.',
        success: null
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
        userId: req.session.userId
      }
    });

    if (existingCategory) {
      const categories = await Category.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('categories', {
        title: 'Categories - FinTrack',
        user: req.session.user,
        categories: categories,
        error: 'A category with this name already exists.',
        success: null
      });
    }

    // Create category
    await Category.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      userId: req.session.userId
    });

    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: categories,
      error: null,
      success: 'Category created successfully!'
    });
  } catch (error) {
    console.error('Create category error:', error);
    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: categories,
      error: 'An error occurred while creating the category.',
      success: null
    });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim().length < 2) {
      const categories = await Category.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('categories', {
        title: 'Categories - FinTrack',
        user: req.session.user,
        categories: categories,
        error: 'Category name must be at least 2 characters long.',
        success: null
      });
    }

    // Find category
    const category = await Category.findOne({
      where: {
        id: id,
        userId: req.session.userId
      }
    });

    if (!category) {
      const categories = await Category.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('categories', {
        title: 'Categories - FinTrack',
        user: req.session.user,
        categories: categories,
        error: 'Category not found.',
        success: null
      });
    }

    // Check if another category with same name
    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
        userId: req.session.userId,
        id: { [Op.ne]: id }
      }
    });

    if (existingCategory) {
      const categories = await Category.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('categories', {
        title: 'Categories - FinTrack',
        user: req.session.user,
        categories: categories,
        error: 'A category with this name already exists.',
        success: null
      });
    }

    // Update category
    await category.update({
      name: name.trim(),
      description: description ? description.trim() : null
    });

    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: categories,
      error: null,
      success: 'Category updated successfully!'
    });
  } catch (error) {
    console.error('Update category error:', error);
    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: categories,
      error: 'An error occurred while updating the category.',
      success: null
    });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;

    const category = await Category.findOne({
      where: {
        id: id,
        userId: req.session.userId
      }
    });

    if (!category) {
      const categories = await Category.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('categories', {
        title: 'Categories - FinTrack',
        user: req.session.user,
        categories: categories,
        error: 'Category not found.',
        success: null
      });
    }

    await category.destroy();

    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: categories,
      error: null,
      success: 'Category deleted successfully!'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('categories', {
      title: 'Categories - FinTrack',
      user: req.session.user,
      categories: categories,
      error: 'An error occurred while deleting the category.',
      success: null
    });
  }
};

module.exports = {
  showCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
