const express = require('express');
const router = express.Router();
const {
  exportTransactionsCSV,
  exportTransactionsPDF,
  exportBudgetsCSV,
  exportSavingGoalsCSV,
  exportFinancialReportPDF,
  showExportOptions
} = require('../controllers/exportController');

router.get('/', showExportOptions);

router.get('/transactions/csv', exportTransactionsCSV);
router.get('/transactions/pdf', exportTransactionsPDF);

router.get('/budgets/csv', exportBudgetsCSV);

router.get('/saving-goals/csv', exportSavingGoalsCSV);

router.get('/financial-report/pdf', exportFinancialReportPDF);

module.exports = router;
