-- ============================================================================
-- TradeHub Enhancement Migration - Phase 3: Favorites/Wishlist System
-- ============================================================================
-- This migration adds favorites functionality for users to save listings
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- STEP 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_listing ON favorites(user_id, listing_id);

-- STEP 3: Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create RLS Policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove their favorites" ON favorites;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can add favorites
CREATE POLICY "Users can add favorites" ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can remove their own favorites
CREATE POLICY "Users can remove their favorites" ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- STEP 5: Create function to get favorite count for a listing
CREATE OR REPLACE FUNCTION get_favorite_count(listing_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM favorites
    WHERE listing_id = listing_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- STEP 6: Create function to check if user favorited a listing
CREATE OR REPLACE FUNCTION is_favorited(listing_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM favorites
    WHERE listing_id = listing_uuid
    AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- STEP 7: Create function to get user's favorites with listing details
CREATE OR REPLACE FUNCTION get_user_favorites(user_uuid UUID)
RETURNS TABLE (
  favorite_id UUID,
  listing_id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  location TEXT,
  seller_name TEXT,
  seller_phone TEXT,
  image_url TEXT,
  images JSONB,
  category TEXT,
  status TEXT,
  user_id UUID,
  created_at TIMESTAMP,
  favorited_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as favorite_id,
    l.id as listing_id,
    l.title,
    l.description,
    l.price,
    l.location,
    l.seller_name,
    l.seller_phone,
    l.image_url,
    l.images,
    l.category,
    l.status,
    l.user_id,
    l.created_at,
    f.created_at as favorited_at
  FROM favorites f
  INNER JOIN listings l ON f.listing_id = l.id
  WHERE f.user_id = user_uuid
  AND l.status = 'available'
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- STEP 8: Create view for favorite statistics
CREATE OR REPLACE VIEW favorite_stats AS
SELECT 
  listing_id,
  COUNT(*) as favorite_count,
  MAX(created_at) as last_favorited_at
FROM favorites
GROUP BY listing_id;

-- Create index on view
CREATE INDEX IF NOT EXISTS idx_favorite_stats_listing 
ON favorites(listing_id, created_at DESC);

-- STEP 9: Add helpful comments
COMMENT ON TABLE favorites IS 'Stores user favorites/wishlist items';
COMMENT ON COLUMN favorites.user_id IS 'User who favorited the listing';
COMMENT ON COLUMN favorites.listing_id IS 'The favorited listing';
COMMENT ON COLUMN favorites.created_at IS 'When the listing was favorited';

-- STEP 10: Create trigger to prevent favoriting own listings (optional)
CREATE OR REPLACE FUNCTION prevent_self_favorite()
RETURNS TRIGGER AS $$
DECLARE
  listing_owner UUID;
BEGIN
  SELECT user_id INTO listing_owner
  FROM listings
  WHERE id = NEW.listing_id;
  
  IF listing_owner = NEW.user_id THEN
    RAISE EXCEPTION 'Cannot favorite your own listing';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_self_favorite ON favorites;
CREATE TRIGGER check_self_favorite
  BEFORE INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_favorite();

-- STEP 11: Verification queries
-- Check if table was created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'favorites';

-- Check RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'favorites';

-- Test functions
SELECT get_favorite_count('00000000-0000-0000-0000-000000000000'::UUID);

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Next steps:
-- 1. Test adding favorites via API
-- 2. Verify RLS policies work correctly
-- 3. Check that users can't favorite their own listings
-- ============================================================================
