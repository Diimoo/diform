const { webhookService, WEBHOOK_EVENTS } = require('../services/webhookService');
const axios = require('axios');

jest.mock('axios');

describe('Webhook Service', () => {
  const testUserId = 'user123';
  let webhookId;

  beforeEach(() => {
    webhookService.webhooks.clear();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new webhook', () => {
      const webhook = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: [WEBHOOK_EVENTS.TASK_COMPLETED],
        secret: 'test-secret'
      });

      expect(webhook).toHaveProperty('id');
      expect(webhook.userId).toBe(testUserId);
      expect(webhook.url).toBe('https://example.com/webhook');
      expect(webhook.events).toContain(WEBHOOK_EVENTS.TASK_COMPLETED);
      expect(webhook.active).toBe(true);

      webhookId = webhook.id;
    });

    it('should auto-generate secret if not provided', () => {
      const webhook = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      expect(webhook.secret).toBeDefined();
      expect(webhook.secret.length).toBeGreaterThan(0);
    });
  });

  describe('getWebhooks', () => {
    it('should return webhooks for a user', () => {
      webhookService.register(testUserId, {
        url: 'https://example.com/webhook1',
        events: ['*']
      });

      webhookService.register(testUserId, {
        url: 'https://example.com/webhook2',
        events: [WEBHOOK_EVENTS.TASK_COMPLETED]
      });

      const webhooks = webhookService.getWebhooks(testUserId);
      expect(webhooks).toHaveLength(2);
    });

    it('should return empty array for user with no webhooks', () => {
      const webhooks = webhookService.getWebhooks('nonexistent-user');
      expect(webhooks).toHaveLength(0);
    });
  });

  describe('getWebhook', () => {
    it('should return webhook by ID', () => {
      const registered = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      const webhook = webhookService.getWebhook(registered.id);
      expect(webhook).toBeDefined();
      expect(webhook.id).toBe(registered.id);
    });

    it('should return undefined for non-existent webhook', () => {
      const webhook = webhookService.getWebhook('non-existent-id');
      expect(webhook).toBeUndefined();
    });
  });

  describe('updateWebhook', () => {
    it('should update webhook properties', () => {
      const registered = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      const updated = webhookService.updateWebhook(registered.id, {
        url: 'https://example.com/new-webhook',
        active: false
      });

      expect(updated.url).toBe('https://example.com/new-webhook');
      expect(updated.active).toBe(false);
      expect(updated).toHaveProperty('updatedAt');
    });

    it('should return null for non-existent webhook', () => {
      const result = webhookService.updateWebhook('non-existent', { active: false });
      expect(result).toBeNull();
    });
  });

  describe('deleteWebhook', () => {
    it('should delete webhook', () => {
      const registered = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      const deleted = webhookService.deleteWebhook(registered.id);
      expect(deleted).toBe(true);

      const webhook = webhookService.getWebhook(registered.id);
      expect(webhook).toBeUndefined();
    });

    it('should return false for non-existent webhook', () => {
      const deleted = webhookService.deleteWebhook('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('trigger', () => {
    it('should trigger webhooks for matching events', async () => {
      axios.post.mockResolvedValue({ status: 200, data: {} });

      webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: [WEBHOOK_EVENTS.TASK_COMPLETED]
      });

      const results = await webhookService.trigger(
        testUserId,
        WEBHOOK_EVENTS.TASK_COMPLETED,
        { taskId: 'task123', result: 'success' }
      );

      expect(results).toHaveLength(1);
      expect(axios.post).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          event: WEBHOOK_EVENTS.TASK_COMPLETED,
          data: expect.objectContaining({ taskId: 'task123' })
        }),
        expect.any(Object)
      );
    });

    it('should trigger wildcard webhooks', async () => {
      axios.post.mockResolvedValue({ status: 200, data: {} });

      webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      await webhookService.trigger(testUserId, WEBHOOK_EVENTS.TASK_CREATED, {});

      expect(axios.post).toHaveBeenCalled();
    });

    it('should not trigger inactive webhooks', async () => {
      const registered = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      webhookService.updateWebhook(registered.id, { active: false });

      await webhookService.trigger(testUserId, WEBHOOK_EVENTS.TASK_COMPLETED, {});

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should not trigger webhooks for non-matching events', async () => {
      webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: [WEBHOOK_EVENTS.TASK_COMPLETED]
      });

      await webhookService.trigger(testUserId, WEBHOOK_EVENTS.TASK_CREATED, {});

      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('generateSignature', () => {
    it('should generate consistent signatures', () => {
      const payload = { test: 'data' };
      const secret = 'test-secret';

      const sig1 = webhookService.generateSignature(payload, secret);
      const sig2 = webhookService.generateSignature(payload, secret);

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^sha256=/);
    });

    it('should generate different signatures for different secrets', () => {
      const payload = { test: 'data' };

      const sig1 = webhookService.generateSignature(payload, 'secret1');
      const sig2 = webhookService.generateSignature(payload, 'secret2');

      expect(sig1).not.toBe(sig2);
    });
  });

  describe('sendWebhook with retry', () => {
    it('should retry on failure', async () => {
      axios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ status: 200, data: {} });

      const webhook = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      const result = await webhookService.sendWebhook(
        webhook,
        'test.event',
        { test: 'data' }
      );

      expect(result.success).toBe(true);
      expect(result.attempt).toBe(3);
      expect(axios.post).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      const webhook = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      await expect(
        webhookService.sendWebhook(webhook, 'test.event', { test: 'data' })
      ).rejects.toThrow('Webhook delivery failed after');

      expect(axios.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('testWebhook', () => {
    it('should send test webhook', async () => {
      axios.post.mockResolvedValue({ status: 200, data: {} });

      const webhook = webhookService.register(testUserId, {
        url: 'https://example.com/webhook',
        events: ['*']
      });

      const result = await webhookService.testWebhook(webhook.id);

      expect(result.success).toBe(true);
      expect(axios.post).toHaveBeenCalledWith(
        'https://example.com/webhook',
        expect.objectContaining({
          event: 'webhook.test'
        }),
        expect.any(Object)
      );
    });

    it('should return error for non-existent webhook', async () => {
      await expect(
        webhookService.testWebhook('non-existent')
      ).rejects.toThrow('Webhook not found');
    });
  });

  describe('WEBHOOK_EVENTS', () => {
    it('should have defined event constants', () => {
      expect(WEBHOOK_EVENTS.TASK_CREATED).toBe('task.created');
      expect(WEBHOOK_EVENTS.TASK_COMPLETED).toBe('task.completed');
      expect(WEBHOOK_EVENTS.USER_CREATED).toBe('user.created');
      expect(WEBHOOK_EVENTS.AUTH_LOGIN).toBe('auth.login');
    });
  });
});
