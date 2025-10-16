const axios = require('axios');
const crypto = require('crypto');
const logger = require('../config/logger');

class WebhookService {
  constructor() {
    this.webhooks = new Map(); // In-memory storage (use DB in production)
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Register a webhook
   */
  register(userId, webhook) {
    const id = crypto.randomUUID();
    const webhookData = {
      id,
      userId,
      url: webhook.url,
      events: webhook.events || ['*'], // Which events to listen to
      secret: webhook.secret || this.generateSecret(),
      active: true,
      createdAt: new Date(),
      metadata: webhook.metadata || {}
    };

    this.webhooks.set(id, webhookData);
    logger.info(`Webhook registered: ${id} for user ${userId}`);
    
    return webhookData;
  }

  /**
   * Get all webhooks for a user
   */
  getWebhooks(userId) {
    return Array.from(this.webhooks.values())
      .filter(webhook => webhook.userId === userId);
  }

  /**
   * Get webhook by ID
   */
  getWebhook(webhookId) {
    return this.webhooks.get(webhookId);
  }

  /**
   * Update webhook
   */
  updateWebhook(webhookId, updates) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      return null;
    }

    const updated = {
      ...webhook,
      ...updates,
      updatedAt: new Date()
    };

    this.webhooks.set(webhookId, updated);
    logger.info(`Webhook updated: ${webhookId}`);
    
    return updated;
  }

  /**
   * Delete webhook
   */
  deleteWebhook(webhookId) {
    const deleted = this.webhooks.delete(webhookId);
    if (deleted) {
      logger.info(`Webhook deleted: ${webhookId}`);
    }
    return deleted;
  }

  /**
   * Trigger webhooks for an event
   */
  async trigger(userId, event, data) {
    const userWebhooks = this.getWebhooks(userId)
      .filter(webhook => 
        webhook.active && 
        (webhook.events.includes('*') || webhook.events.includes(event))
      );

    if (userWebhooks.length === 0) {
      logger.debug(`No webhooks registered for event: ${event}`);
      return;
    }

    logger.info(`Triggering ${userWebhooks.length} webhooks for event: ${event}`);

    const results = await Promise.allSettled(
      userWebhooks.map(webhook => this.sendWebhook(webhook, event, data))
    );

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error(`Webhook ${userWebhooks[index].id} failed:`, result.reason);
      }
    });

    return results;
  }

  /**
   * Send a single webhook with retry logic
   */
  async sendWebhook(webhook, event, data, attempt = 1) {
    try {
      const payload = {
        event,
        data,
        timestamp: new Date().toISOString(),
        webhookId: webhook.id
      };

      const signature = this.generateSignature(payload, webhook.secret);

      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DIForM-Webhook/1.0',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'X-Webhook-ID': webhook.id,
          'X-Webhook-Timestamp': payload.timestamp
        },
        timeout: 10000, // 10 second timeout
        validateStatus: (status) => status >= 200 && status < 300
      });

      logger.info(`Webhook ${webhook.id} delivered successfully`, {
        event,
        status: response.status,
        attempt
      });

      return {
        success: true,
        webhookId: webhook.id,
        status: response.status,
        attempt
      };

    } catch (error) {
      logger.warn(`Webhook ${webhook.id} delivery failed (attempt ${attempt}/${this.retryAttempts})`, {
        event,
        error: error.message
      });

      // Retry with exponential backoff
      if (attempt < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendWebhook(webhook, event, data, attempt + 1);
      }

      // After all retries failed, deactivate webhook if too many failures
      // (In production, implement a failure counter and deactivation policy)
      
      throw new Error(`Webhook delivery failed after ${this.retryAttempts} attempts: ${error.message}`);
    }
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return 'sha256=' + hmac.digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload, signature, secret) {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate a random secret
   */
  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Test a webhook URL
   */
  async testWebhook(webhookId) {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const testPayload = {
      event: 'webhook.test',
      data: {
        message: 'This is a test webhook',
        webhookId: webhook.id
      },
      timestamp: new Date().toISOString(),
      webhookId: webhook.id
    };

    try {
      await this.sendWebhook(webhook, 'webhook.test', testPayload.data);
      return { success: true, message: 'Test webhook delivered successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: 'Test webhook failed',
        error: error.message 
      };
    }
  }

  /**
   * Get webhook delivery statistics
   */
  getStats(webhookId) {
    // In production, store delivery stats in database
    return {
      webhookId,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      lastDelivery: null,
      averageResponseTime: null
    };
  }
}

// Singleton instance
const webhookService = new WebhookService();

// Common webhook events
const WEBHOOK_EVENTS = {
  // Task events
  TASK_CREATED: 'task.created',
  TASK_UPDATED: 'task.updated',
  TASK_COMPLETED: 'task.completed',
  TASK_FAILED: 'task.failed',
  
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  
  // Auth events
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_FAILED: 'auth.failed',
  
  // System events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',
  
  // Custom events
  CUSTOM: 'custom'
};

module.exports = {
  webhookService,
  WEBHOOK_EVENTS
};
