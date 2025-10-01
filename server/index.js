const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const aiService = require('./services/aiService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for demo purposes
let tasks = [];
let executionHistory = [];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Process a DIForM command
app.post('/api/process', async (req, res) => {
  try {
    const { command, context } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const taskId = uuidv4();
    const task = {
      id: taskId,
      command,
      context: context || {},
      status: 'processing',
      createdAt: new Date().toISOString(),
      steps: []
    };

    tasks.push(task);

    // Process with real AI
    const aiResult = await aiService.processCommand(command, context);
    const steps = await simulateProcessing(command, aiResult);
    task.steps = steps;
    task.status = 'completed';
    task.completedAt = new Date().toISOString();

    executionHistory.push(task);

    res.json({
      success: true,
      taskId,
      task
    });
  } catch (error) {
    console.error('Error processing command:', error);
    res.status(500).json({ error: 'Failed to process command' });
  }
});

// Get task status
app.get('/api/task/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json(task);
});

// Get execution history
app.get('/api/history', (req, res) => {
  res.json({
    total: executionHistory.length,
    history: executionHistory.slice(-10).reverse() // Last 10 tasks
  });
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DIForM Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
