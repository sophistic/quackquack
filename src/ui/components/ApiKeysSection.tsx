import { Key } from "lucide-react";
import { Input } from "@/components/ui/input";

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
        <label className="flex text-white/70 text-xs items-center gap-1">
          <Key size={14} /> Gemini API Key
        </label>
        <Input
          type="password"
          value={geminiKey}
          onChange={(e) => onGeminiKeyChange(e.target.value)}
          placeholder="Enter your Gemini API key..."
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-all duration-200 font-inter"
        />
      </div>

      {/* OpenAI */}
      <div className="space-y-1">
        <label className="flex text-white/70 text-xs items-center gap-1">
          <Key size={14} /> OpenAI API Key
        </label>
        <Input
          type="password"
          value={openaiKey}
          onChange={(e) => onOpenaiKeyChange(e.target.value)}
          placeholder="Enter your OpenAI API key..."
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-all duration-200 font-inter"
        />
      </div>

      {/* Claude */}
      <div className="space-y-1">
        <label className="flex text-white/70 text-xs items-center gap-1">
          <Key size={14} /> Claude API Key
        </label>
        <Input
          type="password"
          value={claudeKey}
          onChange={(e) => onClaudeKeyChange(e.target.value)}
          placeholder="Enter your Claude API key..."
          className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:bg-card transition-all duration-200 font-inter"
        />
      </div>
    </div>
  );
}
