interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export class GeminiProvider {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSystemPrompt(
    agentName: string,
    agentContext: string,
  ): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === "") {
      throw new Error("Gemini API key is required");
    }

    const prompt = `You are a helpful assistant that creates detailed system prompts for AI agents. Create a comprehensive system prompt that defines the agent's role, behavior, and capabilities based on the provided name and context.

Create a detailed system prompt for an AI agent with the following details:

Agent Name: ${agentName}
Agent Context: ${agentContext}

The system prompt should:
1. Define the agent's primary role and purpose
2. Specify the agent's personality and communication style
3. Outline key capabilities and areas of expertise
4. Include any behavioral guidelines or constraints
5. Be clear, concise, and actionable

Please provide only the system prompt without any additional explanation.`;

    const contents = [
      {
        role: "user" as const,
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    try {
      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 500,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
        );
      }

      const data: GeminiResponse = await response.json();
      const systemPrompt = data.candidates[0]?.content?.parts[0]?.text?.trim();

      if (!systemPrompt) {
        throw new Error("No system prompt generated from Gemini");
      }

      return systemPrompt;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to generate system prompt with Gemini: ${error.message}`,
        );
      }
      throw new Error(
        "Unknown error occurred while generating system prompt with Gemini",
      );
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.apiKey}`,
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
