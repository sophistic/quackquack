import type { Message } from "./types";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} font-inter`}>
      <Card className={`max-w-[80%] px-3 py-2 rounded-md border border-border bg-card ${isUser ? "ml-auto" : "mr-auto"}`}>
        <p className="whitespace-pre-wrap text-foreground text-sm">{message.content}</p>
        <Separator className="my-1" />
        <p className="text-[10px] text-muted-foreground mt-1 text-right">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </Card>
    </div>
  );
}
