import { useConversations } from "./useMessages";

export const useUnreadCount = () => {
  const { data: conversations, isLoading } = useConversations();

  const unreadCount = conversations?.reduce((acc, conv) => {
    return acc + (conv.unread_count || 0);
  }, 0) || 0;

  return { unreadCount, isLoading };
};
