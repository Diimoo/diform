const express = require('express');
const router = express.Router();
const DataExportService = require('../../services/dataExportService');
const { authenticate } = require('../../middleware/auth');
const auditLogger = require('../../middleware/auditLogger');
const logger = require('../../config/logger');
const path = require('path');
const fs = require('fs').promises; // For checking file existence

const EXPORT_DIR = path.join(__dirname, '../../temp/exports');

/**
 * POST /api/gdpr/export/request
 * Requests a user data export. The export will be encrypted with a user-provided password.
 */
router.post('/request', authenticate, auditLogger('gdpr.dataExportRequest', { resourceType: 'UserData' }, (req) => ({ format: req.body.format })), async (req, res) => {
  try {
    const userId = req.user._id;
    const { format, encryptionPassword } = req.body;

    if (!format || !['json', 'csv', 'xml'].includes(format)) {
      return res.status(400).json({ message: 'Invalid or missing export format. Supported: json, csv, xml.' });
    }
    if (!encryptionPassword || encryptionPassword.length < 8) {
      return res.status(400).json({ message: 'Encryption password is required and must be at least 8 characters long.' });
    }

    // Initiate the export process
    const exportFilename = await DataExportService.exportUserData(userId.toString(), format, encryptionPassword);

    res.status(202).json({
      message: 'Data export initiated. You can download your encrypted data using the provided filename.',
      filename: exportFilename,
      expires: `Exports are automatically deleted after ${DataExportService.EXPORT_RETENTION_DAYS} days.`
    });
  } catch (error) {
    logger.error('Error requesting data export:', error);
    res.status(500).json({ message: 'Failed to initiate data export.' });
  }
});

/**
 * GET /api/gdpr/export/download/:filename
 * Downloads an encrypted user data export.
 */
router.get('/download/:filename', authenticate, auditLogger('gdpr.dataExportDownload', { resourceType: 'UserData' }, (req) => ({ filename: req.params.filename })), async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const filename = req.params.filename;
    const filePath = path.join(EXPORT_DIR, filename);

    // Basic check if the filename pattern matches an expected export format
    if (!filename.match(/^export_[a-f0-9]+_[0-9]+\.(json|csv|xml)\.enc$/)) {
      return res.status(400).json({ message: 'Invalid export filename format.' });
    }

    // Verify ownership: This is crucial. For now, we assume the filename contains userId
    // A more robust solution would involve a separate "ExportJob" model storing userId and filename,
    // and checking ownership against that model.
    const filenameUserId = filename.split('_')[1];
    if (filenameUserId !== userId) {
      logger.warn(`Attempted unauthorized export download: User ${userId} tried to download ${filename}.`);
      return res.status(403).json({ message: 'Forbidden: You do not own this export file.' });
    }

    // Check if file exists
    try {
      await fs.access(filePath, fs.constants.R_OK);
    } catch (error) {
      logger.warn(`Export file not found or inaccessible: ${filePath}`);
      return res.status(404).json({ message: 'Export file not found or has expired.' });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        logger.error(`Error sending export file ${filename}:`, err);
        res.status(500).json({ message: 'Failed to download export file.' });
      } else {
        logger.info(`User ${userId} downloaded export file: ${filename}.`);
      }
    });
  } catch (error) {
    logger.error('Error downloading data export:', error);
    res.status(500).json({ message: 'Failed to download data export.' });
  }
});

module.exports = router;
