import { useState, useEffect, useRef } from "react";
import type { ChatComponentProps, Message, Agent } from "../components/types";
import ChatHeader from "../components/ChatHeader";
import MessagesList from "../components/MessagesList";
import ChatInput from "../components/ChatInput";
import { ChatService } from "../services/chatProviders/chatService";

interface Model {
  id: string;
  name: string;
  provider: string;
}

const models: Model[] = [
  { id: "openai-gpt4", name: "OpenAI GPT-4 Turbo", provider: "openai" },
  { id: "openai-gpt35", name: "OpenAI GPT-3.5", provider: "openai" },
  { id: "gemini", name: "Google Gemini 2.0 Flash", provider: "gemini" },
  { id: "claude-3", name: "Anthropic Claude 3.5 Sonnet", provider: "claude" },
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
          content: "❌ " + ChatService.getMissingProviderMessage(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      // Check if selected model is available
      const currentModel = models.find((m) => m.id === selectedModel);

      if (!currentModel || !availableProviders.has(currentModel.provider)) {
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

      // Create chat service instance
      const chatService = await ChatService.createFromSelectedProvider();
      if (!chatService) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "❌ Unable to initialize chat service. Please check your API keys in Settings.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      // Prepare system prompt and agent info
      let systemPrompt: string | undefined;
      let agentName = "";

      // If an agent is selected, use its system prompt
      if (selectedAgent) {
        const agent = agents.find((a) => a.id === selectedAgent);
        if (agent) {
          agentName = agent.name;
          if (agent.systemPrompt) {
            systemPrompt = agent.systemPrompt;
          } else if (agent.context) {
            systemPrompt = `You are ${agent.name}. ${agent.context}`;
          }
        }
      }

      // Add thinking indicator
      const thinkingMessage: Message = {
        id: (Date.now() + 0.5).toString(),
        role: "assistant",
        content: selectedAgent
          ? `🤖 ${agentName} is thinking...`
          : `🧠 ${chatService.getProviderDisplayName()} is thinking...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, thinkingMessage]);

      // Send message to AI provider
      const response = await chatService.sendMessage(
        userMessage.content,
        systemPrompt,
        messages,
      );

      // Remove thinking message and add actual response
      setMessages((prev) => {
        const withoutThinking = prev.filter(
          (msg) => msg.id !== thinkingMessage.id,
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
      className="backdrop-blur-xl bg-black/70 rounded-xl shadow-xl w-[580px] max-h-[500px] flex flex-col scrollbar-hide"
      style={{ WebkitAppRegion: "no-drag" }}
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
