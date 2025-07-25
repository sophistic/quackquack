import { Bot, ChevronDown } from "lucide-react";
import type { Agent } from "./types";

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: string | null;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectAgent: (agentId: string | null) => void;
}

export default function AgentSelector({
  agents,
  selectedAgent,
  showDropdown,
  onToggleDropdown,
  onSelectAgent,
}: AgentSelectorProps) {
  const handleSelectAgent = (agentId: string | null) => {
    onSelectAgent(agentId);
    onToggleDropdown();
  };

  return (
    <div className="relative">
      <button
        onClick={onToggleDropdown}
        className="no-drag backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-white text-xs transition-all duration-200 flex items-center gap-1"
      >
        <Bot size={14} />
        <span className="truncate max-w-[80px]">
          {selectedAgent
            ? agents.find((a) => a.id === selectedAgent)?.name
            : "No Agent"}
        </span>
        <ChevronDown size={14} />
      </button>

      {showDropdown && (
        <div className="no-drag absolute top-full right-0 mt-1 backdrop-blur-xl bg-black/80 border border-white/20 rounded-lg shadow-xl z-10 min-w-40">
          {agents.length === 0 ? (
            <div className="px-3 py-2 text-white/50 text-xs">
              No agents available
            </div>
          ) : (
            <>
              <button
                onClick={() => handleSelectAgent(null)}
                className="w-full text-left px-3 py-2 text-white/60 hover:bg-white/10 text-xs"
              >
                No Agent
              </button>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent.id)}
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
  );
}
