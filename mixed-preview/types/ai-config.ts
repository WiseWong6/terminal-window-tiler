export type AIProvider = 'openai' | 'anthropic';

export interface AIConfig {
  provider: AIProvider;
  endpoint: string;
  apiKey: string;
  model: string;
}
