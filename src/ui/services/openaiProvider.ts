interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenAIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSystemPrompt(agentName: string, agentContext: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('OpenAI API key is required');
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates detailed system prompts for AI agents. Create a comprehensive system prompt that defines the agent\'s role, behavior, and capabilities based on the provided name and context.'
      },
      {
        role: 'user',
        content: `Create a detailed system prompt for an AI agent with the following details:

Agent Name: ${agentName}
Agent Context: ${agentContext}

The system prompt should:
1. Define the agent's primary role and purpose
2. Specify the agent's personality and communication style
3. Outline key capabilities and areas of expertise
4. Include any behavioral guidelines or constraints
5. Be clear, concise, and actionable

Please provide only the system prompt without any additional explanation.`
      }
    ];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data: OpenAIResponse = await response.json();
      const systemPrompt = data.choices[0]?.message?.content?.trim();

      if (!systemPrompt) {
        throw new Error('No system prompt generated from OpenAI');
      }

      return systemPrompt;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate system prompt with OpenAI: ${error.message}`);
      }
      throw new Error('Unknown error occurred while generating system prompt with OpenAI');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
