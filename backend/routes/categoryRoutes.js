const express = require('express');
const router = express.Router();
const { showCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.get('/', showCategories);

router.post('/', createCategory);

router.put('/:id', updateCategory);

router.delete('/:id', deleteCategory);

module.exports = router;
