import { Bot, Plus } from "lucide-react";
import type { Agent } from "./types";
import AgentItem from "./AgentItem";

interface AgentsSectionProps {
  agents: Agent[];
  onAddAgent: () => void;
  onDeleteAgent: (id: string) => void;
}

export default function AgentsSection({
  agents,
  onAddAgent,
  onDeleteAgent,
}: AgentsSectionProps) {
  return (
    <div className="space-y-3" style={{ WebkitAppRegion: "no-drag" }}>
      <div className="flex items-center justify-between">
        <h3 className="text-white/80 text-sm font-semibold flex items-center gap-1">
          <Bot size={14} /> Agents
        </h3>
        <button
          onClick={onAddAgent}
          className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
        >
          <Plus size={14} /> Add Agent
        </button>
      </div>

      {agents.length === 0 ? (
        <p className="text-white/50 text-xs">No agents available.</p>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => (
            <AgentItem key={agent.id} agent={agent} onDelete={onDeleteAgent} />
          ))}
        </div>
      )}
    </div>
  );
}
