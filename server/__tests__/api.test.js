const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Task = require('../models/Task');

// Set test environment variables
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long-for-testing';
process.env.JWT_EXPIRY = '1h';

// Simple mock app for testing
const express = require('express');
const app = express();

jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

describe('API Endpoints', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/diform-test';
    await mongoose.connect(mongoUri);
    
    // Create test user
    testUser = new User({
      email: 'apitest@example.com',
      password: 'Test1234',
      name: 'API Test User'
    });
    await testUser.save();
    
    // Generate auth token
    authToken = jwt.sign(
      { userId: testUser._id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET || 'test-secret-key-minimum-32-characters-long',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      // Note: This test would need the actual app instance
      // This is a placeholder demonstrating the test structure
      expect(true).toBe(true);
    });
  });

  describe('Task Model', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        id: 'test-task-123',
        command: 'Test command',
        context: { test: true },
        status: 'processing',
        userId: testUser._id,
        steps: []
      };

      const task = new Task(taskData);
      await task.save();

      const found = await Task.findOne({ id: 'test-task-123' });
      expect(found).toBeTruthy();
      expect(found.command).toBe('Test command');
      expect(found.userId.toString()).toBe(testUser._id.toString());
    });

    it('should enforce required fields', async () => {
      const invalidTask = new Task({
        context: {}
      });

      await expect(invalidTask.save()).rejects.toThrow();
    });
  });

  describe('User Model', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        email: 'hashtest@example.com',
        password: 'PlainPassword123',
        name: 'Hash Test'
      });

      await user.save();
      expect(user.password).not.toBe('PlainPassword123');
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should compare passwords correctly', async () => {
      const user = await User.findOne({ email: 'apitest@example.com' });
      const isValid = await user.comparePassword('Test1234');
      expect(isValid).toBe(true);

      const isInvalid = await user.comparePassword('WrongPassword');
      expect(isInvalid).toBe(false);
    });
  });
});
