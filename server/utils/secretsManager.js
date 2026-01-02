const nodeVault = require('node-vault');
const vaultConfig = require('../config/vault');
const logger = require('../config/logger');

class SecretsManager {
  constructor(config = vaultConfig) {
    this.config = config;
    this.vaultClient = nodeVault({
      apiVersion: 'v1',
      endpoint: this.config.address,
      token: null, // Token will be set after authentication
      requestOptions: {
        timeout: 5000 // 5 seconds
      }
    });
    this.secretsCache = new Map(); // Cache for fetched secrets
    this.clientToken = null;
    this.tokenExpirationTime = null;
    this.tokenRefreshTimeout = null;

    // Map to store secrets based on their path in Vault, and when they were last refreshed, and their lease duration
    // This allows for individual secret auto-refresh if Vault supports it and it's configured.
    // For now, primary focus is on client token auto-refresh.
    this.cachedSecretsMetadata = new Map(); 

    this.init = this.init.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.getSecret = this.getSecret.bind(this);
    this.scheduleTokenRefresh = this.scheduleTokenRefresh.bind(this);
  }

  async init() {
    logger.info('Initializing Vault SecretsManager...');
    try {
      await this.authenticate();
      logger.info('Vault SecretsManager initialized and authenticated.');
    } catch (error) {
      logger.error('Failed to initialize or authenticate with Vault:', error.message);
      // Depending on the application's criticality, you might want to exit here
      // process.exit(1);
      throw error; // Re-throw to indicate a critical failure
    }
  }

  async authenticate() {
    logger.debug('Attempting to authenticate with Vault using AppRole...');
    if (!this.config.roleId || !this.config.secretId) {
      logger.error('Vault AppRole Role ID or Secret ID is missing. Cannot authenticate with Vault.');
      throw new Error('Vault AppRole credentials missing.');
    }

    try {
      const result = await this.vaultClient.approleLogin({
        role_id: this.config.roleId,
        secret_id: this.config.secretId
      });

      this.clientToken = result.auth.client_token;
      this.vaultClient.token = this.clientToken; // Set token on the client
      
      const leaseDuration = result.auth.lease_duration; // In seconds
      this.tokenExpirationTime = Date.now() + (leaseDuration * 1000);
      logger.info(`Vault client token obtained. Expires in ${leaseDuration} seconds.`);
      
      this.scheduleTokenRefresh(leaseDuration);
      return this.clientToken;

    } catch (error) {
      logger.error('Vault AppRole authentication failed:', error.message);
      throw error;
    }
  }

  scheduleTokenRefresh(leaseDuration) {
    // Clear any existing refresh timeout
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // Schedule refresh proactively before token expires
    // Refresh interval: config.tokenRefreshInterval or 50% of lease duration
    const refreshIntervalMs = this.config.tokenRefreshInterval || (leaseDuration * 1000 / 2);
    
    // Ensure refresh interval is not too short or longer than lease duration
    const actualRefreshInterval = Math.max(1000 * 60, Math.min(refreshIntervalMs, (leaseDuration * 1000 * 0.8))); // Max 80% of lease, Min 1 minute

    logger.debug(`Scheduling Vault token refresh in ${actualRefreshInterval / 1000} seconds.`);

    this.tokenRefreshTimeout = setTimeout(async () => {
      logger.info('Attempting to renew Vault client token...');
      try {
        // Attempt to renew the current token
        const result = await this.vaultClient.tokenRenewSelf();
        const newLeaseDuration = result.auth.lease_duration;
        this.clientToken = result.auth.client_token; // Token might change on renewal
        this.vaultClient.token = this.clientToken;
        this.tokenExpirationTime = Date.now() + (newLeaseDuration * 1000);
        logger.info(`Vault client token renewed. New expiration in ${newLeaseDuration} seconds.`);
        this.scheduleTokenRefresh(newLeaseDuration); // Reschedule
      } catch (error) {
        logger.error('Failed to renew Vault token. Attempting re-authentication:', error.message);
        // If renewal fails, try to re-authenticate from scratch
        try {
          await this.authenticate();
        } catch (authError) {
          logger.error('Re-authentication after token renewal failure also failed:', authError.message);
          // Critical: Token management failed. Alert or initiate graceful degradation.
          // For now, re-throwing might lead to app crash, which is acceptable for critical errors.
        }
      }
    }, actualRefreshInterval);
  }

  async getSecret(path) {
    if (!this.clientToken) {
      logger.warn(`Vault client token not available. Attempting to authenticate before fetching secret: ${path}`);
      await this.authenticate();
      if (!this.clientToken) {
        throw new Error('Vault client not authenticated, cannot fetch secrets.');
      }
    }

    // Check if secret is in cache
    if (this.secretsCache.has(path)) {
      // Optional: Add logic here to check cachedSecretsMetadata for lease duration
      // and refresh individual secrets if they are near expiration, or if `read` handles it.
      // For KV v2, secrets generally don't have leases unless configured.
      logger.debug(`Fetching secret from cache: ${path}`);
      return this.secretsCache.get(path);
    }

    logger.debug(`Fetching secret from Vault: ${path}`);
    try {
      const result = await this.vaultClient.read(path);
      if (!result || !result.data || !result.data.data) {
        throw new Error(`Secret data not found at path: ${path}`);
      }
      const secretData = result.data.data; // For KV v2 secrets

      // Cache the secret
      this.secretsCache.set(path, secretData);
      logger.info(`Secret "${path}" fetched and cached.`);

      // Store metadata if available (e.g., lease duration for auto-refresh, if needed later)
      // For KV v2, `lease_duration` is typically 0, so refresh is less critical at secret level.
      // If we move to dynamic secrets, this metadata becomes crucial.
      this.cachedSecretsMetadata.set(path, {
        lastFetched: Date.now(),
        leaseDuration: result.lease_duration || 0,
        renewable: result.renewable || false
      });

      return secretData;
    } catch (error) {
      logger.error(`Failed to fetch secret from Vault at path "${path}":`, error.message);
      throw error;
    }
  }

  // Method to manually clear a specific secret from cache (e.g., if it's been rotated externally)
  clearSecretCache(path) {
    if (this.secretsCache.has(path)) {
      this.secretsCache.delete(path);
      this.cachedSecretsMetadata.delete(path);
      logger.info(`Secret "${path}" cleared from cache.`);
    }
  }

  // Method to clear all secrets from cache
  clearAllSecretsCache() {
    this.secretsCache.clear();
    this.cachedSecretsMetadata.clear();
    logger.info('All secrets cleared from cache.');
  }
}

// Export a singleton instance
const secretsManager = new SecretsManager();
// Call init if we want it to authenticate immediately on import,
// or rely on init() being called explicitly by the application bootstrap.
// For now, let's export the instance and let bootstrap handle init.
// secretsManager.init().catch(err => {
//   logger.error('Initial Vault SecretsManager authentication failed during startup:', err.message);
// });

module.exports = secretsManager;
