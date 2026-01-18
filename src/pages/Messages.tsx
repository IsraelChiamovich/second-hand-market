import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useMessages";
import { ChatWindow, ConversationList } from "@/components/chat";
import type { ConversationWithDetails } from "@/types/database";

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { data: conversations, isLoading: conversationsLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);

  // Select conversation from URL param
  useEffect(() => {
    const conversationId = searchParams.get("conversation");
    if (conversationId && conversations) {
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center py-12">
          <Card className="w-full max-w-md mx-4 text-center">
            <CardHeader>
              <CardTitle>יש להתחבר</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                כדי לצפות בהודעות יש להתחבר לחשבון
              </p>
              <Button onClick={() => navigate("/login")}>התחברות</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 md:py-8">
        <div className="container-main">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">הודעות</h1>

          <Card className="overflow-hidden">
            <div className="flex h-[calc(100vh-250px)] min-h-[500px]">
              {/* Conversations List */}
              <div
                className={`w-full md:w-80 lg:w-96 border-l border-border flex-shrink-0 overflow-y-auto ${
                  selectedConversation ? "hidden md:block" : ""
                }`}
              >
                <ConversationList
                  conversations={conversations || []}
                  selectedId={selectedConversation?.id}
                  onSelect={setSelectedConversation}
                  isLoading={conversationsLoading}
                />
              </div>

              {/* Chat Window */}
              <div
                className={`flex-1 ${
                  selectedConversation ? "" : "hidden md:flex"
                }`}
              >
                {selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    onBack={() => setSelectedConversation(null)}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                    <MessageSquare className="h-16 w-16 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">בחרו שיחה</h3>
                    <p className="text-center">
                      בחרו שיחה מהרשימה כדי להתחיל לשוחח
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
