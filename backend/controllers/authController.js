const AuthService = require('../services/authService');

const showRegister = (req, res) => {
  res.render('auth/register', { 
    title: 'Register - FinTrack',
    error: null,
    success: null,
    formData: {},
    validationErrors: [],
    warnings: []
  });
};

const register = async (req, res) => {
  try {
    const result = await AuthService.registerUser(req.body);
    if (result.success) {
      res.render('auth/register', {
        title: 'Register - FinTrack',
        error: null,
        success: 'Registration successful! You can now login.',
        formData: {},
        validationErrors: [],
        warnings: result.warnings || []
      });
    } else {
      const firstError = result.errors && result.errors.length > 0 ? result.errors[0].message : 'Registration failed';
      res.render('auth/register', {
        title: 'Register - FinTrack',
        error: firstError,
        success: null,
        formData: req.body,
        validationErrors: result.errors || [],
        warnings: result.warnings || []
      });
    }
  } catch (error) {
    console.error('Registration controller error:', error);
    res.render('auth/register', {
      title: 'Register - FinTrack',
      error: 'An unexpected error occurred. Please try again.',
      success: null,
      formData: req.body,
      validationErrors: [],
      warnings: []
    });
  }
};

module.exports = {
  showRegister,
  register
};
