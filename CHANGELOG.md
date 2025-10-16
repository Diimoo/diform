# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Swagger/OpenAPI 3.0 API documentation
- Redis caching with graceful degradation
- PM2 process management with clustering
- Microsoft Graph automatic token refresh
- Ollama AI service retry logic with exponential backoff
- WebSocket infrastructure (socket.io)
- Electron app icon generation guide

### Changed
- Enhanced health check endpoint with database status
- Updated docker-compose.yml with Redis service
- Improved .env.example with comprehensive configuration

## [0.3.0] - 2025-10-16 - Sprint 2: Important Issues

### Added
- Swagger/OpenAPI 3.0 specification (`server/config/swagger.js`)
- Redis caching service with middleware (`server/config/redis.js`)
- PM2 ecosystem configuration for production deployment
- Automatic Microsoft Graph token refresh logic
- Ollama fault tolerance with retry and timeout
- Enhanced health checks with database connectivity status
- Electron assets directory with icon generation documentation
- WebSocket support infrastructure (socket.io dependency)

### Changed
- Enhanced `server/services/aiService.js` with retry logic
- Updated `electron/main.js` with token refresh scheduling
- Added Redis to `docker-compose.yml`
- Updated `.env.example` with Redis and PM2 variables

### Fixed
- Token expiration handling in Electron app
- Ollama service resilience with automatic fallback
- Production readiness score improved to 72/100

## [0.2.0] - 2025-10-16 - Sprint 1: Critical Issues

### Added
- JWT authentication system with bcryptjs
- MongoDB persistence with Mongoose (User and Task models)
- Security middleware: Helmet, rate limiting, CORS
- Input validation with express-validator
- Structured logging with Winston
- Request logging with Morgan
- Sentry error monitoring integration
- Environment variable validation with Joi
- Graceful shutdown handlers (SIGTERM/SIGINT)
- Test infrastructure with Jest and Supertest
- GitHub Actions CI/CD pipeline
- Docker support (Dockerfile, docker-compose.yml)
- Authentication routes (`/api/auth/*`)
- Protected API endpoints with JWT middleware
- Request ID tracking for distributed tracing
- MongoDB health checks

### Changed
- Migrated from in-memory storage to MongoDB
- Enhanced `/api/health` endpoint
- Client proxy configuration fixed (port 5000)
- Server port standardized to 5000

### Fixed
- Port mismatch between client and server
- Missing authentication on sensitive endpoints
- Lack of data persistence
- Security vulnerabilities (no Helmet, rate limiting, etc.)
- Missing error monitoring
- No graceful shutdown handling

### Security
- Added JWT token-based authentication
- Implemented password hashing with bcryptjs
- Added rate limiting (100 requests per 15 minutes)
- Applied Helmet security headers
- Added request body size limits (10mb JSON, 50mb total)
- Implemented input validation and sanitization
- Added CORS configuration

## [0.1.0] - 2025-10-15 - Initial Release

### Added
- Basic Express.js server
- React web client
- Electron desktop app with Microsoft Graph integration
- React Native mobile app skeleton
- Ollama integration for local LLM processing
- Basic task processing workflow
- Client-side UI components
- Microsoft Graph authentication (Electron)
- Basic health check endpoint
- README and documentation files

### Known Issues
- No authentication system
- No data persistence (in-memory only)
- Limited security measures
- No automated testing
- No CI/CD pipeline
- Mobile app requires proper initialization
- Missing production deployment configuration

---

## Version History Summary

- **v0.3.0** - Sprint 2: API docs, caching, PM2, fault tolerance
- **v0.2.0** - Sprint 1: Auth, database, security, CI/CD, Docker
- **v0.1.0** - Initial release with basic functionality

---

## Upgrade Notes

### Upgrading to 0.3.0

1. Install new dependencies:
   ```bash
   npm install
   ```

2. Start Redis (optional, graceful degradation if unavailable):
   ```bash
   docker compose up redis -d
   ```

3. Update your `.env` file with new variables:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   PM2_INSTANCES=2
   ```

4. For production deployment with PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

### Upgrading to 0.2.0

1. Install new dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Generate JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. Start MongoDB:
   ```bash
   docker compose up mongodb -d
   ```

5. Update client proxy if needed (now uses port 5000)

---

## Contributing

Please update this CHANGELOG when:
- Adding new features
- Fixing bugs
- Making breaking changes
- Updating dependencies with significant changes

Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

[Unreleased]: https://github.com/Diimoo/diform/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/Diimoo/diform/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Diimoo/diform/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Diimoo/diform/releases/tag/v0.1.0
