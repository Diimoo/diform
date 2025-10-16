const Joi = require('joi');
const logger = require('./logger');

// Define environment variables schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  CLIENT_URL: Joi.string().uri().required(),
  MONGODB_URI: Joi.string().required(),
  DATABASE_NAME: Joi.string().default('diform'),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRY: Joi.string().default('7d'),
  OLLAMA_MODEL: Joi.string().default('llama3.2'),
  OLLAMA_HOST: Joi.string().uri().default('http://localhost:11434'),
  OLLAMA_TIMEOUT: Joi.number().default(30000),
  AI_FALLBACK: Joi.boolean().default(true),
  SENTRY_DSN: Joi.string().uri().allow('').optional(),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info')
}).unknown(); // Allow other env vars

function validateEnv() {
  const { error, value } = envSchema.validate(process.env, {
    abortEarly: false
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message).join('\n');
    logger.error('❌ Environment validation failed:');
    logger.error(errorMessages);
    logger.error('\nPlease check your .env file and ensure all required variables are set.');
    logger.error('Refer to .env.example for the complete list of variables.\n');
    
    // Exit the process in production or if critical vars are missing
    if (process.env.NODE_ENV === 'production' || 
        !process.env.MONGODB_URI || 
        !process.env.JWT_SECRET) {
      process.exit(1);
    }
    
    logger.warn('⚠️  Continuing with warnings in development mode...\n');
  } else {
    logger.info('✅ Environment validation passed');
  }

  return value;
}

module.exports = { validateEnv };
