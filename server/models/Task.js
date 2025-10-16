const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  command: {
    type: String,
    required: true,
    trim: true
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
    index: true
  },
  steps: [{
    phase: String,
    title: String,
    description: String,
    actions: [String],
    status: String,
    timestamp: Date
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  error: {
    message: String,
    stack: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  completedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ createdAt: -1 });
taskSchema.index({ userId: 1, createdAt: -1 });

// Add a method to convert to JSON with formatted dates
taskSchema.methods.toJSON = function() {
  const task = this.toObject();
  task.createdAt = task.createdAt?.toISOString();
  task.completedAt = task.completedAt?.toISOString();
  return task;
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
