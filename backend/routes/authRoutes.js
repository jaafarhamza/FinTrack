const express = require('express');
const router = express.Router();
const { showRegister, register, showLogin, login, showDashboard, logout } = require('../controllers/authController');
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

router.get('/login', showLogin);

router.post('/login', login);

router.get('/logout', logout);

module.exports = router;
