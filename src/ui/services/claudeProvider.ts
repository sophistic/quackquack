interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  content: {
    type: 'text';
    text: string;
  }[];
}

export class ClaudeProvider {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSystemPrompt(agentName: string, agentContext: string): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('Claude API key is required');
    }

    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: `You are a helpful assistant that creates detailed system prompts for AI agents. Create a comprehensive system prompt that defines the agent's role, behavior, and capabilities based on the provided name and context.

Create a detailed system prompt for an AI agent with the following details:

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
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          temperature: 0.7,
          messages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data: ClaudeResponse = await response.json();
      const systemPrompt = data.content[0]?.text?.trim();

      if (!systemPrompt) {
        throw new Error('No system prompt generated from Claude');
      }

      return systemPrompt;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate system prompt with Claude: ${error.message}`);
      }
      throw new Error('Unknown error occurred while generating system prompt with Claude');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
