import type { Message } from "../../components/types";
import { OpenAIChatProvider } from "./openaiChatProvider";
import { GeminiChatProvider } from "./geminiChatProvider";
import { ClaudeChatProvider } from "./claudeChatProvider";

export type ChatProvider = "openai" | "gemini" | "claude";

export interface ChatServiceConfig {
  provider: ChatProvider;
  apiKey: string;
}

export class ChatService {
  private provider: ChatProvider;
  private providerInstance:
    | OpenAIChatProvider
    | GeminiChatProvider
    | ClaudeChatProvider;

  constructor(config: ChatServiceConfig) {
    this.provider = config.provider;
    this.providerInstance = this.createProviderInstance(config.apiKey);
  }

  /**
   * Creates the appropriate provider instance based on the selected provider
   */
  private createProviderInstance(
    apiKey: string,
  ): OpenAIChatProvider | GeminiChatProvider | ClaudeChatProvider {
    switch (this.provider) {
      case "openai":
        return new OpenAIChatProvider(apiKey);
      case "gemini":
        return new GeminiChatProvider(apiKey);
      case "claude":
        return new ClaudeChatProvider(apiKey);
      default:
        throw new Error(`Unsupported chat provider: ${this.provider}`);
    }
  }

  /**
   * Sends a message to the configured AI provider
   * @param userInput The user's message
   * @param systemPrompt Optional system prompt for agent behavior
   * @param previousMessages Previous conversation messages for context
   * @returns Promise resolving to the AI response
   */
  async sendMessage(
    userInput: string,
    systemPrompt?: string,
    previousMessages: Message[] = [],
  ): Promise<string> {
    if (!userInput.trim()) {
      throw new Error("User input cannot be empty");
    }

    try {
      return await this.providerInstance.sendMessage(
        userInput,
        systemPrompt,
        previousMessages,
      );
    } catch (error) {
      const providerName = this.getProviderDisplayName();
      if (error instanceof Error) {
        throw new Error(`${providerName}: ${error.message}`);
      }
      throw new Error(`${providerName}: Unknown error occurred`);
    }
  }

  /**
   * Tests the connection to the AI provider
   */
  async testConnection(): Promise<boolean> {
    try {
      return await this.providerInstance.testConnection();
    } catch {
      return false;
    }
  }

  /**
   * Gets the current provider type
   */
  getProvider(): ChatProvider {
    return this.provider;
  }

  /**
   * Gets the display name of the current provider
   */
  getProviderDisplayName(): string {
    return this.providerInstance.getProviderDisplayName();
  }

  /**
   * Gets the specific model name being used
   */
  getModelName(): string {
    return this.providerInstance.getModelName();
  }

  /**
   * Creates a ChatService instance using the selected provider from localStorage
   */
  static async createFromSelectedProvider(): Promise<ChatService | null> {
    const selectedProvider = ChatService.getSelectedProvider();

    if (!selectedProvider) {
      return null;
    }

    const apiKey = localStorage.getItem(`${selectedProvider}_api_key`);

    if (!apiKey || apiKey.trim() === "") {
      return null;
    }

    return new ChatService({
      provider: selectedProvider,
      apiKey: apiKey,
    });
  }

  /**
   * Gets the selected provider from localStorage, with fallback logic
   */
  static getSelectedProvider(): ChatProvider | null {
    const selectedProvider = localStorage.getItem(
      "selected_provider",
    ) as ChatProvider;
    const availableProviders = ChatService.getAvailableProviders();

    // Check if the selected provider is available
    if (selectedProvider && availableProviders.includes(selectedProvider)) {
      return selectedProvider;
    }

    // Return the first available provider
    return availableProviders.length > 0 ? availableProviders[0] : null;
  }

  /**
   * Gets a list of available providers (those with valid API keys)
   */
  static getAvailableProviders(): ChatProvider[] {
    const providers: ChatProvider[] = [];

    const geminiKey = localStorage.getItem("gemini_api_key");
    const openaiKey = localStorage.getItem("openai_api_key");
    const claudeKey = localStorage.getItem("claude_api_key");

    if (openaiKey && openaiKey.trim() !== "") {
      providers.push("openai");
    }
    if (geminiKey && geminiKey.trim() !== "") {
      providers.push("gemini");
    }
    if (claudeKey && claudeKey.trim() !== "") {
      providers.push("claude");
    }

    return providers;
  }

  /**
   * Gets detailed information about all available providers
   */
  static getProviderInfo(): Array<{
    provider: ChatProvider;
    displayName: string;
    modelName: string;
    available: boolean;
  }> {
    const availableProviders = ChatService.getAvailableProviders();

    return [
      {
        provider: "openai",
        displayName: "OpenAI GPT-4 Turbo",
        modelName: "gpt-4-turbo-preview",
        available: availableProviders.includes("openai"),
      },
      {
        provider: "gemini",
        displayName: "Google Gemini 2.0 Flash",
        modelName: "gemini-2.0-flash",
        available: availableProviders.includes("gemini"),
      },
      {
        provider: "claude",
        displayName: "Anthropic Claude 3.5 Sonnet",
        modelName: "claude-3-5-sonnet-20241022",
        available: availableProviders.includes("claude"),
      },
    ];
  }

  /**
   * Validates that a provider has the required API key
   */
  static validateProvider(provider: ChatProvider): boolean {
    const apiKey = localStorage.getItem(`${provider}_api_key`);
    return !!(apiKey && apiKey.trim() !== "");
  }

  /**
   * Gets a user-friendly error message for missing providers
   */
  static getMissingProviderMessage(): string {
    const availableProviders = ChatService.getAvailableProviders();

    if (availableProviders.length === 0) {
      return "No AI providers are configured. Please add at least one API key in Settings.";
    }

    const selectedProvider = localStorage.getItem("selected_provider");
    if (
      selectedProvider &&
      !availableProviders.includes(selectedProvider as ChatProvider)
    ) {
      return `${selectedProvider.toUpperCase()} API key is missing. Please add it in Settings or select a different provider.`;
    }

    return "Unable to initialize chat service. Please check your API keys in Settings.";
  }
}
