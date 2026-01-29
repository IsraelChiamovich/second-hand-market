import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const NotificationManager = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Request permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const channel = supabase
      .channel("global-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Ignore own messages
          if (newMessage.sender_id === user.id) return;

          // Check if message belongs to a conversation where user is a participant
          const { data: conversation } = await supabase
            .from("conversations")
            .select("buyer_id, seller_id, products(title)")
            .eq("id", newMessage.conversation_id)
            .single();

          if (conversation && (conversation.buyer_id === user.id || conversation.seller_id === user.id)) {
             // Don't notify if window is focused and we are on the same thread?
             // For now, simplicity: always notify.
             
             if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`הודעה חדשה: ${conversation.products?.title || "מוצר"}`, {
                  body: newMessage.content,
                  // icon: "/favicon.ico" 
                });
             } else {
                // Also show a toast inside the app
                toast.info(`הודעה חדשה: ${newMessage.content}`);
             }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
};
