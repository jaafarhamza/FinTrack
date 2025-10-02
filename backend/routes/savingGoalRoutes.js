const express = require('express');
const router = express.Router();
const { showSavingGoals, createSavingGoal, updateSavingGoal, addMoneyToGoal, deleteSavingGoal } = require('../controllers/savingGoalController');

router.get('/', showSavingGoals);

router.post('/', createSavingGoal);

router.put('/:id', updateSavingGoal);

router.post('/:id/add-money', addMoneyToGoal);

router.delete('/:id', deleteSavingGoal);

module.exports = router;
