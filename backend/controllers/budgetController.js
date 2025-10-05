const { Budget, Category } = require('../models');

const showBudgets = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const budgets = await Budget.getMonthlyBudgets(req.session.userId, year, month);
    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['name', 'ASC']]
    });
    const currentDate = new Date();
    const availableYears = [];
    for (let i = currentDate.getFullYear() - 2; i <= currentDate.getFullYear() + 1; i++) {
      availableYears.push(i);
    }

    const months = [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ];

    res.render('budget', {
      title: 'Budget Management - FinTrack',
      user: req.session.user,
      budgets,
      categories,
      currentYear: year,
      currentMonth: month,
      availableYears,
      months,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Show budgets error:', error);
    res.render('budget', {
      title: 'Budget Management - FinTrack',
      user: req.session.user,
      budgets: [],
      categories: [],
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      availableYears: [],
      months: [],
      error: 'An error occurred while loading budgets.',
      success: null
    });
  }
};

// Create new budget
const createBudget = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { name, month, year, maxAmount, categoryId } = req.body;

    if (!name || name.trim().length < 2) {
      return res.redirect('/budgets?error=Budget name must be at least 2 characters long');
    }

    if (!month || !year || !maxAmount) {
      return res.redirect('/budgets?error=Please fill in all required fields');
    }

    if (parseFloat(maxAmount) <= 0) {
      return res.redirect('/budgets?error=Budget amount must be greater than 0');
    }

    if (month < 1 || month > 12) {
      return res.redirect('/budgets?error=Invalid month selected');
    }

    if (year < 2020 || year > 2030) {
      return res.redirect('/budgets?error=Invalid year selected');
    }
    if (categoryId && categoryId !== '') {
      const category = await Category.findOne({
        where: { id: categoryId, userId: req.session.userId }
      });
      if (!category) {
        return res.redirect('/budgets?error=Invalid category selected');
      }
    }
    await Budget.create({
      name: name.trim(),
      month: parseInt(month),
      year: parseInt(year),
      maxAmount: parseFloat(maxAmount),
      spentAmount: 0.00,
      categoryId: categoryId || null,
      userId: req.session.userId
    });

    await Budget.updateSpentAmounts(req.session.userId, parseInt(year), parseInt(month));

    res.redirect(`/budgets?year=${year}&month=${month}&success=Budget created successfully!`);
  } catch (error) {
    console.error('Create budget error:', error);
    if (error.message.includes('Budget already exists')) {
      res.redirect('/budgets?error=Budget already exists for this category in this month/year');
    } else {
      res.redirect('/budgets?error=An error occurred while creating the budget');
    }
  }
};

// Update budget
const updateBudget = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;
    const { name, month, year, maxAmount, categoryId } = req.body;

    const budget = await Budget.findOne({
      where: { id, userId: req.session.userId }
    });

    if (!budget) {
      return res.redirect('/budgets?error=Budget not found');
    }

    if (!name || name.trim().length < 2) {
      return res.redirect('/budgets?error=Budget name must be at least 2 characters long');
    }

    if (!month || !year || !maxAmount) {
      return res.redirect('/budgets?error=Please fill in all required fields');
    }

    if (parseFloat(maxAmount) <= 0) {
      return res.redirect('/budgets?error=Budget amount must be greater than 0');
    }

    if (month < 1 || month > 12) {
      return res.redirect('/budgets?error=Invalid month selected');
    }

    if (year < 2020 || year > 2030) {
      return res.redirect('/budgets?error=Invalid year selected');
    }

    if (categoryId && categoryId !== '') {
      const category = await Category.findOne({
        where: { id: categoryId, userId: req.session.userId }
      });
      if (!category) {
        return res.redirect('/budgets?error=Invalid category selected');
      }
    }

    // Update budget
    await budget.update({
      name: name.trim(),
      month: parseInt(month),
      year: parseInt(year),
      maxAmount: parseFloat(maxAmount),
      categoryId: categoryId || null
    });

    await Budget.updateSpentAmounts(req.session.userId, budget.year, budget.month);
    if (parseInt(year) !== budget.year || parseInt(month) !== budget.month) {
      await Budget.updateSpentAmounts(req.session.userId, parseInt(year), parseInt(month));
    }

    res.redirect(`/budgets?year=${year}&month=${month}&success=Budget updated successfully!`);
  } catch (error) {
    console.error('Update budget error:', error);
    res.redirect('/budgets?error=An error occurred while updating the budget');
  }
};

// Delete budget
const deleteBudget = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;

    const budget = await Budget.findOne({
      where: { id, userId: req.session.userId }
    });

    if (!budget) {
      return res.redirect('/budgets?error=Budget not found');
    }

    const year = budget.year;
    const month = budget.month;

    await budget.destroy();

    res.redirect(`/budgets?year=${year}&month=${month}&success=Budget deleted successfully!`);
  } catch (error) {
    console.error('Delete budget error:', error);
    res.redirect('/budgets?error=An error occurred while deleting the budget');
  }
};

// Refresh budget
const refreshBudgets = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    await Budget.updateSpentAmounts(req.session.userId, year, month);

    res.redirect(`/budgets?year=${year}&month=${month}&success=Budget data refreshed successfully!`);
  } catch (error) {
    console.error('Refresh budgets error:', error);
    res.redirect('/budgets?error=An error occurred while refreshing budget data');
  }
};
// Get budget overview
const getBudgetOverview = async (userId, limit = 5) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    await Budget.updateSpentAmounts(userId, currentYear, currentMonth);
    
    const budgetOverview = await Budget.findAll({
      where: { 
        userId: userId, 
        year: currentYear, 
        month: currentMonth 
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['maxAmount', 'DESC']],
      limit: limit
    });
    
    console.log('Found budgets:', budgetOverview.length);
    return budgetOverview;
  } catch (error) {
    console.error('Get budget overview error:', error);
    return [];
  }
};

module.exports = {
  showBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  refreshBudgets,
  getBudgetOverview
};