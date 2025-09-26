const AuthService = require('../services/authService');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const showRegister = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  
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
      req.session.userId = result.user.id;
      req.session.user = result.user;
      return res.redirect('/dashboard');
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
const showLogin = (req, res) => {
  // Redirect to dashboard if already logged in
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  
  res.render('auth/login', { 
    title: 'Login - FinTrack',
    error: null,
    success: null,
    formData: {},
    validationErrors: [],
    warnings: []
  });
};
 
// login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.render('auth/login', {
        title: 'Login - FinTrack',
        error: 'Invalid email or password',
        success: null,
        formData: req.body,
        validationErrors: [],
        warnings: []
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.render('auth/login', {
        title: 'Login - FinSolutions',
        error: 'Invalid email or password',
        success: null,
        formData: req.body,
        validationErrors: [],
        warnings: []
      });
    }

    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      balance: user.balance,
      currency: user.currency
    };
    
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login controller error:', error);
    res.render('auth/login', {
      title: 'Login - FinTrack',
      error: 'An unexpected error occurred. Please try again.',
      success: null,
      formData: req.body,
      validationErrors: [],
      warnings: []
    });
  }
};

const showDashboard = (req, res) => {
  // Redirect to login if not authenticated
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  res.render('dashboard', {
    title: 'Dashboard - FinTrack',
    user: req.session.user
  });
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login');
  });
};

module.exports = {
  showRegister,
  register,
  showLogin,
  login,
  showDashboard,
  logout
};
