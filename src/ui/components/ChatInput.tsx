import type React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  selectedAgent?: string | null;
  agents?: Array<{
    id: string;
    name: string;
    context: string;
    systemPrompt?: string;
  }>;
}

export default function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSend,
  selectedAgent,
  agents,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const getCurrentMode = () => {
    if (selectedAgent && agents) {
      const agent = agents.find((a) => a.id === selectedAgent);
      if (agent) {
        return {
          text: `Agent: ${agent.name}`,
          hasSystemPrompt: !!agent.systemPrompt,
          color: "text-green-400",
        };
      }
    }
    return {
      text: "Direct AI Chat",
      hasSystemPrompt: false,
      color: "text-blue-400",
    };
  };

  const mode = getCurrentMode();

  return (
    <div className="p-3 border-t border-white/20 no-drag">
      {/* Mode Indicator */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className={`flex items-center gap-1 text-xs ${mode.color}`}>
          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
          <span>{mode.text}</span>
          {mode.hasSystemPrompt && (
            <span
              className="text-yellow-400"
              title="Using AI-generated system prompt"
            >
              ✨
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            selectedAgent
              ? `Message ${agents?.find((a) => a.id === selectedAgent)?.name || "agent"}...`
              : "Type your message..."
          }
          rows={1}
          className="flex-1 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-200 resize-none"
          style={{ minHeight: "40px", maxHeight: "100px" }}
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
