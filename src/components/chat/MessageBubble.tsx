import { cn } from "@/lib/utils";
import type { Message } from "@/types/database";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  return (
    <div
      className={cn(
        "flex w-full",
        isOwn ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
          isOwn
            ? "bg-primary text-primary-foreground rounded-bl-md"
            : "bg-muted text-foreground rounded-br-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <span
          className={cn(
            "text-xs mt-1 block",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {format(new Date(message.created_at), "HH:mm", { locale: he })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
