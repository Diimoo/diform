const { encrypt, decrypt, initializeEncryptionKey } = require('../utils/encryption');
const secretsManager = require('../utils/secretsManager');
const logger = require('../config/logger');

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Mock secretsManager to control encryption key provisioning
jest.mock('../utils/secretsManager', () => ({
  getSecret: jest.fn(),
  config: {
    secretsKvPath: 'secret/data/diform/config', // Consistent with actual config
  },
}));

describe('Encryption Utility (AES-256-GCM)', () => {
  const MOCK_ENCRYPTION_KEY_HEX = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'; // 32 bytes hex
  const MOCK_ENCRYPTION_KEY_BUFFER = Buffer.from(MOCK_ENCRYPTION_KEY_HEX, 'hex');

  beforeEach(() => {
    // Reset mocks before each test
    logger.info.mockClear();
    logger.error.mockClear();
    secretsManager.getSecret.mockClear();

    // Default mock implementation for secretsManager.getSecret
    secretsManager.getSecret.mockResolvedValue({
      encryption_key: MOCK_ENCRYPTION_KEY_HEX,
    });
  });

  describe('initializeEncryptionKey', () => {
    it('should successfully load the encryption key from Vault', async () => {
      await initializeEncryptionKey();
      // The key is stored in a closure variable inside encryption.js, so we can't directly check it here.
      // We rely on successful encryption/decryption tests to confirm it's loaded.
      expect(secretsManager.getSecret).toHaveBeenCalledWith(secretsManager.config.secretsKvPath);
      expect(logger.info).toHaveBeenCalledWith('Encryption key loaded from Vault.');
    });

    it('should throw an error if encryption_key is not found in Vault secrets', async () => {
      secretsManager.getSecret.mockResolvedValue({}); // No encryption_key
      await expect(initializeEncryptionKey()).rejects.toThrow('Encryption key not configured.');
      expect(logger.error).toHaveBeenCalledWith('Encryption key (encryption_key) not found in Vault secrets.');
    });

    it('should throw an error if encryption key from Vault is not 32 bytes long', async () => {
      secretsManager.getSecret.mockResolvedValue({ encryption_key: 'short_key' }); // Invalid key length
      await expect(initializeEncryptionKey()).rejects.toThrow('Encryption key from Vault is not 32 bytes long.');
      expect(logger.error).toHaveBeenCalled(); // Expect error logging
    });
  });

  describe('encrypt and decrypt', () => {
    // Ensure key is initialized before running encrypt/decrypt tests
    beforeAll(async () => {
      secretsManager.getSecret.mockResolvedValue({ encryption_key: MOCK_ENCRYPTION_KEY_HEX });
      await initializeEncryptionKey();
    });

    it('should encrypt and decrypt a simple string correctly', () => {
      const plaintext = 'Hello, secure world!';
      const encrypted = encrypt(plaintext);
      expect(encrypted).not.toBe(plaintext); // Should not be plaintext

      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt a longer string correctly', () => {
      const plaintext = 'This is a much longer string that should also be encrypted and then decrypted without any issues, ensuring that the GCM mode works as expected with larger data payloads.';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different encrypted output for the same plaintext due to random IV', () => {
      const plaintext = 'Repeatable plaintext';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string encryption and decryption', () => {
      const plaintext = '';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
      expect(encrypted).toBe(''); // Should return empty string as per current implementation
    });

    it('should handle null value for encryption and decryption', () => {
      const plaintext = null;
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
      expect(encrypted).toBeNull(); // Should return null as per current implementation
    });
    
    it('should handle undefined value for encryption and decryption', () => {
      const plaintext = undefined;
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
      expect(encrypted).toBeUndefined(); // Should return undefined as per current implementation
    });

    it('should throw an error when decrypting tampered data (auth tag mismatch)', () => {
      const plaintext = 'Sensitive information';
      const encryptedBase64 = encrypt(plaintext);

      // Tamper with the encrypted data
      let payload = JSON.parse(Buffer.from(encryptedBase64, 'base64').toString('utf8'));
      payload.encryptedData = payload.encryptedData.slice(0, -1) + 'A'; // Corrupt last char
      const tamperedEncryptedBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');

      expect(() => decrypt(tamperedEncryptedBase64)).toThrow('Authentication failed or data is corrupt.');
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Decryption failed due to authentication tag mismatch or corrupt data'),
        expect.any(String)
      );
    });

    it('should throw an error when decrypting with wrong key (implicitly via `initializeEncryptionKey` not providing the key)', async () => {
      // Re-initialize without the correct key (or simulate it)
      secretsManager.getSecret.mockResolvedValueOnce({ encryption_key: 'incorrect_key_hex_string_32_bytes' });
      await initializeEncryptionKey();
      
      const plaintext = 'original text';
      const encryptedWithOriginalKey = encrypt(plaintext); // This will use the mock key from `beforeAll`
      
      // Now, try to decrypt with a different (simulated 'wrong') key
      // The `initializeEncryptionKey` in the `beforeAll` already set the key.
      // To test this, we need to bypass or re-init encryptionKey locally,
      // or set up a fresh describe block. For now, we'll test the error handling of `decrypt` itself.

      // Simulate a scenario where encryptionKey was not initialized
      // For this test, I will manually create an instance of Encryption without init
      const encryptionModule = require('require-uncached')('../utils/encryption');
      encryptionModule.initializeEncryptionKey(); // This should fail as mock will return wrong key

      await expect(encryptionModule.decrypt(encryptedWithOriginalKey)).rejects.toThrow('Authentication failed or data is corrupt.');
    });
  });
});

// Helper to clear module cache, useful for re-initializing singletons in tests
// Not strictly needed here because we re-mock secretsManager and clear state manually
// but good to keep in mind for more complex singleton scenarios.
function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}
