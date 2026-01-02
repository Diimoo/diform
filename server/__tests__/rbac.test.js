const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const express = require('express');

const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { requirePermission } = require('../middleware/rbac');
const adminRolesRoutes = require('../routes/admin/roles'); // Import the roles admin routes

// Set test environment variables
process.env.JWT_SECRET = 'rbac-test-secret-key-minimum-32-characters-long-for-testing';
process.env.JWT_EXPIRY = '1h';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/diform-rbac-test';

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

// Setup a mock Express app to test middleware and routes
const app = express();
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

// Mount the admin roles routes
app.use('/api/admin/roles', adminRolesRoutes);

// A simple test route to check requirePermission middleware directly
app.get('/test-protected', requirePermission('test', 'access'), (req, res) => {
  res.status(200).json({ message: 'Access granted to test resource' });
});

describe('RBAC System', () => {
  let adminUser, regularUser, adminToken, regularUserToken;
  let viewUsersPermission, createUsersPermission, manageRolesPermission, testAccessPermission;
  let adminRole, editorRole;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Role.deleteMany({});
    await Permission.deleteMany({});

    // 1. Create Permissions
    viewUsersPermission = await Permission.create({ resource: 'users', action: 'read', description: 'View user accounts' });
    createUsersPermission = await Permission.create({ resource: 'users', action: 'create', description: 'Create user accounts' });
    manageRolesPermission = await Permission.create({ resource: 'roles', action: 'manage', description: 'Manage roles' });
    testAccessPermission = await Permission.create({ resource: 'test', action: 'access', description: 'Access test resource' });
    
    // Create a permission for admin roles management (needed for adminRolesRoutes)
    await Permission.create({ resource: 'roles', action: 'read' });
    await Permission.create({ resource: 'roles', action: 'create' });
    await Permission.create({ resource: 'roles', action: 'update' });
    await Permission.create({ resource: 'roles', action: 'delete' });


    // 2. Create Roles
    adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator role with full access',
      permissions: [
        viewUsersPermission._id,
        createUsersPermission._id,
        manageRolesPermission._id,
        testAccessPermission._id
      ]
    });

    editorRole = await Role.create({
      name: 'editor',
      description: 'Editor role with user read/create',
      permissions: [viewUsersPermission._id, createUsersPermission._id],
      parentRole: adminRole._id // Example of inheritance, though not directly used in these tests for simplicity
    });

    // 3. Create Users
    adminUser = await User.create({
      email: 'admin@example.com',
      password: 'AdminPassword123',
      name: 'Admin User',
      roles: [adminRole._id]
    });
    adminToken = jwt.sign({ userId: adminUser._id, email: adminUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    regularUser = await User.create({
      email: 'user@example.com',
      password: 'UserPassword123',
      name: 'Regular User',
      roles: [editorRole._id] // Assign editor role
    });
    regularUserToken = jwt.sign({ userId: regularUser._id, email: regularUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  describe('Permission Model', () => {
    it('should create a permission successfully', async () => {
      const perm = await Permission.create({ resource: 'products', action: 'view' });
      expect(perm).toBeDefined();
      expect(perm.resource).toBe('products');
      expect(perm.action).toBe('view');
    });

    it('should enforce uniqueness for resource and action', async () => {
      await Permission.create({ resource: 'tasks', action: 'delete' });
      await expect(
        Permission.create({ resource: 'tasks', action: 'delete' })
      ).rejects.toThrow();
    });

    it('should find permission by resource and action', async () => {
      const foundPerm = await Permission.findByResourceAndAction('users', 'read');
      expect(foundPerm._id.toString()).toBe(viewUsersPermission._id.toString());
    });
  });

  describe('Role Model', () => {
    it('should create a role successfully', async () => {
      const newRole = await Role.create({ name: 'viewer', permissions: [viewUsersPermission._id] });
      expect(newRole).toBeDefined();
      expect(newRole.name).toBe('viewer');
      expect(newRole.permissions.length).toBe(1);
    });

    it('should find role by name', async () => {
      const foundRole = await Role.findByName('admin');
      expect(foundRole._id.toString()).toBe(adminRole._id.toString());
    });

    it('should get effective permissions for a role', async () => {
      const permissions = await adminRole.getEffectivePermissions();
      const permissionNames = permissions.map(p => `${p.resource}:${p.action}`).sort();
      
      expect(permissionNames).toEqual([
        'roles:manage', 
        'test:access', 
        'users:create', 
        'users:read',
        // Also include the role management permissions seeded in beforeEach
        'roles:create', 'roles:delete', 'roles:read', 'roles:update'
      ].sort());
    });
  });

  describe('User Model RBAC methods', () => {
    it('should get effective permissions for admin user', async () => {
      const permissions = await adminUser.getEffectivePermissions();
      const permissionIdentifiers = permissions.map(p => `${p.resource}:${p.action}`).sort();
      expect(permissionIdentifiers).toContain('users:read');
      expect(permissionIdentifiers).toContain('roles:manage');
      expect(permissionIdentifiers).toContain('test:access');
    });

    it('should get effective permissions for regular user', async () => {
      const permissions = await regularUser.getEffectivePermissions();
      const permissionIdentifiers = permissions.map(p => `${p.resource}:${p.action}`).sort();
      expect(permissionIdentifiers).toContain('users:read');
      expect(permissionIdentifiers).toContain('users:create');
      expect(permissionIdentifiers).not.toContain('roles:manage');
      expect(permissionIdentifiers).not.toContain('test:access');
    });

    it('admin user should have specific permission', async () => {
      expect(await adminUser.hasPermission('users', 'read')).toBe(true);
      expect(await adminUser.hasPermission('roles', 'manage')).toBe(true);
      expect(await adminUser.hasPermission('test', 'access')).toBe(true);
      expect(await adminUser.hasPermission('users', 'delete')).toBe(false); // Admin role does not explicitly have this in this test setup
    });

    it('regular user should not have admin-specific permission', async () => {
      expect(await regularUser.hasPermission('users', 'read')).toBe(true);
      expect(await regularUser.hasPermission('users', 'create')).toBe(true);
      expect(await regularUser.hasPermission('roles', 'manage')).toBe(false);
    });
  });

  describe('RBAC Middleware (requirePermission)', () => {
    it('should return 401 if no user is authenticated', async () => {
      const response = await request(app)
        .get('/test-protected')
        .expect(401);
      expect(response.body.message).toBe('Unauthorized: No user authenticated');
    });

    it('should return 403 if user lacks permission', async () => {
      const response = await request(app)
        .get('/test-protected')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
      expect(response.body.message).toBe('Forbidden: User lacks permission to access test');
    });

    it('should allow access if user has permission', async () => {
      const response = await request(app)
        .get('/test-protected')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body.message).toBe('Access granted to test resource');
    });
  });

  describe('Admin Roles Routes (/api/admin/roles)', () => {
    // Tests for GET /api/admin/roles
    it('should allow admin to get all roles', async () => {
      const response = await request(app)
        .get('/api/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      expect(response.body).toHaveLength(2); // adminRole and editorRole
      expect(response.body[0]).toHaveProperty('name', 'admin');
    });

    it('should forbid regular user from getting all roles (lacks roles:read)', async () => {
      // Note: The editorRole might gain roles:read due to adminRole inheritance if implemented
      // For this test, assuming editorRole does NOT have roles:read directly.
      const response = await request(app)
        .get('/api/admin/roles')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
      expect(response.body.message).toBe('Forbidden: User lacks permission to read roles');
    });

    // Tests for POST /api/admin/roles
    it('should allow admin to create a new role', async () => {
      const response = await request(app)
        .post('/api/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'viewer', description: 'Viewer role', permissions: [viewUsersPermission._id] })
        .expect(201);
      expect(response.body).toHaveProperty('name', 'viewer');
      expect(response.body.permissions[0]).toBe(viewUsersPermission._id.toString());

      const createdRole = await Role.findByName('viewer');
      expect(createdRole).toBeDefined();
    });

    it('should forbid regular user from creating a new role', async () => {
      const response = await request(app)
        .post('/api/admin/roles')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ name: 'limited', description: 'Limited role' })
        .expect(403);
      expect(response.body.message).toBe('Forbidden: User lacks permission to create roles');
    });

    // Tests for PUT /api/admin/roles/:id
    it('should allow admin to update an existing role', async () => {
      const response = await request(app)
        .put(`/api/admin/roles/${editorRole._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'super-editor', permissions: [createUsersPermission._id, manageRolesPermission._id] })
        .expect(200);
      expect(response.body).toHaveProperty('name', 'super-editor');
      expect(response.body.permissions).toHaveLength(2);
      expect(response.body.permissions[1]).toBe(manageRolesPermission._id.toString());

      const updatedRole = await Role.findById(editorRole._id);
      expect(updatedRole.name).toBe('super-editor');
    });

    it('should forbid regular user from updating a role', async () => {
      const response = await request(app)
        .put(`/api/admin/roles/${editorRole._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ name: 'attempted-update' })
        .expect(403);
      expect(response.body.message).toBe('Forbidden: User lacks permission to update roles');
    });

    // Tests for DELETE /api/admin/roles/:id
    it('should allow admin to delete a role', async () => {
      await request(app)
        .delete(`/api/admin/roles/${editorRole._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedRole = await Role.findById(editorRole._id);
      expect(deletedRole).toBeNull();
    });

    it('should forbid regular user from deleting a role', async () => {
      const response = await request(app)
        .delete(`/api/admin/roles/${editorRole._id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
      expect(response.body.message).toBe('Forbidden: User lacks permission to delete roles');
    });
  });
});
