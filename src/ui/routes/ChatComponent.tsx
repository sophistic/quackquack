import { useState, useEffect, useRef } from "react";
import type { ChatComponentProps, Message, Agent } from "../components/types";
import ChatHeader from "../components/ChatHeader";
import MessagesList from "../components/MessagesList";
import ChatInput from "../components/ChatInput";

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

  const models = [
    { id: "openai-gpt4", name: "OpenAI GPT-4", provider: "openai" },
    { id: "openai-gpt35", name: "OpenAI GPT-3.5", provider: "openai" },
    { id: "gemini-pro", name: "Gemini Pro", provider: "gemini" },
    { id: "claude-3", name: "Claude 3", provider: "claude" },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load agents from localStorage
    const storedAgents = JSON.parse(localStorage.getItem("agents") || "[]");
    setAgents(storedAgents);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulated AI response (replace later with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `This is a simulated response from ${
          models.find((m) => m.id === selectedModel)?.name
        } ${
          selectedAgent
            ? `with the help of agent "${
                agents.find((a) => a.id === selectedAgent)?.name
              }" (context: ${
                agents.find((a) => a.id === selectedAgent)?.context
              })`
            : ""
        }.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const handleToggleModelDropdown = () => {
    setShowModelDropdown(!showModelDropdown);
    if (showAgentsDropdown) setShowAgentsDropdown(false);
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
        onSelectModel={setSelectedModel}
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
      />
    </div>
  );
}
