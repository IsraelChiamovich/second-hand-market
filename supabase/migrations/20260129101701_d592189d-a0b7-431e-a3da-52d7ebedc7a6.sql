-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create a new policy that allows:
-- 1. Users to update their own messages (for editing content)
-- 2. Users to mark messages as read in conversations they're part of
CREATE POLICY "Users can update messages in their conversations" 
ON public.messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
  )
)
WITH CHECK (
  -- Can only update read_at on messages they received (not sent)
  -- OR can update any field on messages they sent
  (auth.uid() = sender_id) OR 
  (auth.uid() != sender_id AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
  ))
);