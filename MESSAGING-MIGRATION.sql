-- ============================================================================
-- TradeHub Messaging System Migration
-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy ALL text in this file (Ctrl+A, Ctrl+C)
-- 2. Paste into Supabase SQL Editor (Ctrl+V)
-- 3. Click "Run"
-- 4. Go to Database → Replication and enable Realtime for 'messages' table
-- ============================================================================

-- ============================================================================
-- STEP 1: Create conversations table
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id, seller_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);

-- Add comments
COMMENT ON TABLE conversations IS 'Tracks conversations between buyers and sellers for specific listings';
COMMENT ON COLUMN conversations.listing_id IS 'The listing being discussed';
COMMENT ON COLUMN conversations.buyer_id IS 'User who initiated the conversation (buyer)';
COMMENT ON COLUMN conversations.seller_id IS 'User who owns the listing (seller)';
COMMENT ON COLUMN conversations.updated_at IS 'Last message timestamp for sorting';

-- ============================================================================
-- STEP 2: Create messages table
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read) WHERE read = FALSE;

-- Add comments
COMMENT ON TABLE messages IS 'Individual messages within conversations';
COMMENT ON COLUMN messages.conversation_id IS 'The conversation this message belongs to';
COMMENT ON COLUMN messages.sender_id IS 'User who sent the message';
COMMENT ON COLUMN messages.content IS 'Message text content';
COMMENT ON COLUMN messages.read IS 'Whether the message has been read by the recipient';

-- ============================================================================
-- STEP 3: Enable Row Level Security
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies for conversations
-- ============================================================================

-- Users can view conversations they're part of
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Users can create conversations (buyer initiating)
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Users can update conversations they're part of (for updated_at)
DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations" ON conversations
  FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- ============================================================================
-- STEP 5: Create RLS Policies for messages
-- ============================================================================

-- Users can view messages in their conversations
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Users can send messages in their conversations
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- Users can update messages they received (mark as read)
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
CREATE POLICY "Users can mark messages as read" ON messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (
        (buyer_id = auth.uid() AND sender_id != auth.uid()) OR
        (seller_id = auth.uid() AND sender_id != auth.uid())
      )
    )
  );

-- ============================================================================
-- STEP 6: Create trigger to update conversation timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- ============================================================================
-- STEP 7: Create helper functions
-- ============================================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM messages m
    INNER JOIN conversations c ON m.conversation_id = c.id
    WHERE m.read = FALSE
    AND m.sender_id != user_uuid
    AND (c.buyer_id = user_uuid OR c.seller_id = user_uuid)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get or create a conversation
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_seller_id UUID
)
RETURNS UUID AS $$
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

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Go to Supabase Dashboard → Database → Replication
-- 2. Enable Realtime for the 'messages' table
-- 3. Click 'Save' to apply changes
-- ============================================================================
