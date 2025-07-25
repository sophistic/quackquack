import { useState, useEffect, useRef } from "react";
import type { ChatComponentProps, Message, Agent } from "../components/types";
import ChatHeader from "../components/ChatHeader";
import MessagesList from "../components/MessagesList";
import ChatInput from "../components/ChatInput";
import { AIService } from "../services/aiService";

interface Model {
  id: string;
  name: string;
  provider: string;
}

const models: Model[] = [
  { id: "openai-gpt4", name: "OpenAI GPT-4", provider: "openai" },
  { id: "openai-gpt35", name: "OpenAI GPT-3.5", provider: "openai" },
  { id: "gemini", name: "gemini-2.5-flash-live", provider: "gemini" },
  { id: "claude-3", name: "Claude 3", provider: "claude" },
];

export default function ChatComponent({ onBack }: ChatComponentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai-gpt4");
  const [isLoading, setIsLoading] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showAgentsDropdown, setShowAgentsDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check which providers have valid API keys
  const getAvailableProviders = () => {
    const available = new Set<string>();

    const geminiKey = localStorage.getItem("gemini_api_key");
    const openaiKey = localStorage.getItem("openai_api_key");
    const claudeKey = localStorage.getItem("claude_api_key");

    if (geminiKey && geminiKey.trim() !== "") {
      available.add("gemini");
    }
    if (openaiKey && openaiKey.trim() !== "") {
      available.add("openai");
    }
    if (claudeKey && claudeKey.trim() !== "") {
      available.add("claude");
    }

    return available;
  };

  const getDefaultAvailableModel = () => {
    try {
      const availableProviders = getAvailableProviders();
      const storedProvider = localStorage.getItem("selected_provider");

      // If stored provider is available, find a model for it
      if (storedProvider && availableProviders.has(storedProvider)) {
        const modelForProvider = models.find(
          (m) => m.provider === storedProvider,
        );
        if (modelForProvider) {
          return modelForProvider.id;
        }
      }

      // Otherwise, find the first available model
      const availableModel = models.find((m) =>
        availableProviders.has(m.provider),
      );
      return availableModel ? availableModel.id : "openai-gpt4"; // fallback
    } catch (error) {
      console.error("Error getting default model:", error);
      return "openai-gpt4"; // safe fallback
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    try {
      // Load agents from localStorage
      const storedAgents = JSON.parse(localStorage.getItem("agents") || "[]");
      setAgents(storedAgents);

      // Set initial model based on available API keys
      const defaultModel = getDefaultAvailableModel();
      setSelectedModel(defaultModel);
    } catch (error) {
      console.error("Error loading initial data:", error);
      // Set fallback values
      setAgents([]);
      setSelectedModel("openai-gpt4");
    }
  }, []);

  useEffect(() => {
    try {
      // Check if current model is still available, if not switch to an available one
      const availableProviders = getAvailableProviders();
      const currentModel = models.find((m) => m.id === selectedModel);

      if (currentModel && !availableProviders.has(currentModel.provider)) {
        const defaultModel = getDefaultAvailableModel();
        setSelectedModel(defaultModel);
      }
    } catch (error) {
      console.error("Error checking model availability:", error);
    }
  }, [selectedModel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      // Check if any API keys are available
      const availableProviders = getAvailableProviders();
      if (availableProviders.size === 0) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "❌ No API keys configured. Please add at least one API key in Settings to start chatting.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      // Check if selected model is available
      const currentModel = models.find((m) => m.id === selectedModel);

      if (!currentModel || !availableProviders.has(currentModel.provider)) {
        // Model not available, show error message
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `❌ ${currentModel?.provider.toUpperCase() || "Selected"} API key is required. Please add your API key in Settings to use this model.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      // Get AI service instance
      const aiService = await AIService.createInstance();
      if (!aiService) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "❌ Unable to initialize AI service. Please check your API keys in Settings.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      // Prepare conversation context
      let conversationContext = "";
      let agentName = "";

      // If an agent is selected, use its system prompt
      if (selectedAgent) {
        const agent = agents.find((a) => a.id === selectedAgent);
        if (agent) {
          agentName = agent.name;
          if (agent.systemPrompt) {
            conversationContext = agent.systemPrompt;
          } else if (agent.context) {
            conversationContext = `You are ${agent.name}. ${agent.context}`;
          }
        }
      }

      // Add status indicator to show which mode is being used
      const statusMessage: Message = {
        id: (Date.now() + 0.5).toString(),
        role: "assistant",
        content: selectedAgent
          ? `🤖 ${agentName} is thinking...`
          : `🧠 ${aiService.getProviderDisplayName()} is thinking...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, statusMessage]);

      // Send message to AI provider
      const response = await sendMessageToProvider(
        aiService,
        userMessage.content,
        conversationContext,
        messages,
      );

      // Remove the thinking message and add the actual response
      setMessages((prev) => {
        const withoutThinking = prev.filter(
          (msg) => msg.id !== statusMessage.id,
        );
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
        };
        return [...withoutThinking, aiMessage];
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error in handleSend:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error instanceof Error
            ? `❌ ${error.message}`
            : "❌ An unexpected error occurred. Please try again.",
        timestamp: new Date(),
      };
      // Remove any thinking messages and add error
      setMessages((prev) => {
        const withoutThinking = prev.filter(
          (msg) => !msg.content.includes("is thinking..."),
        );
        return [...withoutThinking, errorMessage];
      });
      setIsLoading(false);
    }
  };

  const sendMessageToProvider = async (
    aiService: AIService,
    userInput: string,
    systemPrompt: string,
    previousMessages: Message[],
  ): Promise<string> => {
    const provider = aiService.getProvider();

    try {
      switch (provider) {
        case "openai":
          return await sendToOpenAI(
            aiService,
            userInput,
            systemPrompt,
            previousMessages,
          );
        case "gemini":
          return await sendToGemini(
            aiService,
            userInput,
            systemPrompt,
            previousMessages,
          );
        case "claude":
          return await sendToClaude(
            aiService,
            userInput,
            systemPrompt,
            previousMessages,
          );
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      throw new Error(
        `Failed to get response from ${provider.toUpperCase()}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const sendToOpenAI = async (
    aiService: AIService,
    userInput: string,
    systemPrompt: string,
    previousMessages: Message[],
  ): Promise<string> => {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) throw new Error("OpenAI API key not found");

    const messages: any[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }

    // Add previous conversation context (last 10 messages for context)
    const recentMessages = previousMessages.slice(-10);
    recentMessages.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({ role: "user", content: userInput });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response generated";
  };

  const sendToGemini = async (
    aiService: AIService,
    userInput: string,
    systemPrompt: string,
    previousMessages: Message[],
  ): Promise<string> => {
    const apiKey = localStorage.getItem("gemini_api_key");
    if (!apiKey) throw new Error("Gemini API key not found");

    // Build conversation context
    let fullPrompt = "";

    if (systemPrompt) {
      fullPrompt += `System: ${systemPrompt}\n\n`;
    }

    // Add recent conversation history
    const recentMessages = previousMessages.slice(-10);
    recentMessages.forEach((msg) => {
      fullPrompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    });

    fullPrompt += `User: ${userInput}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
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

    const data = await response.json();
    return (
      data.candidates[0]?.content?.parts[0]?.text || "No response generated"
    );
  };

  const sendToClaude = async (
    aiService: AIService,
    userInput: string,
    systemPrompt: string,
    previousMessages: Message[],
  ): Promise<string> => {
    const apiKey = localStorage.getItem("claude_api_key");
    if (!apiKey) throw new Error("Claude API key not found");

    const messages: any[] = [];

    // Add previous conversation context (last 10 messages)
    const recentMessages = previousMessages.slice(-10);
    recentMessages.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({ role: "user", content: userInput });

    const requestBody: any = {
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      temperature: 0.7,
      messages: messages,
    };

    // Add system prompt if provided
    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Claude API error: ${response.status} - ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.content[0]?.text || "No response generated";
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const handleToggleModelDropdown = () => {
    setShowModelDropdown(!showModelDropdown);
    if (showAgentsDropdown) setShowAgentsDropdown(false);
  };

  const handleModelSelect = (modelId: string) => {
    try {
      const model = models.find((m) => m.id === modelId);
      if (model) {
        // Store the selected provider in localStorage
        localStorage.setItem("selected_provider", model.provider);
        setSelectedModel(modelId);
      }
    } catch (error) {
      console.error("Error selecting model:", error);
      // Still set the model even if localStorage fails
      setSelectedModel(modelId);
    }
  };

  const handleToggleAgentsDropdown = () => {
    setShowAgentsDropdown(!showAgentsDropdown);
    if (showModelDropdown) setShowModelDropdown(false);
  };

  return (
    <div
      className="no-drag backdrop-blur-xl bg-black/70 rounded-xl shadow-xl w-[580px] max-h-[500px] flex flex-col scrollbar-hide"
      // style={{ WebkitAppRegion: "no-drag" }}
    >
      {/* Header */}
      <ChatHeader
        onBack={onBack}
        selectedModel={selectedModel}
        showModelDropdown={showModelDropdown}
        onToggleModelDropdown={handleToggleModelDropdown}
        onSelectModel={handleModelSelect}
        agents={agents}
        selectedAgent={selectedAgent}
        showAgentsDropdown={showAgentsDropdown}
        onToggleAgentsDropdown={handleToggleAgentsDropdown}
        onSelectAgent={setSelectedAgent}
        onClearConversation={clearConversation}
      />

      {/* Messages */}
      <MessagesList
        messages={messages}
        isLoading={isLoading}
        ref={messagesEndRef}
      />

      {/* Input Area */}
      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={handleSend}
        selectedAgent={selectedAgent}
        agents={agents}
      />
    </div>
  );
}
