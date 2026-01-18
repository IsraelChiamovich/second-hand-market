import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Send, Loader2, Package } from "lucide-react";
import { useMessages, useSendMessage, useMarkAsRead } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import MessageBubble from "./MessageBubble";
import type { ConversationWithDetails } from "@/types/database";

interface ChatWindowProps {
  conversation: ConversationWithDetails;
  onBack?: () => void;
}

const ChatWindow = ({ conversation, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMessages(conversation.id);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (conversation.id && conversation.unread_count && conversation.unread_count > 0) {
      markAsRead.mutate(conversation.id);
    }
  }, [conversation.id, conversation.unread_count]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get the other user's profile
  const otherProfile = conversation.buyer_profile || conversation.seller_profile;
  const otherName = otherProfile?.full_name || "משתמש";

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
            <ArrowRight className="h-5 w-5" />
          </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          {otherProfile?.avatar_url ? (
            <img
              src={otherProfile.avatar_url}
              alt={otherName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              {otherName.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{otherName}</h3>
          {conversation.products && (
            <p className="text-sm text-muted-foreground truncate">
              {conversation.products.title}
            </p>
          )}
        </div>
      </div>

      {/* Product Card (if exists) */}
      {conversation.products && (
        <div className="p-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
              {conversation.products.images?.[0] ? (
                <img
                  src={conversation.products.images[0]}
                  alt={conversation.products.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{conversation.products.title}</p>
              <p className="text-sm text-primary font-bold">
                {formatPrice(conversation.products.price)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>אין הודעות עדיין</p>
            <p className="text-sm">שלחו הודעה ראשונה!</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="כתבו הודעה..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sendMessage.isPending}
            size="icon"
          >
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
