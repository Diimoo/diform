/**
 * @fileoverview Vault configuration for the Node.js application.
 * This module exports configuration settings required to connect to and authenticate with HashiCorp Vault.
 */

const logger = require('./logger'); // Assuming a logger config exists

const vaultConfig = {
  // The address of the Vault server.
  // This should ideally come from environment variables.
  // During development with Docker Compose, it might be 'http://diform-vault:8200' from within another container
  // or 'http://localhost:8200' from the host.
  address: process.env.VAULT_ADDR || 'http://localhost:8200',

  // The path to the AppRole role_id and secret_id in Vault.
  // This is a secure way for applications to authenticate with Vault.
  // Format: "auth/approle/login" or similar
  appRolePath: process.env.VAULT_APPROLE_PATH || 'auth/approle/login',

  // The Role ID for AppRole authentication.
  // This identifies the role that the application is assuming.
  roleId: process.env.VAULT_ROLE_ID,

  // The Secret ID for AppRole authentication.
  // This acts as a password for the role.
  secretId: process.env.VAULT_SECRET_ID,

  // Path where secrets are stored in Vault (e.g., 'secret/data/diform').
  // For KV v2, this path needs to include 'data/'
  secretsKvPath: process.env.VAULT_SECRETS_KV_PATH || 'secret/data/diform',
  
  // Interval in milliseconds to refresh the Vault token before it expires.
  // If not set, a default will be used by the secrets manager.
  tokenRefreshInterval: parseInt(process.env.VAULT_TOKEN_REFRESH_INTERVAL || '300000', 10), // Default 5 minutes

  // Maximum number of retries for Vault API calls
  maxRetries: parseInt(process.env.VAULT_MAX_RETRIES || '3', 10),

  // Backoff factor for retries
  retryBackoff: parseInt(process.env.VAULT_RETRY_BACKOFF || '200', 10), // 200 ms
};

// Basic validation for critical Vault configurations
if (!vaultConfig.address) {
  logger.error('VAULT_ADDR is not set in environment variables. Vault integration may fail.');
}
if (!vaultConfig.roleId || !vaultConfig.secretId) {
  logger.warn('VAULT_ROLE_ID or VAULT_SECRET_ID not set. AppRole authentication will not be available. ' +
              'Ensure these are set for production environments or if using AppRole.');
}
if (!vaultConfig.secretsKvPath) {
  logger.error('VAULT_SECRETS_KV_PATH is not set. Secrets retrieval path is unknown.');
}

module.exports = vaultConfig;
