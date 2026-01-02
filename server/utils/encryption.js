const crypto = require('crypto');
const secretsManager = require('../utils/secretsManager');
const logger = require('../config/logger');

const algorithm = 'aes-256-gcm';
const ivLength = 16; // For AES-GCM
const authTagLength = 16; // For AES-GCM

let encryptionKey = null; // Will be loaded from Vault

/**
 * Initializes the encryption utility by fetching the encryption key from Vault.
 * This function must be called before encrypt or decrypt operations.
 */
async function initializeEncryptionKey() {
  if (encryptionKey) {
    logger.debug('Encryption key already initialized.');
    return;
  }
  try {
    const vaultSecrets = await secretsManager.getSecret(secretsManager.config.secretsKvPath);
    if (vaultSecrets && vaultSecrets.encryption_key) {
      // Ensure the key is 32 bytes (256 bits) for AES-256
      encryptionKey = Buffer.from(vaultSecrets.encryption_key, 'hex');
      if (encryptionKey.length !== 32) {
        throw new Error('Encryption key from Vault is not 32 bytes long.');
      }
      logger.info('Encryption key loaded from Vault.');
    } else {
      logger.error('Encryption key (encryption_key) not found in Vault secrets.');
      throw new Error('Encryption key not configured.');
    }
  } catch (error) {
    logger.error('Failed to load encryption key from Vault:', error.message);
    throw error;
  }
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * The encryption key must be initialized before calling this function.
 * @param {string} text - The plaintext string to encrypt.
 * @returns {string} - A base64 encoded JSON string containing iv, ciphertext, and authTag.
 */
function encrypt(text) {
  if (!encryptionKey) {
    throw new Error('Encryption key not initialized. Call initializeEncryptionKey() first.');
  }
  
  if (text === null || text === undefined || text === '') {
    return text; // Return null/undefined/empty string as is, or handle as per policy
  }

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const payload = {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag.toString('hex')
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Decrypts an encrypted string using AES-256-GCM.
 * The encryption key must be initialized before calling this function.
 * @param {string} encryptedPayloadBase64 - The base64 encoded JSON string containing iv, ciphertext, and authTag.
 * @returns {string} - The decrypted plaintext string.
 */
function decrypt(encryptedPayloadBase64) {
  if (!encryptionKey) {
    throw new Error('Encryption key not initialized. Call initializeEncryptionKey() first.');
  }

  if (encryptedPayloadBase64 === null || encryptedPayloadBase64 === undefined || encryptedPayloadBase64 === '') {
    return encryptedPayloadBase64; // Return null/undefined/empty string as is
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encryptedPayloadBase64, 'base64').toString('utf8'));
  } catch (e) {
    logger.error('Failed to parse encrypted payload:', e.message);
    throw new Error('Invalid encrypted data format.');
  }

  const iv = Buffer.from(payload.iv, 'hex');
  const encryptedData = payload.encryptedData;
  const authTag = Buffer.from(payload.authTag, 'hex');

  if (iv.length !== ivLength) {
    throw new Error('Invalid IV length.');
  }
  if (authTag.length !== authTagLength) {
    throw new Error('Invalid authentication tag length.');
  }

  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  try {
    decrypted += decipher.final('utf8');
  } catch (e) {
    logger.error('Decryption failed due to authentication tag mismatch or corrupt data:', e.message);
    throw new Error('Authentication failed or data is corrupt.');
  }

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
  initializeEncryptionKey
};
