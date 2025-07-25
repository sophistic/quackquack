import { Key } from "lucide-react";

interface ApiKeysSectionProps {
  geminiKey: string;
  openaiKey: string;
  claudeKey: string;
  onGeminiKeyChange: (value: string) => void;
  onOpenaiKeyChange: (value: string) => void;
  onClaudeKeyChange: (value: string) => void;
}

export default function ApiKeysSection({
  geminiKey,
  openaiKey,
  claudeKey,
  onGeminiKeyChange,
  onOpenaiKeyChange,
  onClaudeKeyChange,
}: ApiKeysSectionProps) {
  return (
    <div className="space-y-4 no-drag">
      <h3 className="text-white/80 text-sm font-semibold">API Keys</h3>

      {/* Gemini */}
      <div className="space-y-1">
        <label className="block text-white/70 text-xs flex items-center gap-1">
          <Key size={14} /> Gemini API Key
        </label>
        <input
          type="password"
          value={geminiKey}
          onChange={(e) => onGeminiKeyChange(e.target.value)}
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
          onChange={(e) => onOpenaiKeyChange(e.target.value)}
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
          onChange={(e) => onClaudeKeyChange(e.target.value)}
          placeholder="Enter your Claude API key..."
          className="w-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-all duration-200"
        />
      </div>
    </div>
  );
}
