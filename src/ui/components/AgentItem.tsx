import { Trash2 } from "lucide-react";
import type { Agent } from "./types";

interface AgentItemProps {
  agent: Agent;
  onDelete: (id: string) => void;
}

export default function AgentItem({ agent, onDelete }: AgentItemProps) {
  return (
    <div className="flex justify-between items-start p-3 rounded-lg bg-white/5 border border-white/10 text-white">
      <div>
        <p className="font-medium text-sm">{agent.name}</p>
        <p className="text-xs text-white/60">{agent.context}</p>
      </div>
      <button
        onClick={() => onDelete(agent.id)}
        className="text-red-400 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
