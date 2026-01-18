import { cn } from "@/lib/utils";
import { Package, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import type { ConversationWithDetails } from "@/types/database";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
  selectedId?: string;
  onSelect: (conversation: ConversationWithDetails) => void;
  isLoading?: boolean;
}

const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">אין שיחות</h3>
        <p className="text-sm text-muted-foreground">
          כשתתחילו שיחה עם מוכר, היא תופיע כאן
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => {
        const otherProfile = conv.buyer_profile || conv.seller_profile;
        const otherName = otherProfile?.full_name || "משתמש";
        const hasUnread = conv.unread_count && conv.unread_count > 0;

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              "w-full p-4 text-right hover:bg-muted/50 transition-colors flex gap-3",
              selectedId === conv.id && "bg-muted"
            )}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
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

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={cn("font-semibold truncate", hasUnread && "text-primary")}>
                  {otherName}
                </span>
                {conv.last_message_at && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(conv.last_message_at), {
                      addSuffix: true,
                      locale: he,
                    })}
                  </span>
                )}
              </div>
              
              {conv.products && (
                <p className="text-sm text-muted-foreground truncate mb-1">
                  {conv.products.title}
                </p>
              )}
              
              {conv.last_message && (
                <p
                  className={cn(
                    "text-sm truncate",
                    hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {conv.last_message.content}
                </p>
              )}
            </div>

            {/* Unread badge */}
            {hasUnread && (
              <div className="flex items-center">
                <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {conv.unread_count}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationList;
