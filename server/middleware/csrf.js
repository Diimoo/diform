const csurf = require('csurf');
const logger = require('../config/logger');

const csrfProtection = csurf({
  cookie: {
    key: '_csrf',
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JS from reading the cookie
    sameSite: 'Lax', // Protect against CSRF attacks, allows cross-site requests
    maxAge: 3600 // 1 hour
  }
});

// Middleware to conditionally apply CSRF protection
// Excludes routes with 'Authorization: Bearer' token, assuming they are API routes
// protected by JWT and thus stateless and not vulnerable to traditional CSRF.
const conditionalCsrf = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    logger.debug('Skipping CSRF protection for Bearer token API request.');
    return next();
  }
  // If not a Bearer token request, apply CSRF protection
  csrfProtection(req, res, next);
};

// Middleware to add CSRF token to response headers or body for clients
// This is important for SPA/API clients to retrieve the token
const addCsrfToken = (req, res, next) => {
  if (req.csrfToken) { // csurf will attach csrfToken method if applied
    res.locals.csrfToken = req.csrfToken();
    logger.debug(`CSRF token generated: ${res.locals.csrfToken}`);
    // Optionally, send the token in a header for AJAX requests
    res.setHeader('X-CSRF-Token', res.locals.csrfToken);
  }
  next();
};

module.exports = {
  conditionalCsrf,
  addCsrfToken
};
