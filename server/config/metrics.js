const client = require('prom-client');
const logger = require('./logger');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'diform_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5]
});

// Custom metrics

// HTTP Request Duration
const httpRequestDuration = new client.Histogram({
  name: 'diform_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});
register.registerMetric(httpRequestDuration);

// HTTP Request Counter
const httpRequestTotal = new client.Counter({
  name: 'diform_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestTotal);

// Active Connections
const activeConnections = new client.Gauge({
  name: 'diform_active_connections',
  help: 'Number of active connections'
});
register.registerMetric(activeConnections);

// Task Processing
const taskProcessingDuration = new client.Histogram({
  name: 'diform_task_processing_duration_seconds',
  help: 'Duration of task processing in seconds',
  labelNames: ['task_type', 'status'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 120]
});
register.registerMetric(taskProcessingDuration);

const taskTotal = new client.Counter({
  name: 'diform_tasks_total',
  help: 'Total number of tasks processed',
  labelNames: ['task_type', 'status']
});
register.registerMetric(taskTotal);

// AI Service Metrics
const aiServiceRequests = new client.Counter({
  name: 'diform_ai_service_requests_total',
  help: 'Total number of AI service requests',
  labelNames: ['service', 'status']
});
register.registerMetric(aiServiceRequests);

const aiServiceDuration = new client.Histogram({
  name: 'diform_ai_service_duration_seconds',
  help: 'Duration of AI service requests in seconds',
  labelNames: ['service'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60]
});
register.registerMetric(aiServiceDuration);

// Database Metrics
const dbOperationDuration = new client.Histogram({
  name: 'diform_db_operation_duration_seconds',
  help: 'Duration of database operations in seconds',
  labelNames: ['operation', 'collection'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2]
});
register.registerMetric(dbOperationDuration);

const dbConnectionsActive = new client.Gauge({
  name: 'diform_db_connections_active',
  help: 'Number of active database connections'
});
register.registerMetric(dbConnectionsActive);

// Cache Metrics
const cacheHitTotal = new client.Counter({
  name: 'diform_cache_hit_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name']
});
register.registerMetric(cacheHitTotal);

const cacheMissTotal = new client.Counter({
  name: 'diform_cache_miss_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_name']
});
register.registerMetric(cacheMissTotal);

// Authentication Metrics
const authAttempts = new client.Counter({
  name: 'diform_auth_attempts_total',
  help: 'Total number of authentication attempts',
  labelNames: ['method', 'result']
});
register.registerMetric(authAttempts);

// Webhook Metrics
const webhookDeliveries = new client.Counter({
  name: 'diform_webhook_deliveries_total',
  help: 'Total number of webhook deliveries',
  labelNames: ['event', 'status']
});
register.registerMetric(webhookDeliveries);

const webhookDuration = new client.Histogram({
  name: 'diform_webhook_delivery_duration_seconds',
  help: 'Duration of webhook deliveries in seconds',
  labelNames: ['event'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});
register.registerMetric(webhookDuration);

// Error Metrics
const errorTotal = new client.Counter({
  name: 'diform_errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity']
});
register.registerMetric(errorTotal);

/**
 * Express middleware to collect HTTP metrics
 */
function metricsMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Increment active connections
    activeConnections.inc();

    // Track response
    res.on('finish', () => {
      const duration = (Date.now() - startTime) / 1000;
      const route = req.route ? req.route.path : req.path;
      
      // Record metrics
      httpRequestDuration
        .labels(req.method, route, res.statusCode)
        .observe(duration);
      
      httpRequestTotal
        .labels(req.method, route, res.statusCode)
        .inc();
      
      // Decrement active connections
      activeConnections.dec();
    });

    next();
  };
}

/**
 * Get metrics in Prometheus format
 */
async function getMetrics() {
  return register.metrics();
}

/**
 * Get metrics as JSON
 */
async function getMetricsJSON() {
  const metrics = await register.getMetricsAsJSON();
  return metrics;
}

/**
 * Record task processing metrics
 */
function recordTaskProcessing(taskType, status, duration) {
  taskTotal.labels(taskType, status).inc();
  taskProcessingDuration.labels(taskType, status).observe(duration);
}

/**
 * Record AI service metrics
 */
function recordAIService(service, status, duration) {
  aiServiceRequests.labels(service, status).inc();
  if (duration !== undefined) {
    aiServiceDuration.labels(service).observe(duration);
  }
}

/**
 * Record database operation metrics
 */
function recordDBOperation(operation, collection, duration) {
  dbOperationDuration.labels(operation, collection).observe(duration);
}

/**
 * Record cache metrics
 */
function recordCacheHit(cacheName) {
  cacheHitTotal.labels(cacheName).inc();
}

function recordCacheMiss(cacheName) {
  cacheMissTotal.labels(cacheName).inc();
}

/**
 * Record authentication metrics
 */
function recordAuthAttempt(method, result) {
  authAttempts.labels(method, result).inc();
}

/**
 * Record webhook metrics
 */
function recordWebhookDelivery(event, status, duration) {
  webhookDeliveries.labels(event, status).inc();
  if (duration !== undefined) {
    webhookDuration.labels(event).observe(duration);
  }
}

/**
 * Record error metrics
 */
function recordError(type, severity = 'error') {
  errorTotal.labels(type, severity).inc();
}

/**
 * Update database connection count
 */
function updateDBConnections(count) {
  dbConnectionsActive.set(count);
}

// Log initialization
logger.info('Prometheus metrics initialized', {
  defaultMetrics: true,
  customMetrics: register.getSingleMetric('diform_http_requests_total') ? 'registered' : 'none'
});

module.exports = {
  register,
  metricsMiddleware,
  getMetrics,
  getMetricsJSON,
  recordTaskProcessing,
  recordAIService,
  recordDBOperation,
  recordCacheHit,
  recordCacheMiss,
  recordAuthAttempt,
  recordWebhookDelivery,
  recordError,
  updateDBConnections,
  // Export individual metrics for direct access if needed
  metrics: {
    httpRequestDuration,
    httpRequestTotal,
    activeConnections,
    taskProcessingDuration,
    taskTotal,
    aiServiceRequests,
    aiServiceDuration,
    dbOperationDuration,
    dbConnectionsActive,
    cacheHitTotal,
    cacheMissTotal,
    authAttempts,
    webhookDeliveries,
    webhookDuration,
    errorTotal
  }
};
