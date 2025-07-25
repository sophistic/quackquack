import type React from "react";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Trash2, ChevronDown, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatComponentProps {
  onBack: () => void;
}

interface Agent {
  id: string;
  name: string;
  context: string;
}

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div
      className="backdrop-blur-xl bg-black/70 rounded-xl shadow-xl w-[580px] max-h-[500px] flex flex-col scrollbar-hide"
      style={{ WebkitAppRegion: "no-drag" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
        <div className="flex items-center gap-3 ">
          <button
            onClick={onBack}
            style={{ WebkitAppRegion: "no-drag" }}
            className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={18} />
          </button>
          <h2
            className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            style={{ WebkitAppRegion: "drag" }}
          >
            Quack Chat
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <div className="relative">
            <button
              style={{ WebkitAppRegion: "no-drag" }}
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-white text-xs transition-all duration-200 flex items-center gap-1"
            >
              <span className="truncate max-w-[100px]">
                {models.find((m) => m.id === selectedModel)?.name}
              </span>
              <ChevronDown size={14} />
            </button>

            {showModelDropdown && (
              <div
                className="absolute top-full right-0 mt-1 backdrop-blur-xl bg-black/80 border border-white/20 rounded-lg shadow-xl z-10 min-w-40"
                style={{ WebkitAppRegion: "no-drag" }}
              >
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-white text-xs hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-all duration-150"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ✅ Agents Selector */}
          <div className="relative">
            <button
              style={{ WebkitAppRegion: "no-drag" }}
              onClick={() => setShowAgentsDropdown(!showAgentsDropdown)}
              className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-white text-xs transition-all duration-200 flex items-center gap-1"
            >
              <Bot size={14} />
              <span className="truncate max-w-[80px]">
                {selectedAgent
                  ? agents.find((a) => a.id === selectedAgent)?.name
                  : "No Agent"}
              </span>
              <ChevronDown size={14} />
            </button>

            {showAgentsDropdown && (
              <div
                className="absolute top-full right-0 mt-1 backdrop-blur-xl bg-black/80 border border-white/20 rounded-lg shadow-xl z-10 min-w-40"
                style={{ WebkitAppRegion: "no-drag" }}
              >
                {agents.length === 0 ? (
                  <div className="px-3 py-2 text-white/50 text-xs">
                    No agents available
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setSelectedAgent(null);
                        setShowAgentsDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-white/60 hover:bg-white/10 text-xs"
                    >
                      No Agent
                    </button>
                    {agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          setSelectedAgent(agent.id);
                          setShowAgentsDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-white text-xs hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-all duration-150"
                      >
                        {agent.name}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Clear Conversation */}
          <button
            onClick={clearConversation}
            style={{ WebkitAppRegion: "no-drag" }}
            className="backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-white/60 mt-10 text-sm">
            Start a conversation with your AI assistant!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/20 text-white"
                    : "bg-white/10 border border-white/10 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-[10px] text-white/40 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="p-3 border-t border-white/20"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-200 resize-none"
            style={{ minHeight: "40px", maxHeight: "100px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
