const { body, param, query, validationResult } = require('express-validator');
const logger = require('../config/logger');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
      value: err.value
    }));
    
    logger.warn('Validation failed:', errorMessages);
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errorMessages
    });
  }
  
  next();
};

/**
 * Validation rules for different endpoints
 */
const validations = {
  // Process command validation
  processCommand: [
    body('command')
      .trim()
      .notEmpty()
      .withMessage('Command is required')
      .isLength({ min: 3, max: 1000 })
      .withMessage('Command must be between 3 and 1000 characters'),
    body('context')
      .optional()
      .isObject()
      .withMessage('Context must be an object'),
    handleValidationErrors
  ],

  // Task ID validation
  taskId: [
    param('taskId')
      .trim()
      .notEmpty()
      .withMessage('Task ID is required')
      .isUUID()
      .withMessage('Task ID must be a valid UUID'),
    handleValidationErrors
  ],

  // User registration validation
  register: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    handleValidationErrors
  ],

  // User login validation
  login: [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
      .toInt(),
    handleValidationErrors
  ]
};

module.exports = validations;
