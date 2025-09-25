const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isValidEmail, isStrongPassword, isValidName, sanitizeInput } = require('../utils/authHelpers');

class AuthService {
  static async validateRegistrationData(data) {
    const errors = [];
    const warnings = [];
    
    // Sanitize inputs
    const sanitizedData = {
      firstName: sanitizeInput(data.firstName),
      lastName: sanitizeInput(data.lastName),
      email: sanitizeInput(data.email),
      password: data.password,
      confirmPassword: data.confirmPassword
    };
    
    // Validate first name
    if (!sanitizedData.firstName) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    } else if (!isValidName(sanitizedData.firstName)) {
      errors.push({ field: 'firstName', message: 'First name must be 2-50 characters and contain only letters' });
    }
    
    // Validate last name
    if (!sanitizedData.lastName) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    } else if (!isValidName(sanitizedData.lastName)) {
      errors.push({ field: 'lastName', message: 'Last name must be 2-50 characters and contain only letters' });
    }
    
    // Validate email
    if (!sanitizedData.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(sanitizedData.email)) {
      errors.push({ field: 'email', message: 'Please provide a valid email address' });
    }
    
    // Validate password
    if (!sanitizedData.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else {
      const passwordValidation = isStrongPassword(sanitizedData.password);
      if (!passwordValidation.isValid) {
        errors.push({ field: 'password', message: 'Password must be at least 6 characters with uppercase, lowercase, and numbers' });
      } else if (passwordValidation.strength === 'weak') {
        warnings.push({ field: 'password', message: 'Password is weak. Consider using special characters for better security' });
      }
    }
    
    // Validate password confirmation
    if (!sanitizedData.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Password confirmation is required' });
    } else if (sanitizedData.password !== sanitizedData.confirmPassword) {
      errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData
    };
  }
    //   Check if email already exists
  static async checkEmailExists(email) {
    try {
      const existingUser = await User.findOne({ where: { email } });
      return !!existingUser;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Database error while checking email');
    }
  }
    // Hash password
  static async hashPassword(password) {
    try {
      const saltRounds = 12; // Increased for better security
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Error processing password');
    }
  }
  
  // Create new user
  static async createUser(userData) {
    try {
      const { firstName, lastName, email, password } = userData;
      
      // Check if email already exists
      const emailExists = await this.checkEmailExists(email);
      if (emailExists) {
        throw new Error('Email already registered');
      }
      
      // Hash password
      const hashedPassword = await this.hashPassword(password);
      
      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });
      
      return {
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          balance: user.balance,
          currency: user.currency,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static async registerUser(registrationData) {
    try {
      // Validate data
      const validation = await this.validateRegistrationData(registrationData);
      
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          warnings: validation.warnings
        };
      }
      
      // Create user
      const result = await this.createUser(validation.sanitizedData);
      
      if (result.success) {
        return {
          success: true,
          user: result.user,
          warnings: validation.warnings
        };
      } else {
        return {
          success: false,
          errors: [{ field: 'email', message: result.error }]
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        errors: [{ field: 'general', message: 'An unexpected error occurred. Please try again.' }]
      };
    }
  }
}

module.exports = AuthService;
