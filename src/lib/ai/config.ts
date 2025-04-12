// AI Provider Configuration
export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'groq';

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export const defaultConfig: AIModelConfig = {
  provider: 'openai',
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
};

// Available AI models by provider
export const availableModels: Record<AIProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  groq: ['llama3-70b', 'llama3-8b', 'mixtral-8x7b'],
};

// Get API keys from environment variables
export const getApiKey = (provider: AIProvider): string => {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY || '';
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY || '';
    case 'gemini':
      return process.env.GEMINI_API_KEY || '';
    case 'groq':
      return process.env.GROQ_API_KEY || '';
  }
};