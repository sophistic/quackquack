# QuackQuack - AI Chat Overlay

An Electron-based AI chat overlay application with multiple AI model support and custom agents.

## Setup Instructions

```bash
yarn
# OPEN TWO TERMINALS
yarn dev:react    # in one terminal
yarn dev:electron # in other terminal
```

## LocalStorage Documentation

This application uses browser localStorage to persist user data across sessions. Below are all the localStorage keys used, their purposes, and data structures:

### 1. API Keys Storage

**Purpose**: Store user API keys for different AI services securely in the browser's localStorage.

#### Gemini API Key
- **Key**: `"gemini_api_key"`
- **Data Type**: String
- **Purpose**: Stores the user's Google Gemini API key for AI model access
- **Example**:
  ```javascript
  localStorage.setItem("gemini_api_key", "AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz");
  ```
- **Usage Location**: `ApiKeysSection.tsx` component for saving/loading

#### OpenAI API Key
- **Key**: `"openai_api_key"`
- **Data Type**: String
- **Purpose**: Stores the user's OpenAI API key for GPT models access
- **Example**:
  ```javascript
  localStorage.setItem("openai_api_key", "sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEF");
  ```
- **Usage Location**: `ApiKeysSection.tsx` component for saving/loading

#### Claude API Key
- **Key**: `"claude_api_key"`
- **Data Type**: String
- **Purpose**: Stores the user's Anthropic Claude API key for Claude models access
- **Example**:
  ```javascript
  localStorage.setItem("claude_api_key", "sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz");
  ```
- **Usage Location**: `ApiKeysSection.tsx` component for saving/loading

### 2. Agents Storage

**Purpose**: Store custom AI agents with their configurations and contexts.

#### Agents Array
- **Key**: `"agents"`
- **Data Type**: JSON stringified array of Agent objects
- **Purpose**: Stores user-created AI agents with their names and context instructions
- **Data Structure**:
  ```typescript
  interface Agent {
    id: string;           // Unique identifier (timestamp-based)
    name: string;         // Display name of the agent
    context: string;      // Instructions/context for the agent
    systemPrompt?: string;// AI-generated system prompt (optional)
  }
  ```
- **Example Storage**:
  ```javascript
  const agents = [
    {
      id: "1703123456789",
      name: "Helper Bot",
      context: "Assists users with general tasks.",
      systemPrompt: "You are a helpful assistant that assists users with general tasks. Be friendly, professional, and provide clear, actionable responses."
    },
    {
      id: "1703123456790",
      name: "Code Assistant",
      context: "Specialized in helping with programming tasks and code review.",
      systemPrompt: "You are an expert code assistant specializing in software development. Provide accurate, efficient, and well-documented code solutions."
    }
  ];
  localStorage.setItem("agents", JSON.stringify(agents));
  ```
- **Default Value**: If no agents exist, a default "Helper Bot" agent is created
- **Usage Locations**:
  - `SettingsComponent.tsx` - For creating, reading, updating, and deleting agents
  - `ChatComponent.tsx` - For loading available agents in chat interface
  - `AgentsSection.tsx` - For displaying and managing agents
  - `AgentSelector.tsx` - For selecting agents in chat

### 3. Provider Selection Storage

**Purpose**: Store the currently selected AI provider for persistence across sessions.

#### Selected Provider
- **Key**: `"selected_provider"`
- **Data Type**: String
- **Purpose**: Stores the currently selected AI provider name to maintain user's preference
- **Possible Values**: `"openai"`, `"gemini"`, `"claude"`
- **Example**:
  ```javascript
  localStorage.setItem("selected_provider", "openai");
  ```
- **Usage Locations**:
  - `ModelSelector.tsx` - For storing selected provider when user selects a model
  - `ChatComponent.tsx` - For loading the last selected provider on startup
- **Behavior**:
  - Automatically set when user selects any AI model from dropdown
  - Used to determine default model on app restart
  - Falls back to first available provider if stored provider has no API key

## AI Service Integration

### System Prompt Generation

The application includes AI-powered system prompt generation for agents using the configured AI providers.

#### Supported Providers

1. **OpenAI GPT-4**
   - Endpoint: `https://api.openai.com/v1/chat/completions`
   - Model: `gpt-4`
   - Authentication: Bearer token

2. **Google Gemini 2.0 Flash**
   - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
   - Authentication: API key parameter

3. **Anthropic Claude**
   - Endpoint: `https://api.anthropic.com/v1/messages`
   - Model: `claude-3-sonnet-20240229`
   - Authentication: Bearer token with anthropic-version header

#### AI Service Usage

```typescript
// Create AI service instance using selected provider
const aiService = await AIService.createInstance();

// Generate system prompt for an agent
const systemPrompt = await aiService.generateSystemPrompt(
  "Agent Name",
  "Agent context and purpose"
);
```

#### System Prompt Generation Process

1. **Provider Selection**: Uses the currently selected provider from localStorage
2. **API Key Validation**: Ensures the selected provider has a valid API key
3. **Prompt Engineering**: Sends a structured request to generate comprehensive system prompts
4. **Error Handling**: Provides fallbacks and detailed error messages
5. **Storage**: Generated prompts are stored with the agent in localStorage

#### Generated Prompt Structure

System prompts are generated to include:
- Agent's primary role and purpose
- Personality and communication style
- Key capabilities and areas of expertise
- Behavioral guidelines and constraints
- Clear, actionable instructions

### Storage Operations

#### Reading from localStorage
```javascript
// API Keys
const geminiKey = localStorage.getItem("gemini_api_key") || "";
const openaiKey = localStorage.getItem("openai_api_key") || "";
const claudeKey = localStorage.getItem("claude_api_key") || "";

// Agents
const storedAgents = JSON.parse(localStorage.getItem("agents") || "[]");

// Selected Provider
const selectedProvider = localStorage.getItem("selected_provider") || "";
```

#### Writing to localStorage
```javascript
// API Keys
localStorage.setItem("gemini_api_key", geminiKey);
localStorage.setItem("openai_api_key", openaiKey);
localStorage.setItem("claude_api_key", claudeKey);

// Agents
localStorage.setItem("agents", JSON.stringify(updatedAgents));

// Selected Provider
localStorage.setItem("selected_provider", "openai");
```

#### Default Initialization
```javascript
// If no agents exist, create a default one
if (storedAgents.length === 0) {
  const dummyAgent = {
    id: Date.now().toString(),
    name: "Helper Bot",
    context: "Assists users with general tasks."
  };
  localStorage.setItem("agents", JSON.stringify([dummyAgent]));
}
```

### Model Availability Logic

- Models are automatically greyed out in dropdown if their provider lacks an API key
- Users cannot select unavailable models (those without valid API keys)
- Default model selection prioritizes stored provider preference if API key exists
- Falls back to first available model if stored provider is unavailable
- Error messages shown when attempting to use models without API keys

## Chat Functionality

### Direct AI Chat vs Agent-Based Chat

The application supports two distinct chat modes:

#### 1. Direct AI Chat (No Agent Selected)
- **Behavior**: Messages sent directly to the selected AI provider
- **System Prompt**: None - uses the AI model's default behavior
- **Visual Indicator**: "Direct AI Chat" label with blue indicator
- **Use Case**: General AI assistance without specific persona or constraints

#### 2. Agent-Based Chat (Agent Selected)
- **Behavior**: Messages sent to AI provider with agent's system prompt
- **System Prompt**: Uses the selected agent's AI-generated system prompt
- **Visual Indicator**: "Agent: [Name]" label with green indicator and ✨ if AI-enhanced
- **Use Case**: Specialized assistance with defined personality and expertise

### AI Provider Integration

#### Message Flow
1. **User Input**: User types message in chat interface
2. **Context Building**: System builds conversation context based on mode:
   - **Direct Mode**: Only user message and conversation history
   - **Agent Mode**: Agent system prompt + user message + conversation history
3. **Provider Selection**: Routes to configured AI provider (OpenAI/Gemini/Claude)
4. **API Call**: Sends formatted request to AI provider
5. **Response Processing**: Formats and displays AI response

#### Provider-Specific Implementation

**OpenAI GPT-4 Turbo** (`gpt-4-turbo-preview`):
```javascript
// Message format for OpenAI with system prompt separation
messages: [
  { role: "system", content: systemPrompt }, // Only if agent selected
  { role: "user", content: "Previous user message" },
  { role: "assistant", content: "Previous AI response" },
  { role: "user", content: "Current user message" }
]
// Uses: max_tokens: 1000, temperature: 0.7
```

**Google Gemini 1.5 Pro** (`gemini-1.5-pro`):
```javascript
// Gemini uses consolidated prompt with conversation context
fullPrompt = `
System Instructions: ${systemPrompt}

Conversation History:
User: Previous message
Assistant: Previous response

User: Current message`
// Uses: maxOutputTokens: 1000, temperature: 0.7, topK: 40, topP: 0.95
```

**Anthropic Claude 3.5 Sonnet** (`claude-3-5-sonnet-20241022`):
```javascript
// Claude separates system prompt from messages
{
  system: systemPrompt, // Only if agent selected
  messages: [
    { role: "user", content: "Previous user message" },
    { role: "assistant", content: "Previous AI response" },
    { role: "user", content: "Current user message" }
  ]
}
// Uses: max_tokens: 1000, temperature: 0.7
```

### Conversation Context Management

- **History Limit**: Last 10 messages included for context
- **Memory**: Conversations persist until manually cleared
- **Context Building**: Different strategies per provider while maintaining consistency
- **Error Handling**: Graceful fallbacks for API failures

### Refactored Chat Architecture

#### Chat Provider Classes
- `OpenAIChatProvider` - Handles OpenAI GPT-4 Turbo API communication
- `GeminiChatProvider` - Handles Google Gemini 1.5 Pro API communication
- `ClaudeChatProvider` - Handles Anthropic Claude 3.5 Sonnet API communication
- `ChatService` - Main service that routes to appropriate provider

#### Model Versions Used
- **OpenAI**: `gpt-4-turbo-preview` (with fallback to `gpt-4`)
- **Gemini**: `gemini-1.5-pro` (with fallback to `gemini-pro`)
- **Claude**: `claude-3-5-sonnet-20241022` (with fallback to `claude-3-sonnet-20240229`)

#### Error Handling
- Connection testing for each provider
- Detailed error messages for API failures
- Graceful fallbacks when providers are unavailable
- Validation of API keys before making requests

#### Service Files Location
- `/src/ui/services/aiService.ts` - Main AI service
- `/src/ui/services/openaiProvider.ts` - OpenAI implementation
- `/src/ui/services/geminiProvider.ts` - Gemini implementation
- `/src/ui/services/claudeProvider.ts` - Claude implementation

### Security Considerations

- API keys are stored in plain text in localStorage
- localStorage is domain-specific and persists until manually cleared
- Data is not encrypted - consider this when storing sensitive information
- Clear localStorage when uninstalling or switching environments

### Data Persistence

- All data persists across application restarts
- Data is tied to the specific domain/origin
- Clearing browser data will remove all stored information
- No server-side backup - data is local only
