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
        className={`no-drag backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-1 ${
          selectedAgent
            ? "bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-100"
            : "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
        }`}
      >
        <Bot size={14} />
        <div className="flex items-center gap-1">
          <span className="truncate max-w-[80px]">
            {selectedAgent
              ? agents.find((a) => a.id === selectedAgent)?.name
              : "No Agent"}
          </span>
          {selectedAgent &&
            agents.find((a) => a.id === selectedAgent)?.systemPrompt && (
              <span
                className="text-yellow-400"
                title="Has AI-generated system prompt"
              >
                ✨
              </span>
            )}
        </div>
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
                className="w-full text-left px-3 py-2 text-white/60 hover:bg-white/10 text-xs flex items-center justify-between"
              >
                <span>No Agent</span>
                <span className="text-white/40 text-[10px]">Direct AI</span>
              </button>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent.id)}
                  className="w-full text-left px-3 py-2 text-white text-xs hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-all duration-150 flex items-center justify-between"
                >
                  <span>{agent.name}</span>
                  <div className="flex items-center gap-1">
                    {agent.systemPrompt && (
                      <span
                        className="text-yellow-400"
                        title="Has AI-generated system prompt"
                      >
                        ✨
                      </span>
                    )}
                    <span className="text-white/40 text-[10px]">Agent</span>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
