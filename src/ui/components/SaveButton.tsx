import type { SaveStatus } from "./types";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  saveStatus: SaveStatus;
  onSave: () => void;
}

export default function SaveButton({ saveStatus, onSave }: SaveButtonProps) {
  return (
    <div className="mt-5 no-drag">
      <Button
        onClick={onSave}
        disabled={saveStatus === "saving"}
        className="w-full bg-primary text-primary-foreground border border-border px-4 py-3 rounded-md text-sm font-medium font-inter transition-all duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saveStatus === "saving"
          ? "Saving..."
          : saveStatus === "saved"
            ? "Saved!"
            : "Save"}
      </Button>
    </div>
  );
}
