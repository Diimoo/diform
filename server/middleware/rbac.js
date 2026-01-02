const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requirePermission = (resource, action) => {
  return async (req, res, next) => {
    // 1. Check for authenticated user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: No user authenticated' });
    }

    try {
      // 2. Fetch the full user object with roles and permissions populated
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found' });
      }

      // 3. Check if the user has the required permission
      const hasPerm = await user.hasPermission(resource, action);

      if (hasPerm) {
        next();
      } else {
        res.status(403).json({ message: `Forbidden: User lacks permission to ${action} ${resource}` });
      }
    } catch (error) {
      console.error(`Error in RBAC middleware for ${resource}:${action}:`, error);
      res.status(500).json({ message: 'Internal server error during permission check' });
    }
  };
};

module.exports = { requirePermission };