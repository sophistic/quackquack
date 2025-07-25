export interface SettingsComponentProps {
  onBack: () => void;
}

export interface Agent {
  id: string;
  name: string;
  context: string;
  systemPrompt?: string;
}

export type SaveStatus = "idle" | "saving" | "saved";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatComponentProps {
  onBack: () => void;
}
