const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');

const AuditLog = require('../models/AuditLog');
const AuditService = require('../services/auditService');
const auditLogger = require('../middleware/auditLogger');
const User = require('../models/User'); // Assuming User model is needed for authentication context
const logger = require('../config/logger');

// Set test environment variables
process.env.JWT_SECRET = 'audit-test-secret-key-minimum-32-characters-long-for-testing';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/diform-audit-test';

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Mock the encryption functions for User model to prevent issues in auth
jest.mock('../utils/encryption', () => ({
  encrypt: jest.fn((text) => `encrypted_${text}`),
  decrypt: jest.fn((text) => text.replace('encrypted_', '')),
  initializeEncryptionKey: jest.fn().mockResolvedValue(true),
}));

describe('Audit Logging System', () => {
  let app;
  let testUser, testUserToken;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    // Setup mock Express app
    app = express();
    app.use(express.json());

    // Middleware to simulate user authentication (attach req.user)
    const mockAuthMiddleware = (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = { _id: decoded.userId, email: decoded.email }; // Only basic user info for middleware
          next();
        } catch (error) {
          return res.status(401).json({ message: 'Invalid or expired token' });
        }
      } else {
        next(); // No user attached if no token
      }
    };
    app.use(mockAuthMiddleware);

    // Test routes with auditLogger
    app.post('/api/users/:id/update', auditLogger('user.update', { resourceType: 'User' }), (req, res) => {
      res.status(200).json({ message: 'User updated' });
    });

    app.get('/api/data', auditLogger('data.access', { details: { source: 'api' } }), (req, res) => {
      res.status(200).json({ data: 'sensitive info' });
    });

    app.post('/api/login', auditLogger('user.login'), (req, res) => {
      if (req.body.username === 'test' && req.body.password === 'test') {
        res.status(200).json({ message: 'Login successful', token: 'mock-token' });
      } else {
        res.status(401).json({ message: 'Login failed' });
      }
    });

    // Create test user and token
    testUser = await User.create({
      email: 'audit_test@example.com',
      password: 'AuditPassword123',
      name: 'Audit User'
    });
    testUserToken = jwt.sign({ userId: testUser._id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await AuditLog.deleteMany({}); // Clear audit logs before each test
    logger.error.mockClear(); // Clear error logs
    logger.info.mockClear();
    logger.debug.mockClear();
    logger.warn.mockClear();
  });

  describe('AuditLog Model', () => {
    it('should create an audit log successfully', async () => {
      const log = await AuditLog.create({
        eventType: 'test.event',
        userId: testUser._id,
        actor: testUser.email,
        resourceType: 'TestResource',
        resourceId: new mongoose.Types.ObjectId(),
        details: { key: 'value' },
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test'
      });
      expect(log).toBeDefined();
      expect(log.eventType).toBe('test.event');
      expect(log.userId.toString()).toBe(testUser._id.toString());
    });

    it('should prevent updates to an audit log', async () => {
      const log = await AuditLog.create({ eventType: 'immutable.test' });
      log.eventType = 'changed.event'; // Attempt to change
      await expect(log.save()).rejects.toThrow('Audit logs are immutable and cannot be updated.');
    });
  });

  describe('AuditService', () => {
    it('should log an event with provided details', async () => {
      const resourceId = new mongoose.Types.ObjectId();
      await AuditService.logEvent({
        eventType: 'service.event',
        userId: testUser._id,
        resourceType: 'ServiceResource',
        resourceId: resourceId,
        details: { status: 'success' },
      });

      const loggedEvent = await AuditLog.findOne({ eventType: 'service.event' });
      expect(loggedEvent).toBeDefined();
      expect(loggedEvent.userId.toString()).toBe(testUser._id.toString());
      expect(loggedEvent.resourceId.toString()).toBe(resourceId.toString());
      expect(loggedEvent.details).toEqual({ status: 'success' });
    });

    it('should gracefully handle errors during logging', async () => {
      // Mock AuditLog.create to throw an error
      jest.spyOn(AuditLog, 'create').mockImplementationOnce(() => {
        throw new Error('Database write failed');
      });

      await AuditService.logEvent({ eventType: 'error.prone.event' });
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to log audit event "error.prone.event":',
        'Database write failed'
      );
      // Ensure no log was created
      const loggedEvent = await AuditLog.findOne({ eventType: 'error.prone.event' });
      expect(loggedEvent).toBeNull();
    });

    it('should retrieve audit logs with filters and options', async () => {
      await AuditService.logEvent({ eventType: 'event.one', userId: testUser._id });
      await AuditService.logEvent({ eventType: 'event.two', userId: testUser._id });
      await AuditService.logEvent({ eventType: 'event.one', userId: new mongoose.Types.ObjectId() }); // Different user

      const logs = await AuditService.getLogs({ eventType: 'event.one', userId: testUser._id });
      expect(logs).toHaveLength(1);
      expect(logs[0].eventType).toBe('event.one');
      expect(logs[0].userId.toString()).toBe(testUser._id.toString());
    });

    it('should count audit logs', async () => {
      await AuditService.logEvent({ eventType: 'countable.event' });
      await AuditService.logEvent({ eventType: 'countable.event' });
      await AuditService.logEvent({ eventType: 'other.event' });

      const count = await AuditService.countLogs({ eventType: 'countable.event' });
      expect(count).toBe(2);
    });
  });

  describe('AuditLogger Middleware', () => {
    it('should log a POST request to /api/users/:id/update', async () => {
      const userId = new mongoose.Types.ObjectId();
      await request(app)
        .post(`/api/users/${userId}/update`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ name: 'New Name' })
        .expect(200);

      const log = await AuditLog.findOne({ eventType: 'user.update' });
      expect(log).toBeDefined();
      expect(log.userId.toString()).toBe(testUser._id.toString());
      expect(log.actor).toBe(testUser.email);
      expect(log.resourceType).toBe('User');
      expect(log.resourceId.toString()).toBe(userId.toString());
      expect(log.ipAddress).toBeDefined();
      expect(log.userAgent).toBeDefined();
      expect(log.details.method).toBe('POST');
      expect(log.details.statusCode).toBe(200);
      expect(log.details.status).toBe('success');
    });

    it('should log a GET request to /api/data with custom details', async () => {
      await request(app)
        .get('/api/data')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      const log = await AuditLog.findOne({ eventType: 'data.access' });
      expect(log).toBeDefined();
      expect(log.userId.toString()).toBe(testUser._id.toString());
      expect(log.actor).toBe(testUser.email);
      expect(log.details.source).toBe('api');
      expect(log.details.method).toBe('GET');
      expect(log.details.status).toBe('success');
    });

    it('should log an anonymous login attempt with failure status', async () => {
      await request(app)
        .post('/api/login')
        .send({ username: 'wrong', password: 'creds' })
        .expect(401);

      const log = await AuditLog.findOne({ eventType: 'user.login' });
      expect(log).toBeDefined();
      expect(log.userId).toBeNull();
      expect(log.actor).toBe('anonymous');
      expect(log.details.method).toBe('POST');
      expect(log.details.statusCode).toBe(401);
      expect(log.details.status).toBe('failure');
    });
  });
});
