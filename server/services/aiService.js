const { Ollama } = require('ollama');

class AIService {
  constructor() {
    this.ollama = new Ollama({ host: 'http://localhost:11434' });
    this.model = process.env.OLLAMA_MODEL || 'llama3.2';
  }

  async processCommand(command, context = {}) {
    try {
      const prompt = this.buildPrompt(command, context);
      const response = await this.ollama.chat({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });
      
      return this.parseResponse(response.message.content);
    } catch (error) {
      console.error('Ollama error:', error);
      return this.fallbackProcessing(command);
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
