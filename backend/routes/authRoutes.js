const express = require('express');
const router = express.Router();
const { showRegister, register } = require('../controllers/authController');
const { validateRegistration, handleValidationErrors, customValidations, sanitizeRequestBody } = require('../middleware/authMiddleware');

// GET registration form
router.get('/register', showRegister);

// POST registration with validation
router.post('/register', 
  sanitizeRequestBody,
  validateRegistration,
  handleValidationErrors,
  customValidations.checkEmailExists,
  register
);

module.exports = router;
