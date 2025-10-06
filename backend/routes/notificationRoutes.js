const express = require('express');
const router = express.Router();
const { 
  showNotifications, 
  markAsRead, 
  markAllAsRead, 
  updateNotificationPreferences,
  manualBudgetCheck
} = require('../controllers/notificationController');

router.get('/', showNotifications);

router.post('/:id/read', markAsRead);

router.post('/mark-all-read', markAllAsRead);

router.post('/preferences', updateNotificationPreferences);

router.post('/check-budgets', manualBudgetCheck);

module.exports = router;
