"use client";

import { MessageCircle, Settings } from "lucide-react";

export default function OverlayBar() {
  return (
    <div
      className="flex items-center justify-center  gap-4 "
      style={{ WebkitAppRegion: "no-drag" }}
    >
      {/* Left side title */}
      <div className="flex">
        <h1 className="text-md font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Quackkk
        </h1>
      </div>

      <div
        // onClick={onChatClick}
        className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-400/30 hover:border-green-400/50 p-2 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={18} />
          <span>Chat</span>
        </div>
      </div>

      <div
        // onClick={onSettingsClick}
        className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30 hover:border-blue-400/50 p-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
      >
        <Settings size={18} />
      </div>
    </div>
  );
}
