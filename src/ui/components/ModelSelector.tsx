import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface Model {
  id: string;
  name: string;
  provider: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  showDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectModel: (modelId: string) => void;
}

const models: Model[] = [
  { id: "openai-gpt4", name: "OpenAI GPT-4", provider: "openai" },
  { id: "openai-gpt35", name: "OpenAI GPT-3.5", provider: "openai" },
  { id: "gemini", name: "gemini-2.5-flash-live", provider: "gemini" },
  { id: "claude-3", name: "Claude 3", provider: "claude" },
];

export default function ModelSelector({
  selectedModel,
  showDropdown,
  onToggleDropdown,
  onSelectModel,
}: ModelSelectorProps) {
  const [availableProviders, setAvailableProviders] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    // Check which providers have valid API keys
    const checkApiKeys = () => {
      const available = new Set<string>();

      const geminiKey = localStorage.getItem("gemini_api_key");
      const openaiKey = localStorage.getItem("openai_api_key");
      const claudeKey = localStorage.getItem("claude_api_key");

      if (geminiKey && geminiKey.trim() !== "") {
        available.add("gemini");
      }
      if (openaiKey && openaiKey.trim() !== "") {
        available.add("openai");
      }
      if (claudeKey && claudeKey.trim() !== "") {
        available.add("claude");
      }

      setAvailableProviders(available);
    };

    checkApiKeys();

    // Listen for storage changes to update availability in real-time
    const handleStorageChange = () => {
      checkApiKeys();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case localStorage changes within the same tab
    const interval = setInterval(checkApiKeys, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleSelectModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model || !availableProviders.has(model.provider)) {
      return; // Don't allow selection of unavailable models
    }

    // Store the selected provider in localStorage
    localStorage.setItem("selected_provider", model.provider);

    onSelectModel(modelId);
    onToggleDropdown();
  };

  const isModelAvailable = (model: Model) => {
    return availableProviders.has(model.provider);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggleDropdown}
        className={`no-drag backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs transition-all duration-200 flex items-center gap-1 ${(() => {
          const currentModel = models.find((m) => m.id === selectedModel);
          const isCurrentAvailable =
            currentModel && isModelAvailable(currentModel);
          return isCurrentAvailable
            ? "bg-white/10 hover:bg-white/20 border border-white/20 text-white"
            : "bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-red-200";
        })()}`}
        title={(() => {
          const currentModel = models.find((m) => m.id === selectedModel);
          const isCurrentAvailable =
            currentModel && isModelAvailable(currentModel);
          return !isCurrentAvailable
            ? `${currentModel?.provider.toUpperCase() || "Selected"} API key required`
            : "";
        })()}
      >
        <div className="flex items-center gap-1">
          <span className="truncate max-w-[100px]">
            {models.find((m) => m.id === selectedModel)?.name}
          </span>
          {(() => {
            const currentModel = models.find((m) => m.id === selectedModel);
            const isCurrentAvailable =
              currentModel && isModelAvailable(currentModel);
            return (
              !isCurrentAvailable && (
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              )
            );
          })()}
        </div>
        <ChevronDown size={14} />
      </button>

      {showDropdown && (
        <div className="no-drag absolute top-full right-0 mt-1 backdrop-blur-xl bg-black/80 border border-white/20 rounded-lg shadow-xl z-10 min-w-40">
          {models.map((model) => {
            const isAvailable = isModelAvailable(model);
            return (
              <button
                key={model.id}
                onClick={() => handleSelectModel(model.id)}
                disabled={!isAvailable}
                className={`w-full text-left px-3 py-2 text-xs first:rounded-t-lg last:rounded-b-lg transition-all duration-150 ${
                  isAvailable
                    ? "text-white hover:bg-white/10 cursor-pointer"
                    : "text-white/30 cursor-not-allowed bg-white/5"
                }`}
                title={
                  !isAvailable
                    ? `${model.provider.toUpperCase()} API key required. Add it in Settings.`
                    : ""
                }
              >
                <div className="flex items-center justify-between">
                  <span>{model.name}</span>
                  {!isAvailable && (
                    <span className="text-red-400/60 text-[10px]">
                      No API Key
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
