const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

/**
 * Authentication middleware to verify JWT tokens
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided');
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      logger.warn(`Authentication failed: User not found (ID: ${decoded.userId})`);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'User not found' 
      });
    }

    if (!user.isActive) {
      logger.warn(`Authentication failed: User inactive (ID: ${decoded.userId})`);
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Account is inactive' 
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Authentication failed: Invalid token');
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      logger.warn('Authentication failed: Token expired');
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Token expired' 
      });
    }

    logger.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed' 
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch (error) {
    // Silently fail - this is optional auth
    logger.debug('Optional auth failed, continuing without user');
  }
  
  next();
};

/**
 * Authorization middleware to check user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Authorization failed: User ${req.user.email} tried to access ${req.path}`);
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize
};
