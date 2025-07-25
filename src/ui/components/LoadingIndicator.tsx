interface LoadingIndicatorProps {
  isLoading: boolean;
}

export default function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"></div>
          <div
            className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
