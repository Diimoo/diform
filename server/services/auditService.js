const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

/**
 * Service for creating and managing audit logs.
 */
class AuditService {
  /**
   * Logs an event to the audit trail.
   * @param {string} eventType - The type of event (e.g., 'user.login', 'task.create').
   * @param {string|null} userId - The ID of the user who performed the action.
   * @param {string|null} actor - Identifier of the actor if userId is not available (e.g., 'system', 'anonymous').
   * @param {string|null} resourceType - The type of resource affected (e.g., 'User', 'Task').
   * @param {string|null} resourceId - The ID of the resource affected.
   * @param {object} details - Additional details about the event.
   * @param {object} req - The Express request object, if available, for IP and User-Agent.
   */
  static async logEvent({ eventType, userId = null, actor = null, resourceType = null, resourceId = null, details = {}, req = null }) {
    try {
      const auditLogData = {
        eventType,
        userId: userId, // Mongoose will handle null or invalid ObjectId gracefully
        actor: actor || (req && req.user ? req.user.email || req.user._id.toString() : 'anonymous'),
        resourceType,
        resourceId,
        details,
        ipAddress: req ? req.ip : null,
        userAgent: req && req.headers ? req.headers['user-agent'] : null,
      };

      const auditLog = new AuditLog(auditLogData);
      await auditLog.save();
      logger.debug(`Audit event logged: ${eventType} by ${auditLogData.actor}`);
    } catch (error) {
      logger.error(`Failed to log audit event "${eventType}":`, error.message);
      // It's important not to throw an error here, as audit logging should ideally not
      // block or fail the primary operation. Just log the failure.
    }
  }

  /**
   * Retrieves audit logs based on criteria.
   * @param {object} filters - Query filters (e.g., { userId: '...', eventType: '...' }).
   * @param {object} options - Query options (e.g., { limit: 10, skip: 0, sort: { timestamp: -1 } }).
   * @returns {Promise<Array>} - An array of AuditLog documents.
   */
  static async getLogs(filters = {}, options = {}) {
    try {
      const { limit, skip, sort } = options;
      const query = AuditLog.find(filters)
        .sort(sort || { timestamp: -1 })
        .populate('userId', 'email name'); // Populate user data if userId is present

      if (limit) query.limit(parseInt(limit, 10));
      if (skip) query.skip(parseInt(skip, 10));

      return await query.exec();
    } catch (error) {
      logger.error('Error fetching audit logs:', error.message);
      throw error;
    }
  }

  /**
   * Counts audit logs based on criteria.
   * @param {object} filters - Query filters.
   * @returns {Promise<number>} - The count of AuditLog documents.
   */
  static async countLogs(filters = {}) {
    try {
      return await AuditLog.countDocuments(filters);
    } catch (error) {
      logger.error('Error counting audit logs:', error.message);
      throw error;
    }
  }
}

module.exports = AuditService;
