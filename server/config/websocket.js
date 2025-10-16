const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

let io = null;

/**
 * Initialize WebSocket server
 */
function initializeWebSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      
      logger.info('WebSocket client authenticated', {
        userId: socket.userId,
        socketId: socket.id
      });
      
      next();
    } catch (error) {
      logger.error('WebSocket authentication failed', { error: error.message });
      next(new Error('Invalid token'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    logger.info('Client connected', {
      socketId: socket.id,
      userId: socket.userId
    });

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle client events
    socket.on('subscribe:tasks', () => {
      socket.join(`tasks:${socket.userId}`);
      logger.debug('Client subscribed to tasks', { userId: socket.userId });
    });

    socket.on('unsubscribe:tasks', () => {
      socket.leave(`tasks:${socket.userId}`);
      logger.debug('Client unsubscribed from tasks', { userId: socket.userId });
    });

    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Disconnect event
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', {
        socketId: socket.id,
        userId: socket.userId,
        reason
      });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error', {
        socketId: socket.id,
        userId: socket.userId,
        error: error.message
      });
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to DIForM real-time service',
      socketId: socket.id,
      timestamp: Date.now()
    });
  });

  logger.info('WebSocket server initialized');
  
  return io;
}

/**
 * Send real-time update to specific user
 */
function sendToUser(userId, event, data) {
  if (!io) {
    logger.warn('WebSocket not initialized');
    return false;
  }

  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: Date.now()
  });

  logger.debug('Sent event to user', { userId, event });
  return true;
}

/**
 * Send task update to user
 */
function sendTaskUpdate(userId, taskId, status, data = {}) {
  return sendToUser(userId, 'task:update', {
    taskId,
    status,
    ...data
  });
}

/**
 * Send task completed notification
 */
function sendTaskCompleted(userId, taskId, result) {
  return sendToUser(userId, 'task:completed', {
    taskId,
    result
  });
}

/**
 * Send task failed notification
 */
function sendTaskFailed(userId, taskId, error) {
  return sendToUser(userId, 'task:failed', {
    taskId,
    error: error.message || error
  });
}

/**
 * Send task progress update
 */
function sendTaskProgress(userId, taskId, progress, message) {
  return sendToUser(userId, 'task:progress', {
    taskId,
    progress, // 0-100
    message
  });
}

/**
 * Broadcast to all connected clients
 */
function broadcast(event, data) {
  if (!io) {
    logger.warn('WebSocket not initialized');
    return false;
  }

  io.emit(event, {
    ...data,
    timestamp: Date.now()
  });

  logger.debug('Broadcast event', { event });
  return true;
}

/**
 * Send system notification
 */
function sendSystemNotification(userId, type, message, data = {}) {
  return sendToUser(userId, 'system:notification', {
    type, // info, warning, error, success
    message,
    ...data
  });
}

/**
 * Get connected clients count
 */
function getConnectedClientsCount() {
  if (!io) return 0;
  return io.engine.clientsCount;
}

/**
 * Get connected clients for a user
 */
function getUserSockets(userId) {
  if (!io) return [];
  const room = io.sockets.adapter.rooms.get(`user:${userId}`);
  return room ? Array.from(room) : [];
}

/**
 * Check if user is connected
 */
function isUserConnected(userId) {
  return getUserSockets(userId).length > 0;
}

/**
 * Disconnect user
 */
function disconnectUser(userId, reason = 'Server initiated disconnect') {
  if (!io) return false;
  
  const socketIds = getUserSockets(userId);
  socketIds.forEach(socketId => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
      logger.info('Disconnected user socket', { userId, socketId, reason });
    }
  });
  
  return true;
}

/**
 * Get IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('WebSocket not initialized. Call initializeWebSocket first.');
  }
  return io;
}

module.exports = {
  initializeWebSocket,
  getIO,
  sendToUser,
  sendTaskUpdate,
  sendTaskCompleted,
  sendTaskFailed,
  sendTaskProgress,
  broadcast,
  sendSystemNotification,
  getConnectedClientsCount,
  getUserSockets,
  isUserConnected,
  disconnectUser
};
