const express = require('express');
const router = express.Router();
const { 
  showTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  getTransactionStats 
} = require('../controllers/transactionController');

router.get('/', showTransactions);

router.post('/', createTransaction);

router.put('/:id', updateTransaction);

router.delete('/:id', deleteTransaction);

router.get('/stats', getTransactionStats);

module.exports = router;
