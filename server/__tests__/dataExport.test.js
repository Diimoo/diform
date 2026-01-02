const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises; // Use promises version for mocking
const path = require('path');

const DataExportService = require('../services/dataExportService');
const User = require('../models/User');
const Task = require('../models/Task');
const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const exportRoutes = require('../routes/gdpr/export');
const AuditService = require('../services/auditService'); // Mocked
const logger = require('../config/logger');

// Set test environment variables
process.env.JWT_SECRET = 'export-test-secret-key-minimum-32-characters-long-for-testing';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/diform-dataexport-test';

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Mock AuditService
jest.mock('../services/auditService', () => ({
  logEvent: jest.fn(),
}));

// Mock encryption functions for User model
jest.mock('../utils/encryption', () => ({
  encrypt: jest.fn((text) => `encrypted_${text}`),
  decrypt: jest.fn((text) => text.replace('encrypted_', '')),
  initializeEncryptionKey: jest.fn().mockResolvedValue(true),
}));

// Mock fs to prevent actual file system operations during some tests
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn(),
    readdir: jest.fn(),
    stat: jest.fn(),
    unlink: jest.fn(),
    constants: { R_OK: 4 },
    access: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Data Portability & Export System', () => {
  let app;
  let testUser, testUserToken;
  let testTask, testConsent, testAuditLog;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    app = express();
    app.use(express.json());

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

    app.use('/api/gdpr/export', exportRoutes);

    testUser = await User.create({
      email: 'export_test@example.com',
      password: 'ExportPassword123',
      name: 'Export User'
    });
    testUserToken = jwt.sign({ userId: testUser._id, email: testUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    testTask = await Task.create({
      id: 'test-task-1',
      command: 'test command',
      userId: testUser._id,
      status: 'completed',
      steps: []
    });

    testConsent = await Consent.create({
      userId: testUser._id,
      categories: { necessary: true, analytics: true },
      version: '1.0.0',
    });

    testAuditLog = await AuditLog.create({
      eventType: 'user.login',
      userId: testUser._id,
      actor: testUser.email,
      resourceType: 'User',
    });

    // Ensure mock fs.mkdir is called for EXPORT_DIR
    await fs.promises.mkdir.mockClear();
    await DataExportService.cleanupOldExports(); // To trigger mkdir once
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await Consent.deleteMany({});
    await AuditLog.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks(); // Clear mocks for fs, logger, AuditService etc.
  });

  describe('DataExportService Encryption', () => {
    const testBuffer = Buffer.from('some sensitive data');
    const testPassword = 'mySecurePassword';

    it('should encrypt and decrypt data successfully with a password', async () => {
      const encryptedPayload = await DataExportService.encryptWithPassword(testBuffer, testPassword);
      expect(encryptedPayload).toHaveProperty('iv');
      expect(encryptedPayload).toHaveProperty('salt');
      expect(encryptedPayload).toHaveProperty('encryptedData');

      const decryptedBuffer = await DataExportService.decryptWithPassword(encryptedPayload, testPassword);
      expect(decryptedBuffer.toString('utf8')).toBe(testBuffer.toString('utf8'));
    });

    it('should throw an error for incorrect password during decryption', async () => {
      const encryptedPayload = await DataExportService.encryptWithPassword(testBuffer, testPassword);
      await expect(DataExportService.decryptWithPassword(encryptedPayload, 'wrongPassword')).rejects.toThrow();
    });
  });

  describe('DataExportService exportUserData', () => {
    it('should export user data in JSON format and encrypt it', async () => {
      const filename = await DataExportService.exportUserData(testUser._id.toString(), 'json', 'testPassword123');
      expect(filename).toMatch(/^export_[a-f0-9]+_[0-9]+\.json\.enc$/);
      expect(fs.promises.writeFile).toHaveBeenCalledTimes(1);

      const writtenContent = JSON.parse(fs.promises.writeFile.mock.calls[0][1]);
      expect(writtenContent).toHaveProperty('iv');
      expect(writtenContent).toHaveProperty('salt');
      expect(writtenContent).toHaveProperty('encryptedData');

      const decrypted = await DataExportService.decryptWithPassword(writtenContent, 'testPassword123');
      const data = JSON.parse(decrypted.toString('utf8'));
      expect(data.user._id).toBe(testUser._id.toString());
      expect(data.tasks).toHaveLength(1);
      expect(data.consents).toHaveLength(1);
      expect(data.auditLogs).toHaveLength(1);
      expect(AuditService.logEvent).not.toHaveBeenCalled(); // Service logs directly, not via middleware
    });

    it('should export user data in CSV format and encrypt it', async () => {
      const filename = await DataExportService.exportUserData(testUser._id.toString(), 'csv', 'testPassword123');
      expect(filename).toMatch(/^export_[a-f0-9]+_[0-9]+\.json\.enc$/); // Still .json.enc because we store encrypted JSON
      const writtenContent = JSON.parse(fs.promises.writeFile.mock.calls[0][1]);
      const decrypted = await DataExportService.decryptWithPassword(writtenContent, 'testPassword123');
      const data = decrypted.toString('utf8');
      expect(data).toContain('type,id,command,userId,status'); // Check for CSV headers
      expect(data).toContain(testUser._id.toString());
    });

    it('should export user data in XML format and encrypt it', async () => {
      const filename = await DataExportService.exportUserData(testUser._id.toString(), 'xml', 'testPassword123');
      expect(filename).toMatch(/^export_[a-f0-9]+_[0-9]+\.json\.enc$/);
      const writtenContent = JSON.parse(fs.promises.writeFile.mock.calls[0][1]);
      const decrypted = await DataExportService.decryptWithPassword(writtenContent, 'testPassword123');
      const data = decrypted.toString('utf8');
      expect(data).toContain('<userData>');
      expect(data).toContain(`<email>${testUser.email}</email>`);
    });

    it('should throw error for invalid export format', async () => {
      await expect(DataExportService.exportUserData(testUser._id.toString(), 'pdf', 'testPassword123')).rejects.toThrow('Invalid export format specified.');
    });
  });

  describe('DataExportService cleanupOldExports', () => {
    it('should delete old export files', async () => {
      // Mock readdir to return some files
      fs.promises.readdir.mockResolvedValueOnce(['old_export.json.enc', 'recent_export.json.enc']);
      
      // Mock stat for old file (more than EXPORT_RETENTION_DAYS old)
      fs.promises.stat.mockImplementationOnce((filePath) => {
        if (filePath.includes('old_export')) {
          return Promise.resolve({ mtimeMs: Date.now() - (DataExportService.EXPORT_RETENTION_DAYS + 1) * 24 * 60 * 60 * 1000 });
        }
        return Promise.resolve({ mtimeMs: Date.now() }); // Recent file
      });
      
      await DataExportService.cleanupOldExports();

      expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
      expect(fs.promises.unlink).toHaveBeenCalledWith(expect.stringContaining('old_export.json.enc'));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Deleted old export file: old_export.json.enc'));
    });

    it('should not delete recent export files', async () => {
      fs.promises.readdir.mockResolvedValueOnce(['recent_export.json.enc']);
      fs.promises.stat.mockResolvedValueOnce({ mtimeMs: Date.now() });

      await DataExportService.cleanupOldExports();

      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });
  });

  describe('Export Routes (/api/gdpr/export)', () => {
    it('POST /request should initiate an export', async () => {
      const response = await request(app)
        .post('/api/gdpr/export/request')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ format: 'json', encryptionPassword: 'securePassword123' })
        .expect(202);

      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toMatch(/^export_[a-f0-9]+_[0-9]+\.json\.enc$/);
      expect(AuditService.logEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'gdpr.dataExportRequest' }));
    });

    it('GET /download/:filename should download the export', async () => {
      const mockEncryptedPayload = await DataExportService.encryptWithPassword(Buffer.from('{"data":"mock"}'), 'securePassword123');
      const mockFilename = `export_${testUser._id.toString()}_${Date.now()}.json.enc`;
      
      // Mock readFile for download
      fs.promises.readFile.mockResolvedValueOnce(JSON.stringify(mockEncryptedPayload));
      // Mock fs.promises.access for file existence check
      fs.promises.access.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .get(`/api/gdpr/export/download/${mockFilename}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(200);

      expect(response.header['content-disposition']).toContain(`attachment; filename="${mockFilename}"`);
      // We cannot easily decrypt the streamed content here with supertest,
      // but we can assert on the filename and success.
      expect(AuditService.logEvent).toHaveBeenCalledWith(expect.objectContaining({ eventType: 'gdpr.dataExportDownload' }));
    });

    it('GET /download/:filename should prevent unauthorized download', async () => {
      const anotherUserId = new mongoose.Types.ObjectId();
      const mockFilename = `export_${anotherUserId.toString()}_${Date.now()}.json.enc`;

      await request(app)
        .get(`/api/gdpr/export/download/${mockFilename}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(403);

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Attempted unauthorized export download'));
    });

    it('GET /download/:filename should return 404 if file not found', async () => {
      const mockFilename = `export_${testUser._id.toString()}_${Date.now()}.json.enc`;
      fs.promises.access.mockRejectedValueOnce({ code: 'ENOENT' }); // Simulate file not found

      await request(app)
        .get(`/api/gdpr/export/download/${mockFilename}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .expect(404);
    });
  });
});
