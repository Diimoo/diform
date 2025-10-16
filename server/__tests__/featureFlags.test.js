const featureFlagService = require('../config/featureFlags');

describe('Feature Flags Service', () => {
  beforeEach(() => {
    // Reset any test flags
  });

  describe('isEnabled', () => {
    it('should return true for enabled flags', () => {
      expect(featureFlagService.isEnabled('jwtAuth')).toBe(true);
    });

    it('should return false for disabled flags', () => {
      expect(featureFlagService.isEnabled('multiFactorAuth')).toBe(false);
    });

    it('should return false for unknown flags', () => {
      expect(featureFlagService.isEnabled('unknownFlag')).toBe(false);
    });
  });

  describe('setFlag', () => {
    it('should update flag value', () => {
      const result = featureFlagService.setFlag('betaFeatures', false);
      expect(result).toBe(true);
      expect(featureFlagService.isEnabled('betaFeatures')).toBe(false);
      
      // Reset
      featureFlagService.setFlag('betaFeatures', process.env.NODE_ENV === 'development');
    });

    it('should return false for unknown flags', () => {
      const result = featureFlagService.setFlag('unknownFlag', true);
      expect(result).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('should return all flags', () => {
      const flags = featureFlagService.getAllFlags();
      expect(flags).toHaveProperty('jwtAuth');
      expect(flags).toHaveProperty('mongodbPersistence');
      expect(flags).toHaveProperty('websocketSupport');
    });
  });

  describe('getEnabledFlags', () => {
    it('should return only enabled flags', () => {
      const enabledFlags = featureFlagService.getEnabledFlags();
      expect(enabledFlags.jwtAuth).toBe(true);
      expect(enabledFlags.multiFactorAuth).toBeUndefined();
    });
  });

  describe('getPublicFlags', () => {
    it('should return only client-relevant flags', () => {
      const publicFlags = featureFlagService.getPublicFlags();
      expect(publicFlags).toHaveProperty('websocketSupport');
      expect(publicFlags).toHaveProperty('betaFeatures');
      // Should not expose server-side flags
      expect(publicFlags.sentryErrorTracking).toBeUndefined();
    });
  });

  describe('middleware', () => {
    it('should inject featureFlags into request', () => {
      const middleware = featureFlagService.middleware();
      const req = {};
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);

      expect(req.featureFlags).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireFlag', () => {
    it('should allow request if flag is enabled', () => {
      const middleware = featureFlagService.requireFlag('jwtAuth');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block request if flag is disabled', () => {
      const middleware = featureFlagService.requireFlag('multiFactorAuth');
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Feature not available'
        })
      );
    });
  });

  describe('subscribe', () => {
    it('should notify subscribers on flag change', () => {
      const callback = jest.fn();
      const unsubscribe = featureFlagService.subscribe(callback);

      featureFlagService.setFlag('betaFeatures', false);

      expect(callback).toHaveBeenCalledWith({
        flagName: 'betaFeatures',
        newValue: false,
        oldValue: expect.any(Boolean)
      });

      unsubscribe();
    });

    it('should allow unsubscribe', () => {
      const callback = jest.fn();
      const unsubscribe = featureFlagService.subscribe(callback);

      unsubscribe();
      featureFlagService.setFlag('betaFeatures', true);

      expect(callback).not.toHaveBeenCalled();
      
      // Reset
      featureFlagService.setFlag('betaFeatures', process.env.NODE_ENV === 'development');
    });
  });
});
