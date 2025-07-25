import { forwardRef } from "react";
import type { Message } from "./types";
import MessageItem from "./MessageItem";
import LoadingIndicator from "./LoadingIndicator";

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, isLoading }, ref) => {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide no-drag">
        {messages.length === 0 ? (
          <div className="text-center text-white/60 mt-10 text-sm">
            Start a conversation with your AI assistant!
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))
        )}

        <LoadingIndicator isLoading={isLoading} />

        <div ref={ref} />
      </div>
    );
  },
);

MessagesList.displayName = "MessagesList";

export default MessagesList;
