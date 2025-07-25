import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Agent } from "./types";
import ModelSelector from "./ModelSelector";
import AgentSelector from "./AgentSelector";

interface ChatHeaderProps {
  onBack: () => void;
  selectedModel: string;
  showModelDropdown: boolean;
  onToggleModelDropdown: () => void;
  onSelectModel: (modelId: string) => void;
  agents: Agent[];
  selectedAgent: string | null;
  showAgentsDropdown: boolean;
  onToggleAgentsDropdown: () => void;
  onSelectAgent: (agentId: string | null) => void;
  onClearConversation: () => void;
}

export default function ChatHeader({
  onBack,
  selectedModel,
  showModelDropdown,
  onToggleModelDropdown,
  onSelectModel,
  agents,
  selectedAgent,
  showAgentsDropdown,
  onToggleAgentsDropdown,
  onSelectAgent,
  onClearConversation,
}: ChatHeaderProps) {
  const [agentTransition, setAgentTransition] = useState(false);

  useEffect(() => {
    setAgentTransition(true);
    const timer = setTimeout(() => setAgentTransition(false), 300);
    return () => clearTimeout(timer);
  }, [selectedAgent]);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
      <div className="flex items-center gap-3 ">
        <button
          onClick={onBack}
          className="no-drag backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="drag">
          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Quack Chat
          </h2>
          <div
            className={`transition-all duration-300 ${
              agentTransition ? "scale-95 opacity-60" : "scale-100 opacity-100"
            }`}
          >
            {selectedAgent ? (
              <p className="text-xs text-green-400 mt-0.5">
                Agent: {agents.find((a) => a.id === selectedAgent)?.name}
                {agents.find((a) => a.id === selectedAgent)?.systemPrompt &&
                  " ✨"}
              </p>
            ) : (
              <p className="text-xs text-white/60 mt-0.5">Direct AI Chat</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Model Selector */}
        <ModelSelector
          selectedModel={selectedModel}
          showDropdown={showModelDropdown}
          onToggleDropdown={onToggleModelDropdown}
          onSelectModel={onSelectModel}
        />

        {/* Agent Selector */}
        <AgentSelector
          agents={agents}
          selectedAgent={selectedAgent}
          showDropdown={showAgentsDropdown}
          onToggleDropdown={onToggleAgentsDropdown}
          onSelectAgent={onSelectAgent}
        />

        {/* Clear Conversation */}
        <button
          onClick={onClearConversation}
          className="no-drag backdrop-blur-sm bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
