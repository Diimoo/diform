# Multi-stage build for production

# Stage 1: Build client
FROM node:18-alpine AS client-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --only=production

# Copy client source
COPY client/ ./

# Build client
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine AS server-builder

WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install server dependencies
RUN npm ci --only=production

# Stage 3: Production image
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies from builder
COPY --from=server-builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy server source
COPY --chown=nodejs:nodejs server/ ./server/
COPY --chown=nodejs:nodejs package*.json ./

# Copy built client from client-builder
COPY --from=client-builder --chown=nodejs:nodejs /app/client/build ./client/build

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "server/index.js"]
