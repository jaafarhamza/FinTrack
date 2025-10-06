const NotificationService = require('../services/notificationService');
const { User } = require('../models');

// Show notifications page
const showNotifications = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const notifications = await NotificationService.getUserNotifications(req.session.userId, 20);

    res.render('notifications', {
      title: 'Notifications - FinTrack',
      user: req.session.user,
      notifications: notifications,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Show notifications error:', error);
    res.render('notifications', {
      title: 'Notifications - FinTrack',
      user: req.session.user,
      notifications: [],
      error: 'An error occurred while loading notifications.',
      success: null
    });
  }
};

// as read
const markAsRead = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const success = await NotificationService.markAsRead(id, req.session.userId);

    if (success) {
      res.json({ success: true, message: 'Notification marked as read' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'An error occurred while marking notification as read' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = await NotificationService.markAllAsRead(req.session.userId);

    if (success) {
      res.json({ success: true, message: 'All notifications marked as read' });
    } else {
      res.status(500).json({ error: 'An error occurred while marking notifications as read' });
    }
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'An error occurred while marking notifications as read' });
  }
};

// Update notification
const updateNotificationPreferences = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { emailNotifications, budgetAlertThreshold } = req.body;

    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.redirect('/profile?error=User not found');
    }

    // Validate budget alert 
    const threshold = parseInt(budgetAlertThreshold);
    if (threshold < 50 || threshold > 100) {
      return res.redirect('/profile?error=Budget alert threshold must be between 50% and 100%');
    }

    await user.update({
      emailNotifications: emailNotifications === 'on',
      budgetAlertThreshold: threshold
    });

    req.session.user.emailNotifications = emailNotifications === 'on';
    req.session.user.budgetAlertThreshold = threshold;

    res.redirect('/profile?success=Notification preferences updated successfully!');
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.redirect('/profile?error=An error occurred while updating notification preferences');
  }
};

const manualBudgetCheck = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await NotificationService.checkUserBudgets(
      req.session.userId, 
      new Date().getFullYear(), 
      new Date().getMonth() + 1
    );

    res.json({ 
      success: true, 
      message: `Budget check completed. ${result} notifications sent.`,
      notificationsSent: result
    });
  } catch (error) {
    console.error('Manual budget check error:', error);
    res.status(500).json({ error: 'An error occurred while checking budgets' });
  }
};

module.exports = {
  showNotifications,
  markAsRead,
  markAllAsRead,
  updateNotificationPreferences,
  manualBudgetCheck
};
