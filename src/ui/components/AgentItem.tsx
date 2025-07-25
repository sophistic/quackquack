import { Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { Agent } from "./types";

interface AgentItemProps {
  agent: Agent;
  onDelete: (id: string) => void;
}

export default function AgentItem({ agent, onDelete }: AgentItemProps) {
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  return (
    <div className="rounded-lg bg-white/5 border border-white/10 text-white">
      <div className="flex justify-between items-start p-3">
        <div className="flex-1">
          <p className="font-medium text-sm">{agent.name}</p>
          <p className="text-xs text-white/60">{agent.context}</p>
          {agent.systemPrompt && (
            <div className="mt-2">
              <button
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showSystemPrompt ? <EyeOff size={12} /> : <Eye size={12} />}
                {showSystemPrompt ? "Hide" : "Show"} System Prompt
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => onDelete(agent.id)}
          className="text-red-400 hover:text-red-500 ml-2"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {showSystemPrompt && agent.systemPrompt && (
        <div className="px-3 pb-3 border-t border-white/10 mt-2">
          <div className="mt-2 p-2 bg-white/5 rounded text-xs text-white/80 max-h-32 overflow-y-auto scrollbar-hide">
            {agent.systemPrompt}
          </div>
        </div>
      )}
    </div>
  );
}
