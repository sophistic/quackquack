import type { SaveStatus } from "./types";

interface SaveButtonProps {
  saveStatus: SaveStatus;
  onSave: () => void;
}

export default function SaveButton({ saveStatus, onSave }: SaveButtonProps) {
  return (
    <div className="mt-5 no-drag">
      <button
        onClick={onSave}
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
  );
}
