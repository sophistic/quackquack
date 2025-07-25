import { ChevronDown } from "lucide-react";

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
  { id: "gemini-pro", name: "Gemini Pro", provider: "gemini" },
  { id: "claude-3", name: "Claude 3", provider: "claude" },
];

export default function ModelSelector({
  selectedModel,
  showDropdown,
  onToggleDropdown,
  onSelectModel,
}: ModelSelectorProps) {
  const handleSelectModel = (modelId: string) => {
    onSelectModel(modelId);
    onToggleDropdown();
  };

  return (
    <div className="relative">
      <button
        onClick={onToggleDropdown}
        className="no-drag backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-white text-xs transition-all duration-200 flex items-center gap-1"
      >
        <span className="truncate max-w-[100px]">
          {models.find((m) => m.id === selectedModel)?.name}
        </span>
        <ChevronDown size={14} />
      </button>

      {showDropdown && (
        <div className="no-drag absolute top-full right-0 mt-1 backdrop-blur-xl bg-black/80 border border-white/20 rounded-lg shadow-xl z-10 min-w-40">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className="w-full text-left px-3 py-2 text-white text-xs hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-all duration-150"
            >
              {model.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
