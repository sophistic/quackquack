import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Agent } from "./types";
import ModelSelector from "./ModelSelector";
import AgentSelector from "./AgentSelector";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center justify-between px-4 py-3 border-b border-border font-inter">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="no-drag p-2 rounded-md border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft size={18} />
        </Button>
        <div className="drag">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Quack Chat</h2>
          <div
            className={`transition-all duration-300 ${
              agentTransition ? "scale-95 opacity-60" : "scale-100 opacity-100"
            }`}
          >
            {selectedAgent ? (
              <p className="text-xs text-green-400 mt-0.5">
                Agent: {agents.find((a) => a.id === selectedAgent)?.name}
                {agents.find((a) => a.id === selectedAgent)?.systemPrompt && " ✨"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">Direct AI Chat</p>
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
        <Button
          type="button"
          variant="destructive"
          onClick={onClearConversation}
          className="no-drag p-2 rounded-md border border-border "
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}
