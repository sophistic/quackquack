import type { Message } from "../../components/types";

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class ClaudeChatProvider {
  private static readonly DEFAULT_CONFIG: Omit<ClaudeConfig, 'apiKey'> = {
    model: "claude-3-5-sonnet-20241022", // Latest Claude 3.5 Sonnet model
    maxTokens: 1000,
    temperature: 0.7,
  };

  private static readonly FALLBACK_MODEL = "claude-3-sonnet-20240229"; // Fallback to Claude 3 Sonnet
  private static readonly BASE_URL = "https://api.anthropic.com/v1";
  private static readonly ANTHROPIC_VERSION = "2023-06-01";

  private config: ClaudeConfig;

  constructor(apiKey: string, customConfig?: Partial<Omit<ClaudeConfig, 'apiKey'>>) {
    this.config = {
      apiKey,
      ...ClaudeChatProvider.DEFAULT_CONFIG,
      ...customConfig,
    };
  }

  /**
   * Sends a chat message to Claude with conversation context
   * @param userInput Current user message
   * @param systemPrompt Optional system prompt for agent behavior
   * @param previousMessages Previous conversation messages for context
   * @returns AI response string
   */
  async sendMessage(
    userInput: string,
    systemPrompt?: string,
    previousMessages: Message[] = []
  ): Promise<string> {
    const messages = this.buildMessageArray(userInput, previousMessages);
    const requestBody = this.buildRequestBody(messages, systemPrompt);

    try {
      const response = await this.makeApiCall(requestBody);
      return this.extractResponseContent(response);
    } catch (error) {
      // Try fallback model if primary model fails
      if (this.config.model !== ClaudeChatProvider.FALLBACK_MODEL) {
        console.warn(`Claude ${this.config.model} failed, trying fallback model`);
        return this.sendMessageWithFallback(userInput, systemPrompt, previousMessages);
      }
      throw error;
    }
  }

  /**
   * Builds the messages array for Claude API format
   * Claude requires alternating user/assistant messages
   */
  private buildMessageArray(
    userInput: string,
    previousMessages: Message[] = []
  ): Array<{ role: string; content: string }> {
    const messages: Array<{ role: string; content: string }> = [];

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

    // Ensure messages alternate properly (Claude requirement)
    return this.ensureAlternatingMessages(messages);
  }

  /**
   * Ensures messages alternate between user and assistant
   * Claude requires this pattern for proper conversation flow
   */
  private ensureAlternatingMessages(
    messages: Array<{ role: string; content: string }>
  ): Array<{ role: string; content: string }> {
    const alternatingMessages: Array<{ role: string; content: string }> = [];
    let lastRole: string | null = null;

    for (const message of messages) {
      if (message.role === lastRole) {
        // If same role as previous, combine the messages
        if (alternatingMessages.length > 0) {
          alternatingMessages[alternatingMessages.length - 1].content +=
            `\n\n${message.content}`;
        } else {
          alternatingMessages.push(message);
        }
      } else {
        alternatingMessages.push(message);
        lastRole = message.role;
      }
    }

    // Ensure we start with a user message
    if (alternatingMessages.length > 0 && alternatingMessages[0].role !== "user") {
      alternatingMessages.shift();
    }

    return alternatingMessages;
  }

  /**
   * Builds the request body for Claude API
   */
  private buildRequestBody(
    messages: Array<{ role: string; content: string }>,
    systemPrompt?: string
  ): any {
    const requestBody: any = {
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      messages: messages,
    };

    // Add system prompt if provided (agent mode)
    if (systemPrompt?.trim()) {
      requestBody.system = systemPrompt.trim();
    }

    return requestBody;
  }

  /**
   * Makes the actual API call to Claude
   */
  private async makeApiCall(requestBody: any): Promise<any> {
    const response = await fetch(`${ClaudeChatProvider.BASE_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
        "anthropic-version": ClaudeChatProvider.ANTHROPIC_VERSION,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      const errorType = errorData.error?.type || response.status;

      // Provide more specific error messages for common Claude errors
      let friendlyMessage = errorMessage;
      if (errorType === "authentication_error") {
        friendlyMessage = "Invalid Claude API key. Please check your API key in Settings.";
      } else if (errorType === "permission_error") {
        friendlyMessage = "Claude API access denied. Please check your API key permissions.";
      } else if (errorType === "rate_limit_error") {
        friendlyMessage = "Claude API rate limit exceeded. Please try again in a moment.";
      }

      throw new Error(
        `Claude API error (${this.config.model}): ${errorType} - ${friendlyMessage}`
      );
    }

    return response.json();
  }

  /**
   * Extracts content from Claude API response
   */
  private extractResponseContent(data: any): string {
    // Claude returns content as an array of content blocks
    const contentBlocks = data.content;

    if (!Array.isArray(contentBlocks) || contentBlocks.length === 0) {
      throw new Error(`Invalid response from Claude ${this.config.model}: No content blocks found`);
    }

    // Find the first text content block
    const textBlock = contentBlocks.find(block => block.type === "text");

    if (!textBlock || !textBlock.text || typeof textBlock.text !== 'string') {
      throw new Error(`Invalid response from Claude ${this.config.model}: No text content found`);
    }

    return textBlock.text.trim();
  }

  /**
   * Attempts to send message with fallback model
   */
  private async sendMessageWithFallback(
    userInput: string,
    systemPrompt?: string,
    previousMessages: Message[] = []
  ): Promise<string> {
    const fallbackProvider = new ClaudeChatProvider(this.config.apiKey, {
      model: ClaudeChatProvider.FALLBACK_MODEL,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
    });

    return fallbackProvider.sendMessage(userInput, systemPrompt, previousMessages);
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
    return `Anthropic ${this.config.model}`;
  }

  /**
   * Tests the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${ClaudeChatProvider.BASE_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "anthropic-version": ClaudeChatProvider.ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 10,
          messages: [{ role: "user", content: "Hello" }],
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
