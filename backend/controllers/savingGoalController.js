const { SavingGoal } = require('../models');
const { Op } = require('sequelize');

const showSavingGoals = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Show saving goals error:', error);
    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: [],
      error: 'An error occurred while loading saving goals.',
      success: null
    });
  }
};

// Create new saving goal
const createSavingGoal = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { name, targetAmount, deadline, description } = req.body;
    if (!name || name.trim().length < 2) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Goal name must be at least 2 characters long.',
        success: null
      });
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Target amount must be greater than 0.',
        success: null
      });
    }

    if (deadline && new Date(deadline) <= new Date()) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Deadline must be in the future.',
        success: null
      });
    }

    // Create saving goal
    await SavingGoal.create({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0.00,
      deadline: deadline || null,
      status: 'Active',
      userId: req.session.userId
    });

    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: null,
      success: 'Saving goal created successfully!'
    });
  } catch (error) {
    console.error('Create saving goal error:', error);
    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: 'An error occurred while creating the saving goal.',
      success: null
    });
  }
};

// Update saving goal
const updateSavingGoal = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;
    const { name, targetAmount, deadline, status } = req.body;
    if (!name || name.trim().length < 2) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Goal name must be at least 2 characters long.',
        success: null
      });
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Target amount must be greater than 0.',
        success: null
      });
    }

    // Find saving goal
    const savingGoal = await SavingGoal.findOne({
      where: {
        id: id,
        userId: req.session.userId
      }
    });

    if (!savingGoal) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Saving goal not found.',
        success: null
      });
    }
        if (deadline && new Date(deadline) <= new Date()) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Deadline must be in the future.',
        success: null
      });
    }

    // Update saving goal
    await savingGoal.update({
      name: name.trim(),
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || null,
      status: status || 'Active'
    });

    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: null,
      success: 'Saving goal updated successfully!'
    });
  } catch (error) {
    console.error('Update saving goal error:', error);
    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: 'An error occurred while updating the saving goal.',
      success: null
    });
  }
};

// Add money to saving goal
const addMoneyToGoal = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Amount must be greater than 0.',
        success: null
      });
    }

    // Find saving goal
    const savingGoal = await SavingGoal.findOne({
      where: {
        id: id,
        userId: req.session.userId
      }
    });

    if (!savingGoal) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Saving goal not found.',
        success: null
      });
    }
    const newCurrentAmount = parseFloat(savingGoal.currentAmount) + parseFloat(amount);
    
    if (newCurrentAmount > parseFloat(savingGoal.targetAmount)) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: `Cannot add $${parseFloat(amount).toFixed(2)}. This would exceed the target amount of $${parseFloat(savingGoal.targetAmount).toFixed(2)}. Maximum you can add is $${(parseFloat(savingGoal.targetAmount) - parseFloat(savingGoal.currentAmount)).toFixed(2)}.`,
        success: null
      });
    }
    
    await savingGoal.update({
      currentAmount: newCurrentAmount
    });

    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    const successMessage = newCurrentAmount >= savingGoal.targetAmount 
      ? `Congratulations! You've reached your goal "${savingGoal.name}"!`
      : `Successfully added $${parseFloat(amount).toFixed(2)} to "${savingGoal.name}"`;

    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: null,
      success: successMessage
    });
  } catch (error) {
    console.error('Add money to goal error:', error);
    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: 'An error occurred while adding money to the goal.',
      success: null
    });
  }
};

// Delete saving goal
const deleteSavingGoal = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { id } = req.params;
    const savingGoal = await SavingGoal.findOne({
      where: {
        id: id,
        userId: req.session.userId
      }
    });

    if (!savingGoal) {
      const savingGoals = await SavingGoal.findAll({
        where: { userId: req.session.userId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.render('saving-goals', {
        title: 'Saving Goals - FinTrack',
        user: req.session.user,
        savingGoals: savingGoals,
        error: 'Saving goal not found.',
        success: null
      });
    }

    await savingGoal.destroy();

    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });

    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: null,
      success: 'Saving goal deleted successfully!'
    });
  } catch (error) {
    console.error('Delete saving goal error:', error);
    const savingGoals = await SavingGoal.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('saving-goals', {
      title: 'Saving Goals - FinTrack',
      user: req.session.user,
      savingGoals: savingGoals,
      error: 'An error occurred while deleting the saving goal.',
      success: null
    });
  }
};

module.exports = {
  showSavingGoals,
  createSavingGoal,
  updateSavingGoal,
  addMoneyToGoal,
  deleteSavingGoal
};
