import { ArrowLeft, Trash2 } from "lucide-react";
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
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
      <div className="flex items-center gap-3 ">
        <button
          onClick={onBack}
          className="no-drag backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="drag text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Quack Chat
        </h2>
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
