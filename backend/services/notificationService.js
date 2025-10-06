const { User, Budget, Notification } = require('../models');
const emailService = require('./emailService');
const { Op } = require('sequelize');

class NotificationService {
  
  // Check budgets
  static async checkBudgetAlerts() {
    try {
    //   console.log('Starting budget alert check...');
      
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const users = await User.findAll({
        where: {
          emailNotifications: true
        }
      });
      
      let totalNotificationsSent = 0;
      
      for (const user of users) {
        const notificationsSent = await this.checkUserBudgets(user.id, currentYear, currentMonth);
        totalNotificationsSent += notificationsSent;
      }
      
      console.log(`Budget alert check completed. Sent ${totalNotificationsSent} notifications.`);
      return { success: true, notificationsSent: totalNotificationsSent };
      
    } catch (error) {
      console.error('Error in budget alert check:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Check budgets
  static async checkUserBudgets(userId, year, month) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return 0;
      await Budget.updateSpentAmounts(userId, year, month);
      const budgets = await Budget.findAll({
        where: { 
          userId: userId, 
          year: year, 
          month: month 
        },
        include: [
          {
            model: require('../models').Category,
            as: 'category',
            attributes: ['id', 'name']
          }
        ]
      });
      
      let notificationsSent = 0;
      
      for (const budget of budgets) {
        const spentPercentage = budget.getSpentPercentage();
        const isExceeded = budget.isExceeded();
        
        const shouldNotify = await this.shouldSendNotification(userId, budget.id, spentPercentage, isExceeded);
        
        if (shouldNotify) {
          const notificationSent = await this.sendBudgetNotification(user, budget, spentPercentage, isExceeded);
          if (notificationSent) {
            notificationsSent++;
          }
        }
      }
      
      return notificationsSent;
      
    } catch (error) {
      console.error(`Error checking budgets for user ${userId}:`, error);
      return 0;
    }
  }
  
  static async shouldSendNotification(userId, budgetId, spentPercentage, isExceeded) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return false;
      
      if (isExceeded) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const existingNotification = await Notification.findOne({
          where: {
            userId: userId,
            budgetId: budgetId,
            type: 'budget_exceeded',
            sentAt: {
              [Op.between]: [today, tomorrow]
            }
          }
        });
        
        return !existingNotification;
      }
                        
      if (spentPercentage >= user.budgetAlertThreshold) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const existingNotification = await Notification.findOne({
          where: {
            userId: userId,
            budgetId: budgetId,
            type: 'budget_warning',
            sentAt: {
              [Op.between]: [today, tomorrow]
            }
          }
        });
        
        return !existingNotification;
      }
      
      return false;
      
    } catch (error) {
      console.error('Error checking notification eligibility:', error);
      return false;
    }
  }
  
  // Send budget notification
  static async sendBudgetNotification(user, budget, spentPercentage, isExceeded) {
    try {
      const categoryName = budget.category ? budget.category.name : 'General';
      const overAmount = isExceeded ? (budget.spentAmount - budget.maxAmount) : 0;
      
      let notificationType, title, message, emailSubject, emailTemplate;
      
      if (isExceeded) {
        notificationType = 'budget_exceeded';
        title = 'Budget Exceeded Alert';
        message = `Your budget "${budget.name}" (${categoryName}) has been exceeded by $${overAmount.toFixed(2)}.`;
        emailSubject = '🚨 Budget Exceeded - FinTrack Alert';
        emailTemplate = 'budgetExceeded';
      } else {
        notificationType = 'budget_warning';
        title = 'Budget Warning Alert';
        message = `Your budget "${budget.name}" (${categoryName}) is at ${spentPercentage.toFixed(1)}% of its limit.`;
        emailSubject = '⚠️ Budget Warning - FinTrack Alert';
        emailTemplate = 'budgetWarning';
      }
      
      // Create notification
      await Notification.create({
        userId: user.id,
        budgetId: budget.id,
        type: notificationType,
        title: title,
        message: message,
        sentAt: new Date()
      });
      
      // Send email notification
      const emailResult = await emailService.sendBudgetAlertEmail(
        user.email,
        user.firstName + ' ' + user.lastName,
        budget,
        categoryName,
        spentPercentage,
        isExceeded,
        overAmount
      );
      
      if (emailResult.success) {
        console.log(`Budget notification sent to ${user.email} for budget "${budget.name}"`);
        return true;
      } else {
        console.error(`Failed to send email to ${user.email}:`, emailResult.error);
        return false;
      }
      
    } catch (error) {
      console.error('Error sending budget notification:', error);
      return false;
    }
  }
  
  // Get user notifications
  static async getUserNotifications(userId, limit = 10) {
    try {
      const notifications = await Notification.findAll({
        where: { userId: userId },
        include: [
          {
            model: Budget,
            as: 'budget',
            attributes: ['id', 'name', 'maxAmount', 'spentAmount'],
            include: [
              {
                model: require('../models').Category,
                as: 'category',
                attributes: ['name']
              }
            ]
          }
        ],
        order: [['sentAt', 'DESC']],
        limit: limit
      });
      
      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }
  
  // as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          userId: userId
        }
      });
      
      if (notification) {
        await notification.update({ isRead: true });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
  
  static async markAllAsRead(userId) {
    try {
      await Notification.update(
        { isRead: true },
        { where: { userId: userId, isRead: false } }
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}

module.exports = NotificationService;
