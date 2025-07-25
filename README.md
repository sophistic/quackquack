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
    id: string;        // Unique identifier (timestamp-based)
    name: string;      // Display name of the agent
    context: string;   // Instructions/context for the agent
  }
  ```
- **Example Storage**:
  ```javascript
  const agents = [
    {
      id: "1703123456789",
      name: "Helper Bot",
      context: "Assists users with general tasks."
    },
    {
      id: "1703123456790", 
      name: "Code Assistant",
      context: "Specialized in helping with programming tasks and code review."
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

### Storage Operations

#### Reading from localStorage
```javascript
// API Keys
const geminiKey = localStorage.getItem("gemini_api_key") || "";
const openaiKey = localStorage.getItem("openai_api_key") || "";
const claudeKey = localStorage.getItem("claude_api_key") || "";

// Agents
const storedAgents = JSON.parse(localStorage.getItem("agents") || "[]");
```

#### Writing to localStorage
```javascript
// API Keys
localStorage.setItem("gemini_api_key", geminiKey);
localStorage.setItem("openai_api_key", openaiKey);  
localStorage.setItem("claude_api_key", claudeKey);

// Agents
localStorage.setItem("agents", JSON.stringify(updatedAgents));
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
