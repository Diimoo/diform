/**
 * Feature Flags System
 * 
 * Controls feature availability across the application.
 * Can be configured via environment variables or database.
 */

const logger = require('./logger');

// Default feature flags
const defaultFlags = {
  // AI Features
  ollamaIntegration: true,
  aiFallback: true,
  aiRetry: true,
  
  // API Features
  apiRateLimiting: true,
  apiCaching: true,
  apiVersioning: false, // Not yet migrated to /api/v1
  swaggerDocs: true,
  
  // Authentication
  jwtAuth: true,
  tokenRefresh: true,
  multiFactorAuth: false, // Future feature
  
  // Database
  mongodbPersistence: true,
  redisCaching: true,
  
  // Monitoring
  sentryErrorTracking: process.env.SENTRY_DSN ? true : false,
  requestLogging: true,
  metricsCollection: false, // Future: Prometheus
  
  // Real-time
  websocketSupport: false, // Infrastructure ready, not yet implemented
  serverSentEvents: false,
  
  // Microsoft Graph (Electron)
  msGraphIntegration: true,
  msGraphTokenRefresh: true,
  
  // Experimental
  betaFeatures: process.env.NODE_ENV === 'development',
  experimentalUI: false,
  
  // Operations
  gracefulShutdown: true,
  healthChecks: true,
  
  // Security
  helmetSecurity: true,
  corsProtection: true,
  inputValidation: true,
  
  // Performance
  codesplitting: true,
  lazyLoading: true,
  
  // User Features
  emailNotifications: false, // Future feature
  webhooks: false, // Future feature
  analytics: false, // Future feature
};

class FeatureFlagService {
  constructor() {
    this.flags = { ...defaultFlags };
    this.loadFromEnvironment();
    this.subscribers = [];
  }

  /**
   * Load feature flags from environment variables
   * Format: FEATURE_FLAG_<FLAG_NAME>=true|false
   */
  loadFromEnvironment() {
    Object.keys(this.flags).forEach(flag => {
      const envKey = `FEATURE_FLAG_${this.camelToSnakeCase(flag).toUpperCase()}`;
      if (process.env[envKey] !== undefined) {
        this.flags[flag] = process.env[envKey] === 'true';
        logger.info(`Feature flag ${flag} set from environment: ${this.flags[flag]}`);
      }
    });
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flagName) {
    if (!(flagName in this.flags)) {
      logger.warn(`Unknown feature flag: ${flagName}`);
      return false;
    }
    return this.flags[flagName] === true;
  }

  /**
   * Check if a feature is disabled
   */
  isDisabled(flagName) {
    return !this.isEnabled(flagName);
  }

  /**
   * Get all feature flags
   */
  getAllFlags() {
    return { ...this.flags };
  }

  /**
   * Get enabled features only
   */
  getEnabledFlags() {
    return Object.entries(this.flags)
      .filter(([_, enabled]) => enabled)
      .reduce((acc, [flag, _]) => ({ ...acc, [flag]: true }), {});
  }

  /**
   * Set a feature flag (runtime override)
   */
  setFlag(flagName, enabled) {
    if (!(flagName in this.flags)) {
      logger.warn(`Attempting to set unknown feature flag: ${flagName}`);
      return false;
    }
    
    const oldValue = this.flags[flagName];
    this.flags[flagName] = enabled;
    
    logger.info(`Feature flag ${flagName} changed: ${oldValue} -> ${enabled}`);
    
    // Notify subscribers
    this.notifySubscribers(flagName, enabled, oldValue);
    
    return true;
  }

  /**
   * Subscribe to feature flag changes
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify subscribers of changes
   */
  notifySubscribers(flagName, newValue, oldValue) {
    this.subscribers.forEach(callback => {
      try {
        callback({ flagName, newValue, oldValue });
      } catch (error) {
        logger.error('Error in feature flag subscriber:', error);
      }
    });
  }

  /**
   * Express middleware to inject feature flags into request
   */
  middleware() {
    return (req, res, next) => {
      req.featureFlags = this;
      next();
    };
  }

  /**
   * Express middleware to require a feature flag
   */
  requireFlag(flagName) {
    return (req, res, next) => {
      if (this.isEnabled(flagName)) {
        next();
      } else {
        res.status(403).json({
          error: 'Feature not available',
          message: `The feature '${flagName}' is currently disabled`,
          code: 'FEATURE_DISABLED'
        });
      }
    };
  }

  /**
   * Helper: Convert camelCase to snake_case
   */
  camelToSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  /**
   * Export flags for client (remove sensitive flags)
   */
  getPublicFlags() {
    // Only expose client-relevant flags
    const publicFlags = [
      'websocketSupport',
      'betaFeatures',
      'experimentalUI',
      'codeSplitting',
      'lazyLoading',
      'apiVersioning'
    ];

    return publicFlags.reduce((acc, flag) => {
      if (flag in this.flags) {
        acc[flag] = this.flags[flag];
      }
      return acc;
    }, {});
  }
}

// Singleton instance
const featureFlagService = new FeatureFlagService();

// Log enabled features on startup
logger.info('Feature Flags initialized', {
  enabled: Object.keys(featureFlagService.getEnabledFlags()).length,
  total: Object.keys(featureFlagService.getAllFlags()).length
});

module.exports = featureFlagService;
