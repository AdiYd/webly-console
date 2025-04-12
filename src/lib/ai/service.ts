import { AIModelConfig, AIProvider, defaultConfig, getApiKey } from './config';

export type AIMessageRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: string;
}

export class AIService {
  private config: AIModelConfig;

  constructor(config?: Partial<AIModelConfig>) {
    this.config = { ...defaultConfig, ...config };
    
    // Set API key from environment if not provided
    if (!this.config.apiKey) {
      this.config.apiKey = getApiKey(this.config.provider);
    }
  }

  /**
   * Send a completion request to the AI model
   */
  async generateCompletion(
    prompt: string,
    options?: Partial<AIModelConfig>
  ): Promise<AIResponse> {
    const messages: AIMessage[] = [{ role: 'user', content: prompt }];
    return this.generateChatCompletion(messages, options);
  }

  /**
   * Send a chat completion request to the AI model
   */
  async generateChatCompletion(
    messages: AIMessage[],
    options?: Partial<AIModelConfig>
  ): Promise<AIResponse> {
    const config = { ...this.config, ...options };
    
    try {
      // This is a placeholder - in a real implementation, this would route to 
      // the specific provider's API based on the config.provider value
      console.log(`Using ${config.provider} provider with model ${config.model}`);
      
      // Simulate a response for now - in production, this would call the actual API
      return {
        text: `This is a simulated response from ${config.provider}'s ${config.model} model.`,
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        }
      };
    } catch (error) {
      console.error('Error generating completion:', error);
      return {
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Change the configuration of the AI service
   */
  updateConfig(config: Partial<AIModelConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.provider && !config.apiKey) {
      this.config.apiKey = getApiKey(config.provider);
    }
  }
}

// Create a default instance with the default configuration
export const aiService = new AIService();