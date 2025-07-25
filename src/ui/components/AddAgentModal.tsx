import { useState } from "react";
import { Loader, Sparkles, AlertCircle } from "lucide-react";
import { AIService } from "../services/aiService";

interface AddAgentModalProps {
  isOpen: boolean;
  newAgentName: string;
  newAgentContext: string;
  onNameChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onClose: () => void;
  onCreateAgent: (name: string, context: string, systemPrompt?: string) => void;
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
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedSystemPrompt, setGeneratedSystemPrompt] = useState("");
  const [error, setError] = useState("");

  const handleGenerateSystemPrompt = async () => {
    if (!newAgentName.trim() || !newAgentContext.trim()) {
      setError(
        "Please enter both agent name and context before generating system prompt",
      );
      return;
    }

    setIsGeneratingPrompt(true);
    setError("");

    try {
      const aiService = await AIService.createInstance();

      if (!aiService) {
        throw new Error(
          "No AI provider available. Please configure an API key in Settings.",
        );
      }

      const systemPrompt = await aiService.generateSystemPrompt(
        newAgentName.trim(),
        newAgentContext.trim(),
      );

      setGeneratedSystemPrompt(systemPrompt);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate system prompt. Please try again.",
      );
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleCreate = () => {
    if (!newAgentName.trim() || !newAgentContext.trim()) {
      setError("Please enter both agent name and context");
      return;
    }

    onCreateAgent(
      newAgentName.trim(),
      newAgentContext.trim(),
      generatedSystemPrompt.trim() || undefined,
    );

    // Reset state
    setGeneratedSystemPrompt("");
    setError("");
  };

  const handleClose = () => {
    setGeneratedSystemPrompt("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  const canGenerate =
    newAgentName.trim() && newAgentContext.trim() && !isGeneratingPrompt;
  const canCreate = newAgentName.trim() && newAgentContext.trim();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-black/80 border border-white/20 rounded-xl p-5 w-[480px] max-h-[80vh] overflow-y-auto scrollbar-hide">
        <h3 className="text-white text-sm font-semibold mb-3">Add New Agent</h3>

        {/* Agent Name */}
        <input
          type="text"
          placeholder="Agent Name"
          value={newAgentName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full mb-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15"
        />

        {/* Agent Context */}
        <textarea
          placeholder="Agent Context (what this agent does)..."
          value={newAgentContext}
          onChange={(e) => onContextChange(e.target.value)}
          className="w-full mb-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 resize-none"
          rows={3}
        />

        {/* Generate System Prompt Button */}
        <div className="mb-3">
          <button
            onClick={handleGenerateSystemPrompt}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-2 backdrop-blur-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 px-3 py-2 rounded-lg text-white text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingPrompt ? (
              <>
                <Loader size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate System Prompt with AI
              </>
            )}
          </button>
          {!isGeneratingPrompt && (
            <p className="text-xs text-white/50 mt-1 text-center">
              Using{" "}
              {AIService.getSelectedProvider()?.toUpperCase() || "selected"}{" "}
              provider
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center gap-2">
            <AlertCircle size={14} className="text-red-400" />
            <span className="text-red-300 text-xs">{error}</span>
          </div>
        )}

        {/* Generated System Prompt */}
        {generatedSystemPrompt && (
          <div className="mb-3">
            <label className="block text-white/70 text-xs mb-1">
              Generated System Prompt
            </label>
            <textarea
              value={generatedSystemPrompt}
              onChange={(e) => setGeneratedSystemPrompt(e.target.value)}
              className="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 resize-none"
              rows={6}
              placeholder="System prompt will appear here..."
            />
            <p className="text-xs text-white/50 mt-1">
              You can edit the generated prompt above before creating the agent.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 px-3 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Agent
          </button>
        </div>
      </div>
    </div>
  );
}
