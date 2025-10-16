const Redis = require('ioredis');
const logger = require('./logger');

let redisClient = null;

const connectRedis = () => {
  if (redisClient) {
    return redisClient;
  }

  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  };

  redisClient = new Redis(redisConfig);

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    logger.error('Redis connection error:', err);
  });

  redisClient.on('close', () => {
    logger.warn('Redis connection closed');
  });

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient) {
    return connectRedis();
  }
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const client = getRedisClient();
      const cachedResponse = await client.get(key);
      
      if (cachedResponse) {
        logger.debug(`Cache hit: ${key}`);
        return res.json(JSON.parse(cachedResponse));
      }
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      res.json = (data) => {
        // Cache the response
        client.setex(key, duration, JSON.stringify(data)).catch(err => {
          logger.error('Redis cache set error:', err);
        });
        
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
  cacheMiddleware
};
