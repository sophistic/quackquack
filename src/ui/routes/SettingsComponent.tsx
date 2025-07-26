import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type {
  SettingsComponentProps,
  Agent,
  SaveStatus,
} from "../components/types";
import ApiKeysSection from "../components/ApiKeysSection";
import AgentsSection from "../components/AgentsSection";
import AddAgentModal from "../components/AddAgentModal";
import SaveButton from "../components/SaveButton";

export default function SettingsComponent({ onBack }: SettingsComponentProps) {
  const [geminiKey, setGeminiKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [claudeKey, setClaudeKey] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

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
        systemPrompt:
          "You are a helpful assistant that assists users with general tasks. Be friendly, professional, and provide clear, actionable responses.",
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
  const createAgent = (
    name: string,
    context: string,
    systemPrompt?: string,
  ) => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name,
      context,
      systemPrompt,
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
    <div className="drag bg-card border-2 border-primary/20 rounded-md font-inter shadow-lg  max-h-[520px] flex flex-col p-6">
      {/* Header */}
      <div className="no-drag flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="bg-accent/30 hover:bg-accent/50 border border-border p-2 rounded-md text-foreground transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Settings</h2>
      </div>

      {/* Scrollable Content */}
      <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide pr-1">
        {/* API Keys Section */}
        <ApiKeysSection
          geminiKey={geminiKey}
          openaiKey={openaiKey}
          claudeKey={claudeKey}
          onGeminiKeyChange={setGeminiKey}
          onOpenaiKeyChange={setOpenaiKey}
          onClaudeKeyChange={setClaudeKey}
        />

        {/* Agents Section */}
        <AgentsSection
          agents={agents}
          onAddAgent={() => setShowAgentModal(true)}
          onDeleteAgent={deleteAgent}
        />
      </div>

      {/* Save Button */}
      <SaveButton saveStatus={saveStatus} onSave={handleSave} />

      {/* Add Agent Modal */}
      <AddAgentModal
        isOpen={showAgentModal}
        newAgentName={newAgentName}
        newAgentContext={newAgentContext}
        onNameChange={setNewAgentName}
        onContextChange={setNewAgentContext}
        onClose={() => setShowAgentModal(false)}
        onCreateAgent={createAgent}
      />
    </div>
  );
}
