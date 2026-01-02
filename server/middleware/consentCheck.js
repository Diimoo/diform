const Consent = require('../models/Consent');
const logger = require('../config/logger');

// Define the current version of the consent policy (should match the one in consent routes)
const CURRENT_CONSENT_VERSION = '1.0.0';

/**
 * Middleware factory to check if the user has granted required consent categories.
 * @param {Array<string>} requiredCategories - An array of consent category names (e.g., ['analytics', 'marketing'])
 * @returns {function} Express middleware function.
 */
const consentCheck = (requiredCategories = []) => {
  return async (req, res, next) => {
    // If no specific categories are required, just proceed
    if (requiredCategories.length === 0) {
      return next();
    }

    // Consent check only applies to authenticated users
    if (!req.user || !req.user._id) {
      logger.warn('Consent check bypassed: No authenticated user.');
      // Depending on policy, might allow or deny for anonymous users
      return res.status(401).json({ message: 'Unauthorized: Authentication required for consent check.' });
    }

    try {
      // Find the user's latest active consent record for the current version
      const userConsent = await Consent.findOne({
        userId: req.user._id,
        status: 'active',
        version: CURRENT_CONSENT_VERSION,
      }).sort({ grantedAt: -1 });

      if (!userConsent) {
        logger.warn(`User ${req.user._id} has no active consent for version ${CURRENT_CONSENT_VERSION}.`);
        return res.status(403).json({ message: 'Forbidden: User has not provided consent for required actions.' });
      }

      // Check if all required categories are granted
      const missingConsents = requiredCategories.filter(category => {
        // 'necessary' is always assumed to be granted and is handled internally
        if (category === 'necessary') return false; 
        return !userConsent.categories.get(category);
      });

      if (missingConsents.length > 0) {
        logger.warn(`User ${req.user._id} lacks consent for categories: ${missingConsents.join(', ')}`);
        return res.status(403).json({ message: `Forbidden: Missing consent for required categories: ${missingConsents.join(', ')}` });
      }

      // All required consents are granted, proceed
      next();
    } catch (error) {
      logger.error('Error during consent check middleware:', error);
      res.status(500).json({ message: 'Internal server error during consent check.' });
    }
  };
};

module.exports = consentCheck;
