const logger = require('../config/logger');

/**
 * Email Service
 * 
 * Supports multiple providers:
 * - SendGrid
 * - AWS SES
 * - Nodemailer (SMTP)
 * - Console (development)
 * 
 * Configure via environment variables:
 * EMAIL_PROVIDER=sendgrid|ses|smtp|console
 */

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'console';
    this.from = process.env.EMAIL_FROM || 'noreply@diform.example.com';
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    
    this.initializeProvider();
  }

  initializeProvider() {
    switch (this.provider) {
      case 'sendgrid':
        this.initializeSendGrid();
        break;
      case 'ses':
        this.initializeAWS();
        break;
      case 'smtp':
        this.initializeSMTP();
        break;
      case 'console':
      default:
        logger.info('Email service using console provider (development)');
        break;
    }
  }

  initializeSendGrid() {
    // Lazy load to avoid requiring if not used
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.client = sgMail;
      logger.info('Email service initialized with SendGrid');
    } catch (error) {
      logger.error('Failed to initialize SendGrid', { error: error.message });
      this.provider = 'console';
    }
  }

  initializeAWS() {
    try {
      const AWS = require('aws-sdk');
      AWS.config.update({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
      this.client = new AWS.SES({ apiVersion: '2010-12-01' });
      logger.info('Email service initialized with AWS SES');
    } catch (error) {
      logger.error('Failed to initialize AWS SES', { error: error.message });
      this.provider = 'console';
    }
  }

  initializeSMTP() {
    try {
      const nodemailer = require('nodemailer');
      this.client = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
      logger.info('Email service initialized with SMTP');
    } catch (error) {
      logger.error('Failed to initialize SMTP', { error: error.message });
      this.provider = 'console';
    }
  }

  /**
   * Send email
   */
  async send(to, subject, html, text = null) {
    if (!this.enabled) {
      logger.debug('Email sending disabled', { to, subject });
      return { success: true, message: 'Email disabled' };
    }

    const emailData = {
      to,
      from: this.from,
      subject,
      html,
      text: text || this.htmlToText(html)
    };

    try {
      switch (this.provider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(emailData);
        case 'ses':
          return await this.sendWithSES(emailData);
        case 'smtp':
          return await this.sendWithSMTP(emailData);
        case 'console':
        default:
          return this.sendToConsole(emailData);
      }
    } catch (error) {
      logger.error('Failed to send email', {
        to,
        subject,
        provider: this.provider,
        error: error.message
      });
      throw error;
    }
  }

  async sendWithSendGrid(emailData) {
    const result = await this.client.send(emailData);
    logger.info('Email sent via SendGrid', {
      to: emailData.to,
      subject: emailData.subject,
      messageId: result[0].headers['x-message-id']
    });
    return { success: true, provider: 'sendgrid', messageId: result[0].headers['x-message-id'] };
  }

  async sendWithSES(emailData) {
    const params = {
      Source: emailData.from,
      Destination: {
        ToAddresses: Array.isArray(emailData.to) ? emailData.to : [emailData.to]
      },
      Message: {
        Subject: { Data: emailData.subject },
        Body: {
          Html: { Data: emailData.html },
          Text: { Data: emailData.text }
        }
      }
    };

    const result = await this.client.sendEmail(params).promise();
    logger.info('Email sent via AWS SES', {
      to: emailData.to,
      subject: emailData.subject,
      messageId: result.MessageId
    });
    return { success: true, provider: 'ses', messageId: result.MessageId };
  }

  async sendWithSMTP(emailData) {
    const result = await this.client.sendMail(emailData);
    logger.info('Email sent via SMTP', {
      to: emailData.to,
      subject: emailData.subject,
      messageId: result.messageId
    });
    return { success: true, provider: 'smtp', messageId: result.messageId };
  }

  sendToConsole(emailData) {
    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL (Console Provider - Development Only)');
    console.log('='.repeat(80));
    console.log(`To: ${emailData.to}`);
    console.log(`From: ${emailData.from}`);
    console.log(`Subject: ${emailData.subject}`);
    console.log('-'.repeat(80));
    console.log('Text Content:');
    console.log(emailData.text);
    console.log('-'.repeat(80));
    console.log('HTML Content:');
    console.log(emailData.html.substring(0, 500) + '...');
    console.log('='.repeat(80) + '\n');

    logger.debug('Email logged to console', {
      to: emailData.to,
      subject: emailData.subject
    });

    return { success: true, provider: 'console', messageId: 'console-' + Date.now() };
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const html = `
      <html>
        <head><style>body { font-family: Arial, sans-serif; color: #333; }</style></head>
        <body>
          <h1>Welcome to DIForM! 🎉</h1>
          <p>Hi ${user.name || user.email},</p>
          <p>Thank you for joining DIForM - the enterprise AI productivity platform that gets work done, not just assisted.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li><strong>Create your first task</strong> - Let our AI complete your workflow</li>
            <li><strong>Explore features</strong> - Discover multi-platform support</li>
            <li><strong>Connect Microsoft 365</strong> - Integrate your productivity tools</li>
          </ul>
          <p>Need help? Check out our <a href="https://diform.example.com/docs">documentation</a> or contact support.</p>
          <p>Best regards,<br>The DIForM Team</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            DIForM - Work Done, Not Just Assisted<br>
            <a href="https://diform.example.com">diform.example.com</a>
          </p>
        </body>
      </html>
    `;

    return await this.send(user.email, 'Welcome to DIForM!', html);
  }

  /**
   * Send task completed notification
   */
  async sendTaskCompletedEmail(user, task) {
    const html = `
      <html>
        <head><style>body { font-family: Arial, sans-serif; color: #333; }</style></head>
        <body>
          <h1>Task Completed ✅</h1>
          <p>Hi ${user.name || user.email},</p>
          <p>Your task has been completed successfully!</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Task ID:</strong> ${task.id}<br>
            <strong>Command:</strong> ${task.command}<br>
            <strong>Status:</strong> <span style="color: green;">Completed</span><br>
            <strong>Completed at:</strong> ${new Date(task.completedAt).toLocaleString()}
          </div>
          <p><a href="https://diform.example.com/tasks/${task.id}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a></p>
          <p>Best regards,<br>The DIForM Team</p>
        </body>
      </html>
    `;

    return await this.send(user.email, 'Your DIForM task is complete!', html);
  }

  /**
   * Send task failed notification
   */
  async sendTaskFailedEmail(user, task, error) {
    const html = `
      <html>
        <head><style>body { font-family: Arial, sans-serif; color: #333; }</style></head>
        <body>
          <h1>Task Failed ❌</h1>
          <p>Hi ${user.name || user.email},</p>
          <p>Unfortunately, your task encountered an error and could not be completed.</p>
          <div style="background: #fff3f3; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <strong>Task ID:</strong> ${task.id}<br>
            <strong>Command:</strong> ${task.command}<br>
            <strong>Error:</strong> ${error.message}<br>
            <strong>Failed at:</strong> ${new Date().toLocaleString()}
          </div>
          <p><a href="https://diform.example.com/tasks/${task.id}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Details</a></p>
          <p>You can retry the task or contact support if the problem persists.</p>
          <p>Best regards,<br>The DIForM Team</p>
        </body>
      </html>
    `;

    return await this.send(user.email, 'DIForM task failed', html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `https://diform.example.com/reset-password?token=${resetToken}`;
    
    const html = `
      <html>
        <head><style>body { font-family: Arial, sans-serif; color: #333; }</style></head>
        <body>
          <h1>Reset Your Password 🔐</h1>
          <p>Hi ${user.name || user.email},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <p><a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Best regards,<br>The DIForM Team</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            For security, this link expires in 60 minutes.<br>
            If the button doesn't work, copy and paste this URL: ${resetUrl}
          </p>
        </body>
      </html>
    `;

    return await this.send(user.email, 'Reset your DIForM password', html);
  }

  /**
   * Simple HTML to text converter
   */
  htmlToText(html) {
    return html
      .replace(/<style[^>]*>.*<\/style>/gm, '')
      .replace(/<script[^>]*>.*<\/script>/gm, '')
      .replace(/<[^>]+>/gm, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Singleton instance
const emailService = new EmailService();

module.exports = emailService;
