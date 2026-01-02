const { SecretsManager } = require('../utils/secretsManager'); // Note the destructuring to get the class
const vaultConfig = require('../config/vault');
const logger = require('../config/logger');
const nodeVault = require('node-vault'); // Import node-vault directly for mocking

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Mock node-vault client to control its behavior in tests
// This allows us to test SecretsManager logic without a running Vault instance
jest.mock('node-vault', () => {
  const mockVaultClient = {
    apiVersion: 'v1',
    endpoint: 'http://mock-vault:8200',
    token: null,
    approleLogin: jest.fn(),
    read: jest.fn(),
    tokenRenewSelf: jest.fn(),
  };
  return jest.fn(() => mockVaultClient); // Return a function that returns the mock client
});


describe('SecretsManager', () => {
  let secretsManager;
  let mockVaultClient;

  // Mock environment variables for Vault credentials
  const MOCK_VAULT_ROLE_ID = 'mock-role-id-123';
  const MOCK_VAULT_SECRET_ID = 'mock-secret-id-456';
  const MOCK_VAULT_SECRETS_KV_PATH = 'secret/data/diform/config';

  beforeAll(() => {
    process.env.VAULT_ADDR = 'http://mock-vault:8200';
    process.env.VAULT_ROLE_ID = MOCK_VAULT_ROLE_ID;
    process.env.VAULT_SECRET_ID = MOCK_VAULT_SECRET_ID;
    process.env.VAULT_SECRETS_KV_PATH = MOCK_VAULT_SECRETS_KV_PATH;
    process.env.VAULT_TOKEN_RENEW_BUFFER = '1000'; // 1 second buffer for testing token renewal
  });

  beforeEach(() => {
    // Reset mocks and re-create SecretsManager before each test
    nodeVault.mockClear();
    mockVaultClient = nodeVault(); // Get the current mock instance
    mockVaultClient.approleLogin.mockReset();
    mockVaultClient.read.mockReset();
    mockVaultClient.tokenRenewSelf.mockReset();

    // Mock successful approleLogin
    mockVaultClient.approleLogin.mockResolvedValue({
      auth: {
        client_token: 'mock-client-token',
        lease_duration: 3600, // 1 hour lease
      },
    });

    // Mock successful secret read for a specific path
    mockVaultClient.read.mockImplementation((path) => {
      if (path === MOCK_VAULT_SECRETS_KV_PATH) {
        return Promise.resolve({
          data: {
            data: {
              jwt_secret: 'mock-jwt-secret',
              mongodb_uri: 'mock-mongodb-uri',
            },
          },
          lease_duration: 0, // KV v2 secrets typically have no lease
        });
      }
      return Promise.resolve({ data: { data: {} } });
    });

    secretsManager = new SecretsManager();
    secretsManager.secretsCache.clear(); // Clear cache for each test
    secretsManager.clientToken = null; // Ensure fresh state
    secretsManager.tokenExpirationTime = null;
    clearTimeout(secretsManager.tokenRefreshTimeout); // Clear any pending timeouts
  });

  afterEach(() => {
    clearTimeout(secretsManager.tokenRefreshTimeout); // Ensure no timers are left running
  });

  it('should initialize and authenticate with Vault', async () => {
    await secretsManager.init();

    expect(secretsManager.clientToken).toBe('mock-client-token');
    expect(mockVaultClient.token).toBe('mock-client-token');
    expect(mockVaultClient.approleLogin).toHaveBeenCalledTimes(1);
    expect(mockVaultClient.approleLogin).toHaveBeenCalledWith({
      role_id: MOCK_VAULT_ROLE_ID,
      secret_id: MOCK_VAULT_SECRET_ID,
    });
    expect(logger.info).toHaveBeenCalledWith('Vault SecretsManager initialized and authenticated.');
    expect(logger.info).toHaveBeenCalledWith('Vault client token obtained. Expires in 3600 seconds.');
  });

  it('should throw error if AppRole credentials are missing during init', async () => {
    process.env.VAULT_ROLE_ID = ''; // Unset role ID for this test
    secretsManager = new SecretsManager(); // Re-create with new env

    await expect(secretsManager.init()).rejects.toThrow('Vault AppRole credentials missing.');
    expect(logger.error).toHaveBeenCalledWith('Vault AppRole Role ID or Secret ID is missing. Cannot authenticate with Vault.');
  });

  it('should fetch a secret from Vault and cache it', async () => {
    await secretsManager.init();
    const secrets = await secretsManager.getSecret(MOCK_VAULT_SECRETS_KV_PATH);

    expect(secrets).toEqual({
      jwt_secret: 'mock-jwt-secret',
      mongodb_uri: 'mock-mongodb-uri',
    });
    expect(mockVaultClient.read).toHaveBeenCalledTimes(1);
    expect(mockVaultClient.read).toHaveBeenCalledWith(MOCK_VAULT_SECRETS_KV_PATH);
    expect(secretsManager.secretsCache.has(MOCK_VAULT_SECRETS_KV_PATH)).toBe(true);
    expect(secretsManager.secretsCache.get(MOCK_VAULT_SECRETS_KV_PATH)).toEqual(secrets);
    expect(logger.info).toHaveBeenCalledWith(`Secret "${MOCK_VAULT_SECRETS_KV_PATH}" fetched and cached.`);
  });

  it('should retrieve a secret from cache on subsequent calls', async () => {
    await secretsManager.init();
    await secretsManager.getSecret(MOCK_VAULT_SECRETS_KV_PATH); // First call, fetches and caches
    const secrets = await secretsManager.getSecret(MOCK_VAULT_SECRETS_KV_PATH); // Second call, should use cache

    expect(secrets).toEqual({
      jwt_secret: 'mock-jwt-secret',
      mongodb_uri: 'mock-mongodb-uri',
    });
    expect(mockVaultClient.read).toHaveBeenCalledTimes(1); // Only called once
    expect(logger.debug).toHaveBeenCalledWith(`Fetching secret from cache: ${MOCK_VAULT_SECRETS_KV_PATH}`);
  });

  it('should re-authenticate if token is missing when getting secret', async () => {
    secretsManager.clientToken = null; // Simulate missing token
    await secretsManager.getSecret(MOCK_VAULT_SECRETS_KV_PATH);

    expect(mockVaultClient.approleLogin).toHaveBeenCalledTimes(1);
    expect(secretsManager.clientToken).toBe('mock-client-token');
    expect(mockVaultClient.read).toHaveBeenCalledTimes(1);
  });

  it('should clear specific secret from cache', async () => {
    await secretsManager.init();
    await secretsManager.getSecret(MOCK_VAULT_SECRETS_KV_PATH);
    expect(secretsManager.secretsCache.has(MOCK_VAULT_SECRETS_KV_PATH)).toBe(true);

    secretsManager.clearSecretCache(MOCK_VAULT_SECRETS_KV_PATH);
    expect(secretsManager.secretsCache.has(MOCK_VAULT_SECRETS_KV_PATH)).toBe(false);
    expect(logger.info).toHaveBeenCalledWith(`Secret "${MOCK_VAULT_SECRETS_KV_PATH}" cleared from cache.`);
  });

  it('should clear all secrets from cache', async () => {
    await secretsManager.init();
    await secretsManager.getSecret(MOCK_VAULT_SECRETS_KV_PATH);
    await secretsManager.getSecret('another/path'); // Add another mock secret

    expect(secretsManager.secretsCache.size).toBe(2);

    secretsManager.clearAllSecretsCache();
    expect(secretsManager.secretsCache.size).toBe(0);
    expect(logger.info).toHaveBeenCalledWith('All secrets cleared from cache.');
  });

  it('should handle Vault authentication failure gracefully', async () => {
    mockVaultClient.approleLogin.mockRejectedValueOnce(new Error('Auth failed'));

    await expect(secretsManager.init()).rejects.toThrow('Auth failed');
    expect(logger.error).toHaveBeenCalledWith('Vault AppRole authentication failed:', 'Auth failed');
  });

  it('should handle Vault secret read failure gracefully', async () => {
    await secretsManager.init();
    mockVaultClient.read.mockRejectedValueOnce(new Error('Secret not found'));

    await expect(secretsManager.getSecret('non-existent-path')).rejects.toThrow('Secret not found');
    expect(logger.error).toHaveBeenCalledWith('Failed to fetch secret from Vault at path "non-existent-path":', 'Secret not found');
  });

  // Test token renewal mechanism
  it('should schedule token renewal', async () => {
    jest.useFakeTimers(); // Use Jest's fake timers

    await secretsManager.init();
    expect(secretsManager.tokenRefreshTimeout).toBeDefined();
    
    // Fast-forward time to just before renewal
    jest.advanceTimersByTime(secretsManager.config.tokenRefreshInterval - 1000); // 1 second before scheduled

    expect(mockVaultClient.tokenRenewSelf).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000); // Advance one more second to trigger

    expect(mockVaultClient.tokenRenewSelf).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('Attempting to renew Vault client token...');

    // Mock successful renewal
    mockVaultClient.tokenRenewSelf.mockResolvedValueOnce({
      auth: { client_token: 'new-mock-client-token', lease_duration: 7200 }, // Longer lease
    });

    await Promise.resolve(); // Allow promises to resolve after timer advance

    expect(logger.info).toHaveBeenCalledWith('Vault client token renewed. New expiration in 7200 seconds.');
    expect(secretsManager.clientToken).toBe('new-mock-client-token');
    expect(secretsManager.tokenRefreshTimeout).toBeDefined(); // New timeout should be set

    jest.useRealTimers(); // Restore real timers
  });

  it('should re-authenticate if token renewal fails', async () => {
    jest.useFakeTimers();

    await secretsManager.init();
    mockVaultClient.tokenRenewSelf.mockRejectedValueOnce(new Error('Renewal failed'));
    mockVaultClient.approleLogin.mockResolvedValueOnce({ // Mock successful re-auth
      auth: { client_token: 'reauthenticated-token', lease_duration: 3600 },
    });

    jest.advanceTimersByTime(secretsManager.config.tokenRefreshInterval);
    await Promise.resolve(); // Allow promises to resolve

    expect(mockVaultClient.tokenRenewSelf).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Failed to renew Vault token. Attempting re-authentication:', 'Renewal failed');
    expect(mockVaultClient.approleLogin).toHaveBeenCalledTimes(2); // Initial auth + re-auth
    expect(secretsManager.clientToken).toBe('reauthenticated-token');

    jest.useRealTimers();
  });
});
