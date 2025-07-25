"use client";

import { MessageCircle, Settings } from "lucide-react";

export default function OverlayBar({
  onChatClick,
  onSettingsClick,
}: {
  onChatClick: () => void;
  onSettingsClick: () => void;
}) {
  return (
    <div className=" drag flex items-center justify-around gap-4 p-4">
      {/* Left side title */}

      <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
        Quackkk
      </h1>
      <div className="flex gap-4">
        <div
          onClick={onChatClick}
          className="cursor-pointer group relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 hover:border-green-400/50 p-2 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
        >
          <div className="no-drag flex items-center gap-2">
            <MessageCircle size={18} />
            <span>Chat</span>
          </div>
        </div>
        <div
          className="no-drag cursor-pointer group relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 hover:border-blue-400/50 p-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          onClick={onSettingsClick}
        >
          <Settings size={18} />
        </div>
      </div>
    </div>
  );
}
