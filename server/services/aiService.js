const { Ollama } = require('ollama');
const logger = require('../config/logger');

class AIService {
  constructor() {
    this.ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.ollama = new Ollama({ host: this.ollamaHost });
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
    this.maxRetries = 3;
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT) || 30000;
  }

  async processCommand(command, context = {}) {
    return await this.retryWithBackoff(
      () => this._processCommandInternal(command, context),
      this.maxRetries
    );
  }

  async _processCommandInternal(command, context = {}) {
    try {
      const prompt = this.buildPrompt(command, context);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Ollama request timeout')), this.timeout);
      });

      // Race between actual request and timeout
      const response = await Promise.race([
        this.ollama.chat({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
        timeoutPromise
      ]);
      
      return this.parseResponse(response.message.content);
    } catch (error) {
      logger.error('Ollama error:', error.message);
      throw error; // Let retry logic handle it
    }
  }

  async retryWithBackoff(fn, maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          logger.warn(`All ${maxRetries} Ollama attempts failed, using fallback`);
          // Return fallback on final failure
          return this.fallbackProcessing('');
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.warn(`Ollama attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  buildPrompt(command, context) {
    return `You are DIForM, an AI assistant that executes tasks. Analyze this command and create an execution plan.

Command: "${command}"

Respond with JSON:
{
  "understanding": "brief summary",
  "actions": ["action 1", "action 2", ...],
  "reasoning": "why these actions"
}`;
  }

  parseResponse(content) {
    try {
      return JSON.parse(content);
    } catch {
      return {
        understanding: content,
        actions: ['Execute command'],
        reasoning: 'Processing...'
      };
    }
  }

  fallbackProcessing(command) {
    const actions = [];
    if (command.includes('email')) actions.push('Process emails');
    if (command.includes('calendar')) actions.push('Manage calendar');
    if (command.includes('file')) actions.push('Handle files');
    
    return {
      understanding: command,
      actions: actions.length ? actions : ['Process request'],
      reasoning: 'Keyword-based processing'
    };
  }
}

module.exports = new AIService();
