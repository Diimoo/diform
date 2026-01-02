const AuditService = require('../services/auditService');
const logger = require('../config/logger');

/**
 * Middleware factory to log audit events for incoming requests.
 * @param {string} eventType - The base event type for this audit log (e.g., 'user.action', 'admin.resource').
 * @param {object} defaultDetails - Optional default details to include in the log.
 * @param {function} customDetailsExtractor - Optional function(req, res) to extract custom details.
 * @returns {function} Express middleware function.
 */
const auditLogger = (eventType, defaultDetails = {}, customDetailsExtractor = null) => {
  return (req, res, next) => {
    const start = process.hrtime.bigint();

    // Function to log the audit event after the response is sent
    const logAuditEvent = async () => {
      res.removeListener('finish', logAuditEvent);
      res.removeListener('close', logAuditEvent);

      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // milliseconds

      let userId = null;
      let actor = 'anonymous';
      if (req.user && req.user._id) {
        userId = req.user._id;
        actor = req.user.email || req.user._id.toString(); // Prefer email if available
      } else if (req.user && req.user.email) {
        actor = req.user.email;
      }

      let details = {
        ...defaultDetails,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseDurationMs: duration,
        // Potentially sensitive request body details should be handled carefully
        // For now, avoid logging full req.body unless explicitly needed and sanitized
      };

      if (customDetailsExtractor) {
        try {
          const custom = customDetailsExtractor(req, res);
          details = { ...details, ...custom };
        } catch (e) {
          logger.error('Error extracting custom audit details:', e.message);
        }
      }

      // Determine resourceType and resourceId from context (e.g., URL parameters)
      let resourceType = defaultDetails.resourceType;
      let resourceId = defaultDetails.resourceId;

      if (!resourceType && req.params && req.params.id) {
        // Simple heuristic: if there's an :id param, try to infer resourceType from URL
        const parts = req.originalUrl.split('/');
        // Find the part before the ID, typically the resource name (e.g., 'users' from '/users/:id')
        const idIndex = parts.indexOf(req.params.id);
        if (idIndex > 0) {
          resourceType = parts[idIndex - 1].replace(/-/g, '_'); // e.g., 'admin_roles'
        }
      }

      // If eventType is generic, try to make it more specific
      let finalEventType = eventType;
      if (finalEventType.includes('.action') && req.method) {
        finalEventType = `${resourceType || 'general'}.${req.method.toLowerCase()}`;
      } else if (finalEventType.includes('.resource') && resourceType) {
        finalEventType = `${resourceType}.${eventType.split('.')[1] || 'access'}`;
      }
      
      // Check for success or failure based on status code
      const status = res.statusCode >= 200 && res.statusCode < 400 ? 'success' : 'failure';
      details.status = status;

      await AuditService.logEvent({
        eventType: finalEventType,
        userId,
        actor,
        resourceType,
        resourceId: resourceId || (req.params ? req.params.id : null),
        details,
        req, // Pass full request object for IP/User-Agent extraction
      });
    };

    // Attach listeners for response finish or close
    res.on('finish', logAuditEvent);
    res.on('close', logAuditEvent); // In case connection is closed prematurely

    next();
  };
};

module.exports = auditLogger;
