const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');
const { Parser } = require('json2csv');
const { XMLBuilder } = require('fast-xml-parser');

const User = require('../models/User');
const Task = require('../models/Task');
const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

const EXPORT_DIR = path.join(__dirname, '../../temp/exports'); // Temporary directory for exports
const EXPORT_RETENTION_DAYS = 7; // Auto-delete exports after 7 days

// Ensure export directory exists
fs.mkdir(EXPORT_DIR, { recursive: true }).catch(err => {
  logger.error('Failed to create export directory:', err.message);
});

// Encryption configuration for user-provided password
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY_DERIVATION_ITERATIONS = 100000;
const ENCRYPTION_SALT_LENGTH = 16;
const ENCRYPTION_IV_LENGTH = 16;

class DataExportService {
  /**
   * Encrypts data using a user-provided password (key).
   * @param {Buffer} buffer - The data to encrypt.
   * @param {string} password - The user-provided password.
   * @returns {object} - { iv, salt, encryptedData }
   */
  static async encryptWithPassword(buffer, password) {
    const salt = crypto.randomBytes(ENCRYPTION_SALT_LENGTH);
    const key = await this._deriveKey(password, salt);
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);

    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      encryptedData: encrypted.toString('hex'),
    };
  }

  /**
   * Decrypts data using a user-provided password (key).
   * @param {object} encryptedPayload - { iv, salt, encryptedData }
   * @param {string} password - The user-provided password.
   * @returns {Buffer} - The decrypted data.
   */
  static async decryptWithPassword(encryptedPayload, password) {
    const { iv, salt, encryptedData } = encryptedPayload;

    const key = await this._deriveKey(password, Buffer.from(salt, 'hex'));
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, Buffer.from(iv, 'hex'));

    let decrypted = decipher.update(Buffer.from(encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  }

  /**
   * Derives a cryptographic key from a password and salt using PBKDF2.
   * @param {string} password - The user-provided password.
   * @param {Buffer} salt - A random salt.
   * @returns {Promise<Buffer>} - The derived key.
   * @private
   */
  static _deriveKey(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, ENCRYPTION_KEY_DERIVATION_ITERATIONS, 32, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey);
      });
    });
  }

  /**
   * Exports user data in a specified format, encrypts it, and saves it temporarily.
   * @param {string} userId - The ID of the user whose data is to be exported.
   * @param {'json' | 'csv' | 'xml'} format - The desired output format.
   * @param {string} encryptionPassword - The user-provided password to encrypt the export.
   * @returns {Promise<string>} - The filename of the exported archive.
   */
  static async exportUserData(userId, format, encryptionPassword) {
    if (!['json', 'csv', 'xml'].includes(format)) {
      throw new Error('Invalid export format specified.');
    }
    if (!encryptionPassword || encryptionPassword.length < 8) { // Basic validation
      throw new Error('Encryption password is required and must be at least 8 characters long.');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const userData = {};

    try {
      // Fetch User Data
      const user = await User.findById(userObjectId).select('-password'); // Exclude password
      if (!user) throw new Error('User not found.');
      userData.user = user.toObject({ virtuals: true }); // Include virtuals like decrypted email

      // Fetch Tasks
      userData.tasks = await Task.find({ userId: userObjectId }).lean();

      // Fetch Consents
      userData.consents = await Consent.find({ userId: userObjectId }).lean();

      // Fetch Audit Logs related to this user (as actor)
      // Note: This might fetch a lot of data. Consider limits/pagination for large systems.
      userData.auditLogs = await AuditLog.find({ userId: userObjectId }).lean();

      let formattedData;
      switch (format) {
        case 'json':
          formattedData = JSON.stringify(userData, null, 2);
          break;
        case 'csv':
          // CSV conversion needs flattening and specific fields
          // This is a simplified example; real CSV export might need more complex logic
          const allRecords = [
            ...userData.tasks.map(t => ({ type: 'task', ...t })),
            ...userData.consents.map(c => ({ type: 'consent', ...c, categories: JSON.stringify(Object.fromEntries(c.categories)) })),
            ...userData.auditLogs.map(a => ({ type: 'auditLog', ...a, details: JSON.stringify(a.details) })),
            // User data needs special handling for CSV
            { type: 'user', ...userData.user, roles: JSON.stringify(userData.user.roles), permissions: JSON.stringify(userData.user.permissions) }
          ];
          const json2csvParser = new Parser();
          formattedData = json2csvParser.parse(allRecords);
          break;
        case 'xml':
          const xmlBuilder = new XMLBuilder({
            format: true,
            ignoreAttributes: false,
            rootName: 'userData',
            arrayNodeName: 'item'
          });
          // Converting Maps to objects for XML output
          const serializableUserData = {
            user: userData.user,
            tasks: userData.tasks,
            consents: userData.consents.map(c => ({ ...c, categories: Object.fromEntries(c.categories) })),
            auditLogs: userData.auditLogs,
          };
          formattedData = xmlBuilder.build(serializableUserData);
          break;
      }

      const rawBuffer = Buffer.from(formattedData, 'utf8');
      const encryptedPayload = await this.encryptWithPassword(rawBuffer, encryptionPassword);

      const fileName = `export_${userId}_${Date.now()}.json.enc`; // .json.enc or .csv.enc etc.
      const filePath = path.join(EXPORT_DIR, fileName);

      await fs.writeFile(filePath, JSON.stringify(encryptedPayload));

      // Schedule for auto-deletion
      const deletionTime = Date.now() + EXPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
      logger.info(`Export ${fileName} created for user ${userId}. Scheduled for deletion on ${new Date(deletionTime)}.`);

      return fileName;
    } catch (error) {
      logger.error(`Error exporting data for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Retrieves an encrypted user data export.
   * @param {string} fileName - The filename of the encrypted export.
   * @returns {Promise<object>} - The encrypted payload.
   */
  static async getEncryptedExport(fileName) {
    const filePath = path.join(EXPORT_DIR, fileName);
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Export file not found.');
      }
      logger.error(`Error reading encrypted export file ${fileName}:`, error.message);
      throw error;
    }
  }

  /**
   * Initiates a job to clean up old export files.
   * This should be run periodically (e.g., daily cron job).
   */
  static async cleanupOldExports() {
    logger.info('Starting cleanup of old export files...');
    const now = Date.now();
    try {
      const files = await fs.readdir(EXPORT_DIR);
      for (const file of files) {
        const filePath = path.join(EXPORT_DIR, file);
        const stats = await fs.stat(filePath);
        const fileAgeMs = now - stats.mtimeMs;
        const retentionMs = EXPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000;

        if (fileAgeMs > retentionMs) {
          await fs.unlink(filePath);
          logger.info(`Deleted old export file: ${file}`);
        }
      }
      logger.info('Cleanup of old export files completed.');
    } catch (error) {
      logger.error('Error during old export files cleanup:', error.message);
    }
  }
}

// Optionally, run cleanup periodically
// setInterval(() => DataExportService.cleanupOldExports(), EXPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000); // Once every X days

module.exports = DataExportService;
