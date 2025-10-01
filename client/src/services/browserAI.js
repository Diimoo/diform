import { pipeline } from '@xenova/transformers';

class BrowserAI {
  constructor() {
    this.classifier = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      this.classifier = await pipeline('text-classification', 
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
      this.initialized = true;
      console.log('Browser AI initialized');
    } catch (error) {
      console.error('Failed to initialize browser AI:', error);
    }
  }

  async analyzeCommand(command) {
    await this.initialize();
    
    if (!this.classifier) {
      return this.fallbackAnalysis(command);
    }

    try {
      const result = await this.classifier(command);
      return {
        understanding: `Analyzed with confidence: ${(result[0].score * 100).toFixed(1)}%`,
        actions: this.extractActions(command),
        sentiment: result[0].label,
        confidence: result[0].score
      };
    } catch (error) {
      return this.fallbackAnalysis(command);
    }
  }

  extractActions(command) {
    const actions = [];
    const lower = command.toLowerCase();
    
    if (lower.includes('email') || lower.includes('mail')) {
      actions.push('📧 Analyze and process emails');
    }
    if (lower.includes('summar')) {
      actions.push('📝 Generate summary');
    }
    if (lower.includes('meeting') || lower.includes('schedule')) {
      actions.push('📅 Schedule meetings');
    }
    if (lower.includes('document') || lower.includes('report')) {
      actions.push('📄 Create documents');
    }
    if (lower.includes('data') || lower.includes('analysis')) {
      actions.push('📊 Analyze data');
    }
    
    return actions.length ? actions : ['✅ Process command'];
  }

  fallbackAnalysis(command) {
    return {
      understanding: 'Analyzing command...',
      actions: this.extractActions(command),
      sentiment: 'NEUTRAL',
      confidence: 0.5
    };
  }
}

export default new BrowserAI();
