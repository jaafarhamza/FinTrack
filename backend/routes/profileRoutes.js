const express = require('express');
const router = express.Router();
const { showProfile, updateProfile, updatePassword } = require('../controllers/profileController');
const { 
  requireAuth,
  validateProfileUpdate, 
  validatePasswordUpdate, 
  handleValidationErrors, 
  checkEmailExistsForProfile,
  sanitizeRequestBody 
} = require('../middleware/profileMiddleware');

// Routes
router.get('/', requireAuth, showProfile);
router.post('/update', 
  requireAuth, 
  sanitizeRequestBody, 
  validateProfileUpdate, 
  checkEmailExistsForProfile, 
  handleValidationErrors, 
  updateProfile
);
router.post('/password', 
  requireAuth, 
  validatePasswordUpdate, 
  handleValidationErrors, 
  updatePassword
);

module.exports = router;
