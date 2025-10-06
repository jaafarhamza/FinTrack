const NotificationService = require('./notificationService');

class SchedulerService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting budget notification scheduler...');
    this.isRunning = true;

    this.runBudgetCheck();

    // run every hour
    this.intervalId = setInterval(() => {
      this.runBudgetCheck();
    }, 60 * 60 * 1000);

    console.log('Budget notification scheduler started (runs every hour)');
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping budget notification scheduler...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('Budget notification scheduler stopped');
  }

  // Run budget check
  async runBudgetCheck() {
    try {
      console.log('Running scheduled budget check...');
      const result = await NotificationService.checkBudgetAlerts();
      
      if (result.success) {
        console.log(`Scheduled budget check completed. Sent ${result.notificationsSent} notifications.`);
      } else {
        console.error('Scheduled budget check failed:', result.error);
      }
    } catch (error) {
      console.error('Error in scheduled budget check:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.isRunning ? 'Every hour' : 'Not scheduled'
    };
  }

}

// Create singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;
