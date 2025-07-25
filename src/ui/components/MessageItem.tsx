import type { Message } from "./types";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
          message.role === "user"
            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/20 text-white"
            : "bg-white/10 border border-white/10 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="text-[10px] text-white/40 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
