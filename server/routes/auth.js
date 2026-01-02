const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const validations = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger'); // Import auditLogger

const router = express.Router();

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', validations.register, auditLogger('user.register', { resourceType: 'User' }, (req) => ({ email: req.body.email })), async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'Registration failed',
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', validations.login, auditLogger('user.login', { resourceType: 'User' }, (req) => ({ email: req.body.email })), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed: User not found (${email})`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Login failed: User inactive (${email})`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Account is inactive'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password (${email})`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', authenticate, auditLogger('user.profileAccess', { resourceType: 'User' }, (req) => ({ userId: req.user._id, email: req.user.email })), async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.toJSON()
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: 'Internal server error'
    });
  }
});

/**
 * Logout user (client-side token removal, optional endpoint)
 * POST /api/auth/logout
 */
router.post('/logout', authenticate, auditLogger('user.logout', { resourceType: 'User' }, (req) => ({ userId: req.user._id, email: req.user.email })), async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // This endpoint is optional and can be used for logging purposes
  logger.info(`User logged out: ${req.user.email}`);
  
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
