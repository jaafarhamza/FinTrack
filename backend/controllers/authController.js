const AuthService = require('../services/authService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

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


// Update user balance
const updateBalance = async (req, res) => {
  try {
    // Redirect to login if not authenticated
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { newBalance } = req.body;
    
    // Validate balance
    if (!newBalance || isNaN(newBalance) || parseFloat(newBalance) < 0) {
      return res.render('dashboard', {
        title: 'Dashboard - FinTrack',
        user: req.session.user,
        error: 'Please enter a valid balance amount.'
      });
    }

    // Update user balance in database
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      return res.redirect('/auth/login');
    }

    await user.update({ balance: parseFloat(newBalance) });

    // Update session with new balance
    req.session.user.balance = parseFloat(newBalance);

    res.render('dashboard', {
      title: 'Dashboard - FinTrack',
      user: req.session.user,
      success: 'Balance updated successfully!'
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.render('dashboard', {
      title: 'Dashboard - FinTrack',
      user: req.session.user,
      error: 'An error occurred while updating your balance. Please try again.'
    });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/auth/login');
  });
};

// Show forgot password form

const showForgotPassword = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  
  res.render('auth/forgotPassword', { 
    title: 'Forgot Password - FinTrack',
    error: null,
    success: null,
    formData: {},
    validationErrors: [],
    warnings: []
  });
};

// forgot password request

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.render('auth/forgotPassword', {
        title: 'Forgot Password - FinTrack',
        error: null,
        success: 'If an account with that email exists, we have sent a password reset link.',
        formData: {},
        validationErrors: [],
        warnings: []
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry
    });

    // Send email 
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password?token=${resetToken}`;
    
    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      email, 
      resetUrl, 
      `${user.firstName} ${user.lastName}`
    );

    if (emailResult.success) {
      console.log('Password reset email sent successfully to:', email);
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    res.render('auth/forgotPassword', {
      title: 'Forgot Password - FinTrack',
      error: null,
      success: 'If an account with that email exists, we have sent a password reset link.',
      formData: {},
      validationErrors: [],
      warnings: []
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.render('auth/forgotPassword', {
      title: 'Forgot Password - FinTrack',
      error: 'An error occurred. Please try again.',
      success: null,
      formData: req.body,
      validationErrors: [],
      warnings: []
    });
  }
};

// Show reset password form
const showResetPassword = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.render('auth/forgotPassword', {
        title: 'Forgot Password - FinTrack',
        error: 'Invalid or missing reset token.',
        success: null,
        formData: {},
        validationErrors: [],
        warnings: []
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.render('auth/forgotPassword', {
        title: 'Forgot Password - FinTrack',
        error: 'Invalid or expired reset token. Please request a new password reset.',
        success: null,
        formData: {},
        validationErrors: [],
        warnings: []
      });
    }

    res.render('auth/resetPassword', {
      title: 'Reset Password - FinTrack',
      token: token,
      error: null,
      success: null,
      formData: {},
      validationErrors: [],
      warnings: []
    });
  } catch (error) {
    console.error('Show reset password error:', error);
    res.render('auth/forgotPassword', {
      title: 'Forgot Password - FinTrack',
      error: 'An error occurred. Please try again.',
      success: null,
      formData: {},
      validationErrors: [],
      warnings: []
    });
  }
};

// Handle password reset

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Validate passwords match
    if (password !== confirmPassword) {
      return res.render('auth/resetPassword', {
        title: 'Reset Password - FinTrack',
        token: token,
        error: 'Passwords do not match.',
        success: null,
        formData: req.body,
        validationErrors: [],
        warnings: []
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.render('auth/forgotPassword', {
        title: 'Forgot Password - FinTrack',
        error: 'Invalid or expired reset token. Please request a new password reset.',
        success: null,
        formData: {},
        validationErrors: [],
        warnings: []
      });
    }

    // Update password
    await user.update({
      password: password, 
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.render('auth/login', {
      title: 'Login - FinTrack',
      error: null,
      success: 'Password has been reset successfully. Please login with your new password.',
      formData: {},
      validationErrors: [],
      warnings: []
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.render('auth/resetPassword', {
      title: 'Reset Password - FinTrack',
      token: req.body.token,
      error: 'An error occurred. Please try again.',
      success: null,
      formData: req.body,
      validationErrors: [],
      warnings: []
    });
  }
};

module.exports = {
  showRegister,
  register,
  showLogin,
  login,
  updateBalance,
  logout,
  showForgotPassword,
  forgotPassword,
  showResetPassword,
  resetPassword
};
