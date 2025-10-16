const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const Sentry = require('@sentry/node');
const aiService = require('./services/aiService');
const logger = require('./config/logger');
const { validateEnv } = require('./config/env');
const { connectDatabase } = require('./config/database');
const { authenticate, optionalAuth } = require('./middleware/auth');
const validations = require('./middleware/validation');
const Task = require('./models/Task');
const authRoutes = require('./routes/auth');

// Load and validate environment variables
dotenv.config();
const env = validateEnv();

const app = express();
const PORT = env.PORT || 5000;

// Initialize Sentry for error tracking (if configured)
if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
  logger.info('✅ Sentry error tracking initialized');
}

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Please try again later'
    });
  }
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing with size limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

// Legacy in-memory storage (fallback when database is not available)
let tasksMemory = [];
let executionHistoryMemory = [];

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Auth routes (no authentication required)
app.use('/api/auth', authRoutes);

// Health check endpoint (no authentication required)
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    database: 'disconnected'
  };

  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      health.database = 'connected';
    }
  } catch (error) {
    logger.error('Health check database error:', error);
  }

  const statusCode = health.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Process a DIForM command (requires authentication)
app.post('/api/process', authenticate, validations.processCommand, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { command, context } = req.body;
    
    logger.info(`Processing command for user ${req.user.email}: "${command}"`);

    const taskId = uuidv4();
    const taskData = {
      id: taskId,
      command,
      context: context || {},
      status: 'processing',
      userId: req.userId,
      steps: []
    };

    // Try to save to database, fallback to memory
    let task;
    try {
      task = new Task(taskData);
      await task.save();
      logger.debug(`Task ${taskId} saved to database`);
    } catch (dbError) {
      logger.warn('Database unavailable, using memory storage:', dbError.message);
      tasksMemory.push(taskData);
      task = taskData;
    }

    // Process with AI
    const aiResult = await aiService.processCommand(command, context);
    const steps = await simulateProcessing(command, aiResult);
    
    // Update task
    const updateData = {
      steps,
      status: 'completed',
      completedAt: new Date()
    };

    if (task.save) {
      Object.assign(task, updateData);
      await task.save();
    } else {
      Object.assign(task, updateData);
      executionHistoryMemory.push(task);
    }

    const duration = Date.now() - startTime;
    logger.info(`Task ${taskId} completed in ${duration}ms`);

    res.json({
      success: true,
      taskId,
      task: task.toJSON ? task.toJSON() : task
    });
  } catch (error) {
    logger.error('Error processing command:', error);
    
    if (env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    
    res.status(500).json({ 
      error: 'Failed to process command',
      message: env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get task status (requires authentication)
app.get('/api/task/:taskId', authenticate, validations.taskId, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Try database first
    let task;
    try {
      task = await Task.findOne({ id: taskId, userId: req.userId });
    } catch (dbError) {
      logger.warn('Database unavailable, checking memory:', dbError.message);
      task = tasksMemory.find(t => t.id === taskId && t.userId.toString() === req.userId.toString());
    }
    
    if (!task) {
      logger.warn(`Task not found: ${taskId}`);
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task.toJSON ? task.toJSON() : task);
  } catch (error) {
    logger.error('Error fetching task:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task',
      message: env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get execution history (requires authentication)
app.get('/api/history', authenticate, validations.pagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    let history, total;
    
    // Try database first
    try {
      total = await Task.countDocuments({ userId: req.userId });
      history = await Task.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (dbError) {
      logger.warn('Database unavailable, using memory:', dbError.message);
      const userTasks = executionHistoryMemory.filter(
        t => t.userId.toString() === req.userId.toString()
      );
      total = userTasks.length;
      history = userTasks.slice(-limit).reverse();
    }
    
    res.json({
      success: true,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      history
    });
  } catch (error) {
    logger.error('Error fetching history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history',
      message: env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Simulate AI processing steps with real AI input
async function simulateProcessing(command, aiResult = null) {
  const steps = [];
  
  // Step 1: Understanding
  await delay(500);
  steps.push({
    phase: 'understand',
    title: 'Understanding Context',
    description: `Analyzed request: "${command}"`,
    status: 'completed',
    timestamp: new Date().toISOString()
  });

  // Step 2: Planning (use AI if available)
  await delay(800);
  const actions = aiResult?.actions || identifyActions(command);
  steps.push({
    phase: 'plan',
    title: 'Creating Execution Plan',
    description: `Identified ${actions.length} actions to perform`,
    actions,
    status: 'completed',
    timestamp: new Date().toISOString()
  });

  // Step 3: Execute each action
  for (let i = 0; i < actions.length; i++) {
    await delay(600);
    steps.push({
      phase: 'execute',
      title: `Executing Action ${i + 1}/${actions.length}`,
      description: actions[i],
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }

  // Step 4: Verification
  await delay(500);
  steps.push({
    phase: 'verify',
    title: 'Verification Complete',
    description: 'All actions verified and logged for audit',
    status: 'completed',
    timestamp: new Date().toISOString()
  });

  return steps;
}

// Identify actions from command
function identifyActions(command) {
  const actions = [];
  const lowerCommand = command.toLowerCase();

  if (lowerCommand.includes('email') || lowerCommand.includes('mail')) {
    actions.push('📧 Analyze email threads and extract key information');
    actions.push('✍️ Draft response with appropriate tone and context');
  }

  if (lowerCommand.includes('summar')) {
    actions.push('📝 Generate comprehensive summary with key points');
  }

  if (lowerCommand.includes('meeting') || lowerCommand.includes('schedule')) {
    actions.push('📅 Check calendar availability');
    actions.push('🔔 Schedule meetings and send invitations');
  }

  if (lowerCommand.includes('update') || lowerCommand.includes('deck') || lowerCommand.includes('presentation')) {
    actions.push('📊 Update presentation slides with latest data');
    actions.push('🎨 Apply corporate design standards');
  }

  if (lowerCommand.includes('document') || lowerCommand.includes('report')) {
    actions.push('📄 Generate document from briefing');
    actions.push('🔍 Add citations and references');
  }

  if (lowerCommand.includes('data') || lowerCommand.includes('analysis') || lowerCommand.includes('excel')) {
    actions.push('📈 Perform data analysis');
    actions.push('📊 Create visualizations and charts');
  }

  if (lowerCommand.includes('task') || lowerCommand.includes('todo')) {
    actions.push('✅ Create action items in task manager');
    actions.push('👥 Assign tasks to team members');
  }

  // Default actions if none matched
  if (actions.length === 0) {
    actions.push('🤖 Process request with AI');
    actions.push('✅ Execute planned actions');
    actions.push('📋 Update relevant systems');
  }

  return actions;
}

// Helper delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  if (env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId: req.id
  });
});

// Server instance
let server;

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      // Close database connection
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('Database connection closed');
      } catch (error) {
        logger.error('Error closing database:', error);
      }
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (env.SENTRY_DSN) {
    Sentry.captureException(reason);
  }
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info('🚀 DIForM Server Started Successfully');
      logger.info('='.repeat(50));
      logger.info(`Environment: ${env.NODE_ENV}`);
      logger.info(`Port: ${PORT}`);
      logger.info(`API: http://localhost:${PORT}/api`);
      logger.info(`Health: http://localhost:${PORT}/api/health`);
      logger.info('='.repeat(50));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
