const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');

const Consent = require('../models/Consent');
const User = require('../models/User'); // For creating test users
const auditLogger = require('../middleware/auditLogger'); // For mocking
const consentCheck = require('../middleware/consentCheck');
const consentRoutes = require('../routes/gdpr/consent');
const logger = require('../config/logger');

// Set test environment variables
process.env.JWT_SECRET = 'consent-test-secret-key-minimum-32-characters-long-for-testing';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/diform-consent-test';

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Mock AuditService to prevent actual database writes in tests
jest.mock('../services/auditService', () => ({
  logEvent: jest.fn(),
}));

// Mock the encryption functions for User model to prevent issues in auth
jest.mock('../utils/encryption', () => ({
  encrypt: jest.fn((text) => `encrypted_${text}`),
  decrypt: jest.fn((text) => text.replace('encrypted_', '')),
  initializeEncryptionKey: jest.fn().mockResolvedValue(true),
}));


describe('Consent Management System', () => {
  let app;
  let testUser, testUserToken;
  const CURRENT_CONSENT_VERSION = '1.0.0'; // Match server-side

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
          req.user = { _id: decoded.userId, email: decoded.email };
          next();
        } catch (error) {
          return res.status(401).json({ message: 'Invalid or expired token' });
        }
      } else {
        next();
      }
    };
    app.use(mockAuthMiddleware);

    // Mount consent routes
    app.use('/api/gdpr/consent', consentRoutes);

    // A protected route to test consentCheck middleware
    app.get('/api/protected-analytics', consentCheck(['analytics']), (req, res) => {
      res.status(200).json({ message: 'Analytics data accessed' });
    });
    app.get('/api/protected-marketing', consentCheck(['marketing']), (req, res) => {
      res.status(200).json({ message: 'Marketing content accessed' });
    });

    // Create a test user
    testUser = await User.create({
      email: 'consent_test@example.com',
      password: 'ConsentPassword123',
      name: 'Consent User'
    });
    testUserToken = jwt.sign({ userId: testUser._id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Consent.deleteMany({}); // Clear consents before each test
    auditLogger.mockClear(); // Clear mock calls
  });

  describe('Consent Model', () => {
    it('should create a consent record successfully', async () => {
      const consent = await Consent.create({
        userId: testUser._id,
        categories: { necessary: true, analytics: true },
        version: CURRENT_CONSENT_VERSION,
        ipAddress: '127.0.0.1',
        userAgent: 'jest-test'
      });
      expect(consent).toBeDefined();
      expect(consent.userId.toString()).toBe(testUser._id.toString());
      expect(consent.categories.get('necessary')).toBe(true);
      expect(consent.categories.get('analytics')).toBe(true);
      expect(consent.version).toBe(CURRENT_CONSENT_VERSION);
      expect(consent.status).toBe('active');
    });

    it('should enforce unique active consent per user per version', async () => {
      await Consent.create({
        userId: testUser._id,
        categories: { necessary: true, analytics: true },
        version: CURRENT_CONSENT_VERSION,
        status: 'active'
      });
      await expect(
        Consent.create({
          userId: testUser._id,
          categories: { necessary: true, marketing: true },
          version: CURRENT_CONSENT_VERSION,
          status: 'active'
        })
      ).rejects.toThrow(mongoose.Error.ValidationError); // Mongoose validation on unique index
    });
  });

  describe('Consent Routes (/api/gdpr/consent)', () => {
    it('GET /api/gdpr/consent should return no active consent if none exists', async () => {
      const response = await request(app)
        .get('/api/gdpr/consent')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('No active consent found for this user.');
      expect(response.body.consent.status).toBe('inactive');
    });

    it('POST /api/gdpr/consent should set new consent preferences', async () => {
      const preferences = { analytics: true, marketing: false };
      const response = await request(app)
        .post('/api/gdpr/consent')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ categories: preferences })
        .expect(201);

      expect(response.body.message).toBe('Consent preferences updated successfully.');
      expect(response.body.consent.categories.analytics).toBe(true);
      expect(response.body.consent.categories.marketing).toBe(false);
      expect(response.body.consent.categories.necessary).toBe(true); // Necessary is always true
      expect(response.body.consent.status).toBe('active');

      const consentInDb = await Consent.findOne({ userId: testUser._id, status: 'active' });
      expect(consentInDb).toBeDefined();
      expect(consentInDb.categories.get('analytics')).toBe(true);
      expect(consentInDb.categories.get('marketing')).toBe(false);
      expect(AuditService.logEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'gdpr.consentUpdate' }));
    });

    it('POST /api/gdpr/consent should update existing consent by withdrawing previous', async () => {
      // First consent
      await request(app)
        .post('/api/gdpr/consent')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ categories: { analytics: true, marketing: false } });

      // Update consent
      const newPreferences = { analytics: false, marketing: true };
      const response = await request(app)
        .post('/api/gdpr/consent')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ categories: newPreferences })
        .expect(201);

      expect(response.body.consent.categories.analytics).toBe(false);
      expect(response.body.consent.categories.marketing).toBe(true);

      const activeConsent = await Consent.findOne({ userId: testUser._id, status: 'active' });
      expect(activeConsent.categories.get('analytics')).toBe(false);
      expect(activeConsent.categories.get('marketing')).toBe(true);

      const withdrawnConsents = await Consent.find({ userId: testUser._id, status: 'withdrawn' });
      expect(withdrawnConsents).toHaveLength(1);
    });

    it('DELETE /api/gdpr/consent should withdraw all active consent', async () => {
      // Set initial consent
      await request(app)
        .post('/api/gdpr/consent')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ categories: { analytics: true, marketing: true } });

      // Withdraw consent
      const response = await request(app)
        .delete('/api/gdpr/consent')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.body.message).toBe('All active consent withdrawn successfully.');
      const activeConsent = await Consent.findOne({ userId: testUser._id, status: 'active' });
      expect(activeConsent).toBeNull();
      const withdrawnConsent = await Consent.findOne({ userId: testUser._id, status: 'withdrawn' });
      expect(withdrawnConsent).toBeDefined();
      expect(AuditService.logEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'gdpr.consentWithdrawal' }));
    });
  });

  describe('consentCheck Middleware', () => {
    beforeEach(async () => {
      // Ensure user has analytics consent granted by default for these tests
      await Consent.deleteMany({});
      await Consent.create({
        userId: testUser._id,
        categories: { necessary: true, analytics: true, marketing: false },
        version: CURRENT_CONSENT_VERSION,
        status: 'active'
      });
    });

    it('should allow access if required consent is granted', async () => {
      await request(app)
        .get('/api/protected-analytics')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);
    });

    it('should deny access if required consent is not granted', async () => {
      await request(app)
        .get('/api/protected-marketing')
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(403);
    });

    it('should deny access for unauthenticated users', async () => {
      await request(app)
        .get('/api/protected-analytics')
        .expect(401);
    });
  });
});
