-- Complete Fix for Messaging RLS Issues
-- Run this in Supabase SQL Editor

-- 1. Update the get_or_create_conversation function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID
)
RETURNS UUID 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM conversations
  WHERE listing_id = p_listing_id
  AND buyer_id = p_buyer_id
  AND seller_id = p_seller_id;

  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (listing_id, buyer_id, seller_id)
    VALUES (p_listing_id, p_buyer_id, p_seller_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Fix the messages RLS policy to be less restrictive for new conversations
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      -- Allow if conversation exists and user is part of it
      EXISTS (
        SELECT 1 FROM conversations
        WHERE id = messages.conversation_id
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
      )
      -- OR if this is a new conversation being created
      OR NOT EXISTS (
        SELECT 1 FROM messages
        WHERE conversation_id = messages.conversation_id
      )
    )
  );

-- 3. Alternative: Create a helper function to send the first message
CREATE OR REPLACE FUNCTION send_first_message(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID,
  p_sender_id UUID,
  p_content TEXT
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_message_id UUID;
BEGIN
  -- Get or create conversation
  v_conversation_id := get_or_create_conversation(p_listing_id, p_buyer_id, p_seller_id);
  
  -- Insert message
  INSERT INTO messages (conversation_id, sender_id, content)
  VALUES (v_conversation_id, p_sender_id, p_content)
  RETURNING id INTO v_message_id;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;
