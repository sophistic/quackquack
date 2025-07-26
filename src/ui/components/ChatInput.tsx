import type React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            selectedAgent
              ? `Message ${agents?.find((a) => a.id === selectedAgent)?.name || "agent"}...`
              : "Type your message..."
          }
          rows={1}
          className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-all duration-200 resize-none font-inter"
          style={{ minHeight: "40px", maxHeight: "100px" }}
        />
        <Button
          type="button"
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="no-drag rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
