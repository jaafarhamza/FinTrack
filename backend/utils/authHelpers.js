// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
const isStrongPassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  };
};


// Name validation
const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// validation errors
const formatValidationErrors = (errors) => {
  return errors.map(error => ({
    field: error.path || error.param,
    message: error.msg || error.message,
    value: error.value
  }));
};

// Check passwords
const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

const generateValidationSummary = (validationResults) => {
  const summary = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  Object.keys(validationResults).forEach(field => {
    const result = validationResults[field];
    if (!result.isValid) {
      summary.isValid = false;
      summary.errors.push({
        field,
        message: result.message
      });
    }
    if (result.warning) {
      summary.warnings.push({
        field,
        message: result.warning
      });
    }
  });
  
  return summary;
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isValidName,
  sanitizeInput,
  formatValidationErrors,
  passwordsMatch,
  generateValidationSummary
};
