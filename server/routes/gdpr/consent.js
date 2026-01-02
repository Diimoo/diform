const express = require('express');
const router = express.Router();
const Consent = require('../../models/Consent');
const { authenticate } = require('../../middleware/auth');
const auditLogger = require('../../middleware/auditLogger');
const logger = require('../../config/logger');

// Define the current version of the consent policy
const CURRENT_CONSENT_VERSION = '1.0.0';

// Helper function to get client IP and User-Agent
const getClientInfo = (req) => ({
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

/**
 * GET /api/gdpr/consent
 * Get a user's current active consent preferences.
 */
router.get('/', authenticate, auditLogger('gdpr.consentView', { resourceType: 'Consent' }), async (req, res) => {
  try {
    const userId = req.user._id;
    const consent = await Consent.findOne({ userId, status: 'active' }).sort({ grantedAt: -1 });

    if (!consent) {
      return res.status(200).json({
        message: 'No active consent found for this user.',
        consent: {
          categories: { necessary: false, analytics: false, marketing: false, profiling: false }, // Default empty consent
          version: CURRENT_CONSENT_VERSION,
          status: 'inactive'
        }
      });
    }
    res.json({ consent });
  } catch (error) {
    logger.error('Error fetching user consent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * POST /api/gdpr/consent
 * Set or update a user's consent preferences.
 */
router.post('/', authenticate, auditLogger('gdpr.consentUpdate', { resourceType: 'Consent' }, (req) => ({ categories: req.body.categories, version: CURRENT_CONSENT_VERSION })), async (req, res) => {
  try {
    const userId = req.user._id;
    const { categories } = req.body; // categories should be an object like { analytics: true, marketing: false }

    if (!categories || typeof categories !== 'object') {
      return res.status(400).json({ message: 'Invalid consent categories provided.' });
    }

    // Ensure necessary consent is always true
    categories.necessary = true;

    // Find and withdraw any existing active consent for this user/version
    const existingActiveConsent = await Consent.findOneAndUpdate(
      { userId, status: 'active', version: CURRENT_CONSENT_VERSION },
      { $set: { status: 'withdrawn', withdrawnAt: new Date() } },
      { new: true }
    );

    if (existingActiveConsent) {
      logger.info(`Previous active consent for user ${userId} (version ${CURRENT_CONSENT_VERSION}) withdrawn.`);
    }

    // Create a new active consent record
    const newConsent = new Consent({
      userId,
      categories: new Map(Object.entries(categories)), // Convert object to Map for Mongoose SchemaType Map
      version: CURRENT_CONSENT_VERSION,
      status: 'active',
      ...getClientInfo(req)
    });

    await newConsent.save();
    logger.info(`New consent granted by user ${userId} for version ${CURRENT_CONSENT_VERSION}.`);

    res.status(201).json({ message: 'Consent preferences updated successfully.', consent: newConsent });
  } catch (error) {
    logger.error('Error updating user consent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * DELETE /api/gdpr/consent
 * Withdraw all active consent for the user.
 */
router.delete('/', authenticate, auditLogger('gdpr.consentWithdrawal', { resourceType: 'Consent' }), async (req, res) => {
  try {
    const userId = req.user._id;

    const withdrawnConsent = await Consent.findOneAndUpdate(
      { userId, status: 'active' },
      { $set: { status: 'withdrawn', withdrawnAt: new Date(), ...getClientInfo(req) } },
      { new: true }
    );

    if (!withdrawnConsent) {
      return res.status(404).json({ message: 'No active consent found to withdraw.' });
    }
    logger.info(`All active consent withdrawn by user ${userId}.`);

    res.json({ message: 'All active consent withdrawn successfully.' });
  } catch (error) {
    logger.error('Error withdrawing user consent:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
