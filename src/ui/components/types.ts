export interface SettingsComponentProps {
  onBack: () => void;
}

export interface Agent {
  id: string;
  name: string;
  context: string;
}

export type SaveStatus = "idle" | "saving" | "saved";
