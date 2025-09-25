const { body, validationResult } = require('express-validator');
const { isValidEmail, isStrongPassword, isValidName, sanitizeInput } = require('../utils/authHelpers');

const validateRegistration = [
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

  body('password')
    .notEmpty()
    .withMessage('Password is required')
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
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));

    return res.render('auth/register', {
      title: 'Register - FinTrack',
      error: formattedErrors[0].message,
      success: null,
      formData: req.body,
      validationErrors: formattedErrors,
      warnings: []
    });
  }
  
  next();
};

const customValidations = {
  checkEmailExists: async (req, res, next) => {
    try {
      const User = require('../models/User');
      const { email } = req.body;
      
      if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.render('auth/register', {
            title: 'Register - FinTrack',
            error: 'Email already registered. Please use a different email.',
            success: null,
            formData: req.body,
            validationErrors: [],
            warnings: []
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('Email validation error:', error);
      next(error);
    }
  }
};

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
  validateRegistration,
  handleValidationErrors,
  customValidations,
  sanitizeRequestBody,
};
