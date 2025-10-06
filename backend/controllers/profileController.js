const bcrypt = require('bcrypt');
const User = require('../models/User');

// Show profile page
const showProfile = async (req, res) => {
  // Redirect to login if not authenticated
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  
  try {
    // notification preferences
    const user = await User.findByPk(req.session.userId);
    
    res.render('profile', {
      title: 'Profile - FinTrack',
      user: user,
      error: null,
      success: null,
      formData: {},
      validationErrors: []
    });
  } catch (error) {
    console.error('Show profile error:', error);
    res.render('profile', {
      title: 'Profile - FinTrack',
      user: req.session.user,
      error: 'An error occurred while loading profile.',
      success: null,
      formData: {},
      validationErrors: []
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { firstName, lastName, email, currency } = req.body;
    const userId = req.session.userId;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.render('profile', {
        title: 'Profile - FinTrack',
        user: req.session.user,
        error: 'User not found',
        success: null,
        formData: req.body,
        validationErrors: []
      });
    }

    // Validate email if changed
    if (email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.render('profile', {
          title: 'Profile - FinTrack',
          user: req.session.user,
          error: 'Email already exists',
          success: null,
          formData: req.body,
          validationErrors: []
        });
      }
    }

    // Update user
    await user.update({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      currency: currency
    });

    // Update session
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      balance: user.balance,
      currency: user.currency
    };

    res.render('profile', {
      title: 'Profile - FinTrack',
      user: req.session.user,
      error: null,
      success: 'Profile updated successfully!',
      formData: {},
      validationErrors: []
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.render('profile', {
      title: 'Profile - FinTrack',
      user: req.session.user,
      error: 'An error occurred while updating your profile',
      success: null,
      formData: req.body,
      validationErrors: []
    });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/auth/login');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.userId;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.render('profile', {
        title: 'Profile - FinTrack',
        user: req.session.user,
        error: 'User not found',
        success: null,
        formData: req.body,
        validationErrors: []
      });
    }

    // Validate current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidCurrentPassword) {
      return res.render('profile', {
        title: 'Profile - FinTrack',
        user: req.session.user,
        error: 'Current password is incorrect',
        success: null,
        formData: req.body,
        validationErrors: []
      });
    }

    // Validate new password
    if (newPassword !== confirmPassword) {
      return res.render('profile', {
        title: 'Profile - FinTrack',
        user: req.session.user,
        error: 'New passwords do not match',
        success: null,
        formData: req.body,
        validationErrors: []
      });
    }

    // Validate password strength
    const passwordValidation = require('../utils/authHelpers').isStrongPassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.render('profile', {
        title: 'Profile - FinTrack',
        user: req.session.user,
        error: 'Password must be at least 6 characters with uppercase, lowercase, and numbers',
        success: null,
        formData: req.body,
        validationErrors: []
      });
    }

    // Update password
    await user.update({ password: newPassword });

    res.render('profile', {
      title: 'Profile - FinTrack',
      user: req.session.user,
      error: null,
      success: 'Password updated successfully!',
      formData: {},
      validationErrors: []
    });

  } catch (error) {
    console.error('Password update error:', error);
    res.render('profile', {
      title: 'Profile - FinTrack',
      user: req.session.user,
      error: 'An error occurred while updating your password',
      success: null,
      formData: req.body,
      validationErrors: []
    });
  }
};

module.exports = {
  showProfile,
  updateProfile,
  updatePassword
};
