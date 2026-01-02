/**
 * @fileoverview Defines all available permissions in the system.
 * This list is used to seed the Permission model and for consistent permission checks.
 */

module.exports = [
  // User Management Permissions
  { resource: 'users', action: 'create', description: 'Create new user accounts' },
  { resource: 'users', action: 'read', description: 'View user profiles and details' },
  { resource: 'users', action: 'update', description: 'Modify user account information' },
  { resource: 'users', action: 'delete', description: 'Delete user accounts' },
  { resource: 'users', action: 'manageRoles', description: 'Assign or revoke roles from users' },
  { resource: 'users', action: 'managePermissions', description: 'Assign or revoke specific permissions from users' },

  // Role Management Permissions
  { resource: 'roles', action: 'create', description: 'Create new roles' },
  { resource: 'roles', action: 'read', description: 'View role definitions and assigned permissions' },
  { resource: 'roles', action: 'update', description: 'Modify role definitions and assigned permissions' },
  { resource: 'roles', action: 'delete', description: 'Delete roles' },

  // Permission Management Permissions
  { resource: 'permissions', action: 'read', description: 'View all available system permissions' },

  // Task Management Permissions
  { resource: 'tasks', action: 'create', description: 'Create new tasks' },
  { resource: 'tasks', action: 'read', description: 'View tasks' },
  { resource: 'tasks', action: 'update', description: 'Update existing tasks' },
  { resource: 'tasks', action: 'delete', description: 'Delete tasks' },
  { resource: 'tasks', action: 'assign', description: 'Assign tasks to users' },

  // System Settings Permissions
  { resource: 'settings', action: 'read', description: 'View system configuration settings' },
  { resource: 'settings', action: 'update', description: 'Modify system configuration settings' },

  // Audit Log Permissions
  { resource: 'auditlogs', action: 'read', description: 'View system audit logs' },

  // GDPR/Privacy Permissions
  { resource: 'gdpr', action: 'manageConsent', description: 'Manage user consent settings' },
  { resource: 'gdpr', action: 'exportData', description: 'Export user data' },
  { resource: 'gdpr', action: 'deleteData', description: 'Trigger user data deletion (Right to be Forgotten)' },
];
