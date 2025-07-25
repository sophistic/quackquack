"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Key, Bot, Trash2, Plus } from "lucide-react";

interface SettingsComponentProps {
  onBack: () => void;
}

interface Agent {
  id: string;
  name: string;
  context: string;
}

export default function SettingsComponent({ onBack }: SettingsComponentProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentContext, setNewAgentContext] = useState("");

  // ✅ Load stored keys and agents
  useEffect(() => {
    setGeminiKey(localStorage.getItem("gemini_api_key") || "");
    setOpenaiKey(localStorage.getItem("openai_api_key") || "");
    setClaudeKey(localStorage.getItem("claude_api_key") || "");

    const storedAgents = JSON.parse(localStorage.getItem("agents") || "[]");
    if (storedAgents.length === 0) {
      const dummyAgent: Agent = {
        id: Date.now().toString(),
        name: "Helper Bot",
        context: "Assists users with general tasks.",
      };
      localStorage.setItem("agents", JSON.stringify([dummyAgent]));
      setAgents([dummyAgent]);
    } else {
      setAgents(storedAgents);
    }
  }, []);

  // ✅ Save API keys
  const handleSave = () => {
    setSaveStatus("saving");
    localStorage.setItem("gemini_api_key", geminiKey);
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("claude_api_key", claudeKey);

    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 500);
  };

  // ✅ Create agent
  const createAgent = (name: string, context: string) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name,
      context,
    };
    const updatedAgents = [...agents, newAgent];
    setAgents(updatedAgents);
    localStorage.setItem("agents", JSON.stringify(updatedAgents));
    setShowAgentModal(false);
    setNewAgentName("");
    setNewAgentContext("");
  };

  // ✅ Delete agent
  const deleteAgent = (id: string) => {
    const updatedAgents = agents.filter((agent) => agent.id !== id);
    setAgents(updatedAgents);
    localStorage.setItem("agents", JSON.stringify(updatedAgents));
  };

  return (
    <div
      className="backdrop-blur-xl bg-black/70 rounded-xl shadow-xl w-[480px] max-h-[520px] flex flex-col p-6"
      style={{ WebkitAppRegion: "drag" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          style={{ WebkitAppRegion: "no-drag" }}
          className="backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 p-2 rounded-lg text-white transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Settings
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide pr-1">
        {/* ✅ API KEYS SECTION */}
        <div className="space-y-4" style={{ WebkitAppRegion: "no-drag" }}>
          <h3 className="text-white/80 text-sm font-semibold">API Keys</h3>

          {/* Gemini */}
          <div className="space-y-1">
            <label className="block text-white/70 text-xs flex items-center gap-1">
              <Key size={14} /> Gemini API Key
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 transition-all duration-200"
            />
          </div>

          {/* OpenAI */}
          <div className="space-y-1">
            <label className="block text-white/70 text-xs flex items-center gap-1">
              <Key size={14} /> OpenAI API Key
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="Enter your OpenAI API key..."
              className="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-green-400/50 focus:bg-white/15 transition-all duration-200"
            />
          </div>

          {/* Claude */}
          <div className="space-y-1">
            <label className="block text-white/70 text-xs flex items-center gap-1">
              <Key size={14} /> Claude API Key
            </label>
            <input
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
              placeholder="Enter your Claude API key..."
              className="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-200"
            />
          </div>
        </div>

        {/* ✅ AGENTS SECTION */}
        <div className="space-y-3" style={{ WebkitAppRegion: "no-drag" }}>
          <div className="flex items-center justify-between">
            <h3 className="text-white/80 text-sm font-semibold flex items-center gap-1">
              <Bot size={14} /> Agents
            </h3>
            <button
              onClick={() => setShowAgentModal(true)}
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
                <div
                  key={agent.id}
                  className="flex justify-between items-start p-3 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-white/60">{agent.context}</p>
                  </div>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ SAVE BUTTON */}
      <div className="mt-5" style={{ WebkitAppRegion: "no-drag" }}>
        <button
          onClick={handleSave}
          disabled={saveStatus === "saving"}
          className="w-full backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
              ? "Saved!"
              : "Save"}
        </button>
      </div>

      {/* ✅ ADD AGENT MODAL */}
      {showAgentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-black/80 border border-white/20 rounded-xl p-5 w-[360px]">
            <h3 className="text-white text-sm font-semibold mb-3">
              Add New Agent
            </h3>
            <input
              type="text"
              placeholder="Agent Name"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="w-full mb-2 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15"
            />
            <textarea
              placeholder="Agent Context (what this agent does)..."
              value={newAgentContext}
              onChange={(e) => setNewAgentContext(e.target.value)}
              className="w-full mb-3 backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-purple-400/50 focus:bg-white/15 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAgentModal(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  createAgent(newAgentName.trim(), newAgentContext.trim())
                }
                disabled={!newAgentName.trim() || !newAgentContext.trim()}
                className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-purple-400/30 px-3 py-1.5 rounded-lg text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
