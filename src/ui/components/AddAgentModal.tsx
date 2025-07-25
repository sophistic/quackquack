interface AddAgentModalProps {
  isOpen: boolean;
  newAgentName: string;
  newAgentContext: string;
  onNameChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onClose: () => void;
  onCreateAgent: (name: string, context: string) => void;
}

export default function AddAgentModal({
  isOpen,
  newAgentName,
  newAgentContext,
  onNameChange,
  onContextChange,
  onClose,
  onCreateAgent,
}: AddAgentModalProps) {
  if (!isOpen) return null;

  const handleCreate = () => {
    onCreateAgent(newAgentName.trim(), newAgentContext.trim());
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-black/80 border border-white/20 rounded-xl p-5 w-[360px]">
        <h3 className="text-white text-sm font-semibold mb-3">
          Add New Agent
        </h3>
        <input
          type="text"
          placeholder="Agent Name"
          value={newAgentName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full mb-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15"
        />
        <textarea
          placeholder="Agent Context (what this agent does)..."
          value={newAgentContext}
          onChange={(e) => onContextChange(e.target.value)}
          className="w-full mb-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 resize-none"
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!newAgentName.trim() || !newAgentContext.trim()}
            className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 px-3 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Agent
          </button>
        </div>
      </div>
    </div>
  );
}
