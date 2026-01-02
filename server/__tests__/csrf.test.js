const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser'); // csurf needs a cookie parser
const jwt = require('jsonwebtoken');

const { conditionalCsrf, addCsrfToken } = require('../middleware/csrf');

// Set test environment variables
process.env.JWT_SECRET = 'csrf-test-secret-key-minimum-32-characters-long-for-testing';

// Mock logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn()
}));

const app = express();
app.use(express.json());
app.use(cookieParser()); // csurf requires cookie-parser middleware

// Apply CSRF middleware
app.use(conditionalCsrf);
app.use(addCsrfToken);

// Test routes
app.get('/test-csrf', (req, res) => {
  res.status(200).json({ message: 'GET request successful' });
});

app.post('/test-csrf', (req, res) => {
  res.status(200).json({ message: 'POST request successful' });
});

// A dummy authentication middleware to get a req.user for token generation
const dummyAuth = (req, res, next) => {
  req.user = { _id: 'testuser123', email: 'test@example.com' };
  next();
};

describe('CSRF Protection Middleware', () => {
  let testUserToken;

  beforeAll(() => {
    // Generate a test JWT token for skipping CSRF
    testUserToken = jwt.sign({ userId: 'testuser123', email: 'test@example.com' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('GET /test-csrf should set X-CSRF-Token header and _csrf cookie', async () => {
    const response = await request(app)
      .get('/test-csrf')
      .expect(200);

    expect(response.headers).toHaveProperty('x-csrf-token');
    const csrfCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('_csrf='));
    expect(csrfCookie).toBeDefined();
  });

  it('POST /test-csrf without token should return 403 Forbidden', async () => {
    const response = await request(app)
      .post('/test-csrf')
      .send({ data: 'test' })
      .expect(403);

    expect(response.text).toContain('Forbidden'); // csurf's default error message
  });

  it('POST /test-csrf with invalid token should return 403 Forbidden', async () => {
    const getResponse = await request(app).get('/test-csrf');
    const csrfToken = getResponse.headers['x-csrf-token'];
    const csrfCookie = getResponse.headers['set-cookie'].find(cookie => cookie.startsWith('_csrf='));

    await request(app)
      .post('/test-csrf')
      .set('Cookie', csrfCookie)
      .set('X-CSRF-Token', 'invalid-token')
      .send({ data: 'test' })
      .expect(403);
  });

  it('POST /test-csrf with valid token should succeed', async () => {
    const getResponse = await request(app).get('/test-csrf');
    const csrfToken = getResponse.headers['x-csrf-token'];
    const csrfCookie = getResponse.headers['set-cookie'].find(cookie => cookie.startsWith('_csrf='));

    const response = await request(app)
      .post('/test-csrf')
      .set('Cookie', csrfCookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ data: 'test' })
      .expect(200);

    expect(response.body.message).toBe('POST request successful');
  });

  it('POST /test-csrf with Bearer token should skip CSRF protection and succeed', async () => {
    const response = await request(app)
      .post('/test-csrf')
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ data: 'test' })
      .expect(200);

    expect(response.body.message).toBe('POST request successful');
  });

  it('POST /test-csrf with Bearer token and valid CSRF token should skip CSRF protection and succeed', async () => {
    const getResponse = await request(app).get('/test-csrf');
    const csrfToken = getResponse.headers['x-csrf-token'];
    const csrfCookie = getResponse.headers['set-cookie'].find(cookie => cookie.startsWith('_csrf='));

    const response = await request(app)
      .post('/test-csrf')
      .set('Authorization', `Bearer ${testUserToken}`)
      .set('Cookie', csrfCookie)
      .set('X-CSRF-Token', csrfToken)
      .send({ data: 'test' })
      .expect(200);

    expect(response.body.message).toBe('POST request successful');
  });
});
