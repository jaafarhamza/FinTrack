const { body, validationResult } = require('express-validator');
const { isValidEmail, isStrongPassword, isValidName, sanitizeInput } = require('../utils/authHelpers');

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
};

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .custom((value) => {
      if (!isValidName(value)) {
        throw new Error('First name must be 2-50 characters and contain only letters');
      }
      return true;
    }),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .custom((value) => {
      if (!isValidName(value)) {
        throw new Error('Last name must be 2-50 characters and contain only letters');
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      if (!isValidEmail(value)) {
        throw new Error('Please provide a valid email address');
      }
      return true;
    })
    .isLength({ max: 100 })
    .withMessage('Email must be less than 100 characters'),

  body('currency')
    .notEmpty()
    .withMessage('Currency is required')
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'])
    .withMessage('Please select a valid currency')
];

// Password update validation
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .custom((value) => {
      const passwordValidation = isStrongPassword(value);
      if (!passwordValidation.isValid) {
        throw new Error('Password must be at least 6 characters with uppercase, lowercase, and numbers');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Handle validation errors for profile
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));

    return res.render('profile', {
      title: 'Profile - FinTrack',
      user: req.session.user,
      error: formattedErrors[0].message,
      success: null,
      formData: req.body,
      validationErrors: formattedErrors
    });
  }
  
  next();
};

// Check if email exists for profile update (excluding current user)
const checkEmailExistsForProfile = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const { email } = req.body;
    const userId = req.session.userId;
    
    if (email) {
      const existingUser = await User.findOne({ 
        where: { 
          email,
          id: { [require('sequelize').Op.ne]: userId }
        } 
      });
      if (existingUser) {
        return res.render('profile', {
          title: 'Profile - FinTrack',
          user: req.session.user,
          error: 'Email already exists. Please use a different email.',
          success: null,
          formData: req.body,
          validationErrors: []
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Email validation error:', error);
    next(error);
  }
};

// Sanitize request body
const sanitizeRequestBody = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};

module.exports = {
  requireAuth,
  validateProfileUpdate,
  validatePasswordUpdate,
  handleValidationErrors,
  checkEmailExistsForProfile,
  sanitizeRequestBody
};
