const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');

const showTransactions = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const type = req.query.type || 'all';
    const categoryId = req.query.category || 'all';
    const search = req.query.search || '';

    const whereClause = { userId: req.session.userId };
    
    if (type !== 'all') {
      whereClause.type = type;
    }
    
    if (categoryId !== 'all') {
      whereClause.categoryId = categoryId;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });

    const categories = await Category.findAll({
      where: { userId: req.session.userId },
      order: [['name', 'ASC']]
    });

    //statistics
    const totalIncome = await Transaction.getTotalByType(req.session.userId, 'Income');
    const totalExpenses = await Transaction.getTotalByType(req.session.userId, 'Expense');
    const netAmount = totalIncome - totalExpenses;

    const currentDate = new Date();
    const monthlyTotals = await Transaction.getMonthlyTotals(
      req.session.userId, 
      currentDate.getFullYear(), 
      currentDate.getMonth() + 1
    );

    const totalPages = Math.ceil(count / limit);

    res.render('transactions', {
      title: 'Transactions - FinTrack',
      user: req.session.user,
      transactions,
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page + 1,
        prevPage: page - 1
      },
      filters: {
        type,
        category: categoryId,
        search
      },
      stats: {
        totalIncome: parseFloat(totalIncome),
        totalExpenses: parseFloat(totalExpenses),
        netAmount: parseFloat(netAmount),
        monthlyIncome: monthlyTotals.income,
        monthlyExpenses: monthlyTotals.expenses,
        monthlyNet: monthlyTotals.net
      },
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Show transactions error:', error);
    res.render('transactions', {
      title: 'Transactions - FinTrack',
      user: req.session.user,
      transactions: [],
      categories: [],
      pagination: { currentPage: 1, totalPages: 0, hasNext: false, hasPrev: false },
      filters: { type: 'all', category: 'all', search: '' },
      stats: { totalIncome: 0, totalExpenses: 0, netAmount: 0, monthlyIncome: 0, monthlyExpenses: 0, monthlyNet: 0 },
      error: 'An error occurred while loading transactions.',
      success: null
    });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { date, amount, type, description, categoryId } = req.body;

    if (!date || !amount || !type) {
      return res.redirect('/transactions?error=Please fill in all required fields');
    }

    if (parseFloat(amount) <= 0) {
      return res.redirect('/transactions?error=Amount must be greater than 0');
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.redirect('/transactions?error=Invalid transaction type');
    }

    if (categoryId && categoryId !== '') {
      const category = await Category.findOne({
        where: { id: categoryId, userId: req.session.userId }
      });
      if (!category) {
        return res.redirect('/transactions?error=Invalid category selected');
      }
    }

    await Transaction.create({
      date,
      amount: parseFloat(amount),
      type,
      description: description || null,
      categoryId: categoryId || null,
      userId: req.session.userId
    });

    res.redirect('/transactions?success=Transaction created successfully!');
  } catch (error) {
    console.error('Create transaction error:', error);
    res.redirect('/transactions?error=An error occurred while creating the transaction');
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;
    const { date, amount, type, description, categoryId } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.session.userId }
    });

    if (!transaction) {
      return res.redirect('/transactions?error=Transaction not found');
    }

    if (!date || !amount || !type) {
      return res.redirect('/transactions?error=Please fill in all required fields');
    }

    if (parseFloat(amount) <= 0) {
      return res.redirect('/transactions?error=Amount must be greater than 0');
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.redirect('/transactions?error=Invalid transaction type');
    }

    if (categoryId && categoryId !== '') {
      const category = await Category.findOne({
        where: { id: categoryId, userId: req.session.userId }
      });
      if (!category) {
        return res.redirect('/transactions?error=Invalid category selected');
      }
    }
    await transaction.update({
      date,
      amount: parseFloat(amount),
      type,
      description: description || null,
      categoryId: categoryId || null
    });

    res.redirect('/transactions?success=Transaction updated successfully!');
  } catch (error) {
    console.error('Update transaction error:', error);
    res.redirect('/transactions?error=An error occurred while updating the transaction');
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;

    const transaction = await Transaction.findOne({
      where: { id, userId: req.session.userId }
    });

    if (!transaction) {
      return res.redirect('/transactions?error=Transaction not found');
    }

    await transaction.destroy();

    res.redirect('/transactions?success=Transaction deleted successfully!');
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.redirect('/transactions?error=An error occurred while deleting the transaction');
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthlyTotals = await Transaction.getMonthlyTotals(
      req.session.userId, 
      currentYear, 
      currentMonth
    );

    const recentTransactions = await Transaction.findAll({
      where: { userId: req.session.userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: 5
    });

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const spendingByCategory = await Transaction.findAll({
      where: {
        userId: req.session.userId,
        type: 'Expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'categoryId',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
      ],
      group: ['categoryId', 'category.id', 'category.name'],
      order: [[Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'DESC']]
    });

    res.json({
      monthlyTotals,
      recentTransactions,
      spendingByCategory
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const showDashboard = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { SavingGoal } = require('../models');
    const { getBudgetOverview } = require('./budgetController');
    
    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']],
      limit: 5 
    });

    // Get budget overview
    const budgetOverview = await getBudgetOverview(req.session.userId, 5);
    console.log('Budget Overview Data:', budgetOverview);

    const recentTransactions = await Transaction.findAll({
      where: { userId: req.session.userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC'], ['createdAt', 'DESC']],
      limit: 5
    });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0);

    const monthlyIncome = await Transaction.findAll({
      where: {
        userId: req.session.userId,
        type: 'Income',
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'categoryId',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
      ],
      group: ['categoryId', 'category.id', 'category.name'],
      order: [[Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'DESC']]
    });

    const monthlyExpenses = await Transaction.findAll({
      where: {
        userId: req.session.userId,
        type: 'Expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'categoryId',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total']
      ],
      group: ['categoryId', 'category.id', 'category.name'],
      order: [[Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'DESC']]
    });

    const monthlyTotals = await Transaction.getMonthlyTotals(
      req.session.userId, 
      currentYear, 
      currentMonth
    );
    
    res.render('dashboard', {
      title: 'Dashboard - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      recentTransactions: recentTransactions,
      monthlyIncome: monthlyIncome,
      monthlyExpenses: monthlyExpenses,
      monthlyTotals: monthlyTotals,
      budgetOverview: budgetOverview
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('dashboard', {
      title: 'Dashboard - FinTrack',
      user: req.session.user,
      savingGoals: [],
      recentTransactions: [],
      monthlyIncome: [],
      monthlyExpenses: [],
      monthlyTotals: { income: 0, expenses: 0, net: 0 },
      budgetOverview: []
    });
  }
};

module.exports = {
  showDashboard,
  showTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
};
