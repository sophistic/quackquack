import { OpenAIProvider } from './openaiProvider';
import { GeminiProvider } from './geminiProvider';
import { ClaudeProvider } from './claudeProvider';

export type AIProvider = 'openai' | 'gemini' | 'claude';

interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
}

export class AIService {
  private provider: AIProvider;
  private apiKey: string;
  private providerInstance: OpenAIProvider | GeminiProvider | ClaudeProvider;

  constructor(config: AIServiceConfig) {
    this.provider = config.provider;
    this.apiKey = config.apiKey;
    this.providerInstance = this.createProviderInstance();
  }

  private createProviderInstance(): OpenAIProvider | GeminiProvider | ClaudeProvider {
    switch (this.provider) {
      case 'openai':
        return new OpenAIProvider(this.apiKey);
      case 'gemini':
        return new GeminiProvider(this.apiKey);
      case 'claude':
        return new ClaudeProvider(this.apiKey);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async generateSystemPrompt(agentName: string, agentContext: string): Promise<string> {
    try {
      return await this.providerInstance.generateSystemPrompt(agentName, agentContext);
    } catch (error) {
      throw new Error(`Failed to generate system prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      return await this.providerInstance.testConnection();
    } catch {
      return false;
    }
  }

  static getAvailableProviders(): { provider: AIProvider; apiKey: string }[] {
    const providers: { provider: AIProvider; apiKey: string }[] = [];

    const geminiKey = localStorage.getItem('gemini_api_key');
    const openaiKey = localStorage.getItem('openai_api_key');
    const claudeKey = localStorage.getItem('claude_api_key');

    if (openaiKey && openaiKey.trim() !== '') {
      providers.push({ provider: 'openai', apiKey: openaiKey });
    }
    if (geminiKey && geminiKey.trim() !== '') {
      providers.push({ provider: 'gemini', apiKey: geminiKey });
    }
    if (claudeKey && claudeKey.trim() !== '') {
      providers.push({ provider: 'claude', apiKey: claudeKey });
    }

    return providers;
  }

  static getSelectedProvider(): AIProvider | null {
    const selectedProvider = localStorage.getItem('selected_provider') as AIProvider;
    const availableProviders = AIService.getAvailableProviders();

    // Check if the selected provider is available
    if (selectedProvider && availableProviders.some(p => p.provider === selectedProvider)) {
      return selectedProvider;
    }

    // Return the first available provider
    return availableProviders.length > 0 ? availableProviders[0].provider : null;
  }

  static async createInstance(): Promise<AIService | null> {
    const selectedProvider = AIService.getSelectedProvider();

    if (!selectedProvider) {
      return null;
    }

    const apiKey = localStorage.getItem(`${selectedProvider}_api_key`);

    if (!apiKey || apiKey.trim() === '') {
      return null;
    }

    return new AIService({
      provider: selectedProvider,
      apiKey: apiKey
    });
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  getProviderDisplayName(): string {
    switch (this.provider) {
      case 'openai':
        return 'OpenAI';
      case 'gemini':
        return 'Gemini';
      case 'claude':
        return 'Claude';
      default:
        return 'Unknown';
    }
  }
}
