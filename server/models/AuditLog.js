const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'user.login', 'user.logout', 'user.create', 'user.update', 'user.delete',
      'user.passwordChange', 'user.roleChange', 'user.permissionChange',
      'task.create', 'task.update', 'task.delete', 'task.assign',
      'role.create', 'role.update', 'role.delete',
      'permission.create', 'permission.update', 'permission.delete',
      'gdpr.consentChange', 'gdpr.dataExport', 'gdpr.dataDeletionRequest', 'gdpr.dataHardDelete',
      'system.configUpdate', 'system.securityAlert', 'system.backup', 'system.restore',
      // Add more as needed
    ],
    description: 'The type of event that occurred (e.g., user.login, task.create).'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    description: 'The ID of the user who performed the action, if applicable.'
  },
  actor: {
    type: String,
    trim: true,
    description: 'Identifier of the actor (e.g., system, anonymous, or a username/email if userId is not used).'
  },
  resourceType: {
    type: String,
    trim: true,
    description: 'The type of resource affected (e.g., "User", "Task", "Role").'
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    // No ref here as it can apply to different models
    description: 'The ID of the resource affected by the event.'
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Stores arbitrary JSON data
    description: 'Additional details about the event, such as old/new values, reasons, etc.'
  },
  ipAddress: {
    type: String,
    trim: true,
    description: 'The IP address from which the action originated.'
  },
  userAgent: {
    type: String,
    trim: true,
    description: 'The user agent string of the client that initiated the action.'
  }
}, {
  timestamps: false, // We're using a custom 'timestamp' field
  versionKey: false, // Disable the __v field
  minimize: false, // Keep empty objects in details if they are explicitly set
});

// Enforce immutability: prevent updates after creation
auditLogSchema.pre('findOneAndUpdate', function(next) {
  next(new Error('Audit logs are immutable and cannot be updated.'));
});
auditLogSchema.pre('updateMany', function(next) {
  next(new Error('Audit logs are immutable and cannot be updated.'));
});
auditLogSchema.pre('update', function(next) {
  next(new Error('Audit logs are immutable and cannot be updated.'));
});

// TTL index for automatic document deletion after a certain period
// Defaulting to 1 year (31536000 seconds). This can be configured in the future.
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
