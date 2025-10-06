const exportService = require('../services/exportService');
const path = require('path');

// Export transactions to CSV
const exportTransactionsCSV = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const filters = {
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      type: req.query.type || 'all',
      categoryId: req.query.categoryId || 'all'
    };

    const result = await exportService.exportTransactionsToCSV(req.session.userId, filters);

    if (result.success) {
      await exportService.cleanupOldExports();
      
      res.download(result.filepath, result.filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        setTimeout(() => {
          try {
            require('fs').unlinkSync(result.filepath);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
        }, 5000);
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Export transactions CSV error:', error);
    res.status(500).json({ error: 'An error occurred while exporting transactions' });
  }
};

// Export transactions to PDF
const exportTransactionsPDF = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const filters = {
      startDate: req.query.startDate || null,
      endDate: req.query.endDate || null,
      type: req.query.type || 'all',
      categoryId: req.query.categoryId || 'all'
    };

    const result = await exportService.exportTransactionsToPDF(req.session.userId, filters);

    if (result.success) {
      await exportService.cleanupOldExports();
      
      res.download(result.filepath, result.filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        setTimeout(() => {
          try {
            require('fs').unlinkSync(result.filepath);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
        }, 5000);
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Export transactions PDF error:', error);
    res.status(500).json({ error: 'An error occurred while exporting transactions' });
  }
};

// Export budgets to CSV
const exportBudgetsCSV = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const result = await exportService.exportBudgetsToCSV(req.session.userId, year, month);

    if (result.success) {
      await exportService.cleanupOldExports();
      
      res.download(result.filepath, result.filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        setTimeout(() => {
          try {
            require('fs').unlinkSync(result.filepath);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
        }, 5000);
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Export budgets CSV error:', error);
    res.status(500).json({ error: 'An error occurred while exporting budgets' });
  }
};

// Export saving goals to CSV
const exportSavingGoalsCSV = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await exportService.exportSavingGoalsToCSV(req.session.userId);

    if (result.success) {
      await exportService.cleanupOldExports();
      
      res.download(result.filepath, result.filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        setTimeout(() => {
          try {
            require('fs').unlinkSync(result.filepath);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
        }, 5000);
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Export saving goals CSV error:', error);
    res.status(500).json({ error: 'An error occurred while exporting saving goals' });
  }
};

// Export fin report to PDF
const exportFinancialReportPDF = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const result = await exportService.exportFinancialReportToPDF(req.session.userId, year, month);

    if (result.success) {
      await exportService.cleanupOldExports();
      
      res.download(result.filepath, result.filename, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        setTimeout(() => {
          try {
            require('fs').unlinkSync(result.filepath);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
        }, 5000);
      });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Export financial report PDF error:', error);
    res.status(500).json({ error: 'An error occurred while exporting financial report' });
  }
};

// Show export options
const showExportOptions = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { Category } = require('../models');
    
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

    res.render('export', {
      title: 'Export Data - FinTrack',
      user: req.session.user,
      categories,
      availableYears,
      months,
      currentYear: currentDate.getFullYear(),
      currentMonth: currentDate.getMonth() + 1,
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Show export options error:', error);
    res.render('export', {
      title: 'Export Data - FinTrack',
      user: req.session.user,
      categories: [],
      availableYears: [],
      months: [],
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      error: 'An error occurred while loading export options.',
      success: null
    });
  }
};

module.exports = {
  exportTransactionsCSV,
  exportTransactionsPDF,
  exportBudgetsCSV,
  exportSavingGoalsCSV,
  exportFinancialReportPDF,
  showExportOptions
};
