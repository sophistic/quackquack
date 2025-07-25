import type { Message } from "../../components/types";

export interface GeminiConfig {
  apiKey: string;
  model: string;
  maxOutputTokens: number;
  temperature: number;
  topK: number;
  topP: number;
}

export class GeminiChatProvider {
  private static readonly DEFAULT_CONFIG: Omit<GeminiConfig, "apiKey"> = {
    model: "gemini-2.0-flash", // Latest Gemini Pro model
    maxOutputTokens: 1000,
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
  };

  private static readonly FALLBACK_MODEL = "gemini-2.0-flash"; // Fallback to standard Gemini Pro
  private static readonly BASE_URL =
    "https://generativelanguage.googleapis.com/v1beta";

  private config: GeminiConfig;

  constructor(
    apiKey: string,
    customConfig?: Partial<Omit<GeminiConfig, "apiKey">>,
  ) {
    this.config = {
      apiKey,
      ...GeminiChatProvider.DEFAULT_CONFIG,
      ...customConfig,
    };
  }

  /**
   * Sends a chat message to Gemini with conversation context
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
    const prompt = this.buildPromptString(
      userInput,
      systemPrompt,
      previousMessages,
    );

    try {
      const response = await this.makeApiCall(prompt);
      return this.extractResponseContent(response);
    } catch (error) {
      // Try fallback model if primary model fails
      if (this.config.model !== GeminiChatProvider.FALLBACK_MODEL) {
        console.warn(
          `Gemini ${this.config.model} failed, trying fallback model`,
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
   * Builds the prompt string for Gemini API format
   * Gemini works best with a single consolidated prompt rather than separate messages
   */
  private buildPromptString(
    userInput: string,
    systemPrompt?: string,
    previousMessages: Message[] = [],
  ): string {
    let fullPrompt = "";

    // Add system prompt if provided (agent mode)
    if (systemPrompt?.trim()) {
      fullPrompt += `System Instructions: ${systemPrompt.trim()}\n\n`;
    }

    // Add conversation history (last 10 messages for context)
    const recentMessages = previousMessages.slice(-10);
    if (recentMessages.length > 0) {
      fullPrompt += "Conversation History:\n";
      recentMessages.forEach((msg) => {
        const speaker = msg.role === "user" ? "User" : "Assistant";
        fullPrompt += `${speaker}: ${msg.content}\n`;
      });
      fullPrompt += "\n";
    }

    // Add current user message
    fullPrompt += `User: ${userInput.trim()}\n\nAssistant:`;

    return fullPrompt;
  }

  /**
   * Makes the actual API call to Gemini
   */
  private async makeApiCall(prompt: string): Promise<any> {
    const endpoint = `${GeminiChatProvider.BASE_URL}/models/${this.config.model}:generateContent`;
    const url = `${endpoint}?key=${this.config.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: this.config.temperature,
          topK: this.config.topK,
          topP: this.config.topP,
          maxOutputTokens: this.config.maxOutputTokens,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || response.statusText;
      const errorCode = errorData.error?.code || response.status;

      throw new Error(
        `Gemini API error (${this.config.model}): ${errorCode} - ${errorMessage}`,
      );
    }

    return response.json();
  }

  /**
   * Extracts content from Gemini API response
   */
  private extractResponseContent(data: any): string {
    const candidate = data.candidates?.[0];

    if (!candidate) {
      throw new Error(
        `Invalid response from Gemini ${this.config.model}: No candidates found`,
      );
    }

    // Check if content was blocked
    if (candidate.finishReason === "SAFETY") {
      throw new Error(
        `Gemini ${this.config.model} blocked the response due to safety concerns. Please try rephrasing your message.`,
      );
    }

    const content = candidate.content?.parts?.[0]?.text;

    if (!content || typeof content !== "string") {
      throw new Error(
        `Invalid response from Gemini ${this.config.model}: No content generated`,
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
    const fallbackProvider = new GeminiChatProvider(this.config.apiKey, {
      model: GeminiChatProvider.FALLBACK_MODEL,
      maxOutputTokens: this.config.maxOutputTokens,
      temperature: this.config.temperature,
      topK: this.config.topK,
      topP: this.config.topP,
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
    return `Google ${this.config.model}`;
  }

  /**
   * Tests the API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${GeminiChatProvider.BASE_URL}/models?key=${this.config.apiKey}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}
