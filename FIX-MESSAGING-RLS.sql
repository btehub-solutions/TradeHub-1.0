-- Fix for RLS Policy Error
-- Run this in Supabase SQL Editor to fix the conversation creation issue

-- Drop and recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID
)
RETURNS UUID 
SECURITY DEFINER  -- This allows the function to bypass RLS
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
