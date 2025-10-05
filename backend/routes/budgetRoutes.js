const express = require('express');
const router = express.Router();
const { 
  showBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget,
  refreshBudgets
} = require('../controllers/budgetController');

router.get('/', showBudgets);

router.post('/', createBudget);

router.put('/:id', updateBudget);

router.delete('/:id', deleteBudget);

router.post('/refresh', refreshBudgets);

module.exports = router;
