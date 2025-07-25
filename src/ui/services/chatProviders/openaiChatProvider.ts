import type { Message } from "../../components/types";

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class OpenAIChatProvider {
  private static readonly DEFAULT_CONFIG: Omit<OpenAIConfig, "apiKey"> = {
    model: "gpt-4-turbo-preview", // Latest GPT-4 Turbo model
    maxTokens: 1000,
    temperature: 0.7,
  };

  private static readonly FALLBACK_MODEL = "gpt-4"; // Fallback to standard GPT-4
  private static readonly BASE_URL = "https://api.openai.com/v1";

  private config: OpenAIConfig;

  constructor(
    apiKey: string,
    customConfig?: Partial<Omit<OpenAIConfig, "apiKey">>,
  ) {
    this.config = {
      apiKey,
      ...OpenAIChatProvider.DEFAULT_CONFIG,
      ...customConfig,
    };
  }

  /**
   * Sends a chat message to OpenAI with conversation context
   * @param userInput Current user message
   * @param systemPrompt Optional system prompt for agent behavior
   * @param previousMessages Previous conversation messages for context
   * @returns AI response string
   */
  async sendMessage(
    userInput: string,
    systemPrompt?: string,
    previousMessages: Message[] = [],
  ): Promise<string> {
    const messages = this.buildMessageArray(
      userInput,
      systemPrompt,
      previousMessages,
    );

    try {
      const response = await this.makeApiCall(messages);
      return this.extractResponseContent(response);
    } catch (error) {
      // Try fallback model if primary model fails
      if (this.config.model !== OpenAIChatProvider.FALLBACK_MODEL) {
        console.warn(
          `OpenAI ${this.config.model} failed, trying fallback model`,
        );
        return this.sendMessageWithFallback(
          userInput,
          systemPrompt,
          previousMessages,
        );
      }
      throw error;
    }
  }

  /**
   * Builds the messages array for OpenAI API format
   */
  private buildMessageArray(
    userInput: string,
    systemPrompt?: string,
    previousMessages: Message[] = [],
  ): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

    // Add system prompt if provided (agent mode)
    if (systemPrompt?.trim()) {
      messages.push({
        role: "system",
        content: systemPrompt.trim(),
      });
    }

    // Add conversation history (last 10 messages for context)
    const recentMessages = previousMessages.slice(-10);
    recentMessages.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({
      role: "user",
      content: userInput.trim(),
    });

    return messages;
  }

  /**
   * Makes the actual API call to OpenAI
   */
  private async makeApiCall(
    messages: Array<{ role: string; content: string }>,
  ): Promise<any> {
    const response = await fetch(
      `${OpenAIChatProvider.BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          stream: false, // We don't support streaming yet
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      const errorCode = errorData.error?.code || response.status;

      throw new Error(
        `OpenAI API error (${this.config.model}): ${errorCode} - ${errorMessage}`,
      );
    }

    return response.json();
  }

  /**
   * Extracts content from OpenAI API response
   */
  private extractResponseContent(data: any): string {
    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string") {
      throw new Error(
        `Invalid response from OpenAI ${this.config.model}: No content generated`,
      );
    }

    return content.trim();
  }

  /**
   * Attempts to send message with fallback model
   */
  private async sendMessageWithFallback(
    userInput: string,
    systemPrompt?: string,
    previousMessages: Message[] = [],
  ): Promise<string> {
    const fallbackProvider = new OpenAIChatProvider(this.config.apiKey, {
      model: OpenAIChatProvider.FALLBACK_MODEL,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    return fallbackProvider.sendMessage(
      userInput,
      systemPrompt,
      previousMessages,
    );
  }

  /**
   * Gets the current model being used
   */
  getModelName(): string {
    return this.config.model;
  }

  /**
   * Gets the provider display name
   */
  getProviderDisplayName(): string {
    return `OpenAI ${this.config.model}`;
  }

  /**
   * Tests the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${OpenAIChatProvider.BASE_URL}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
