-- ============================================================================
-- TradeHub Enhancement Migration - Phase 5: Analytics Dashboard
-- ============================================================================
-- This migration adds analytics tracking for listings and user performance
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create listing_views table to track individual views
CREATE TABLE IF NOT EXISTS listing_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash TEXT, -- Anonymized IP for unique view counting
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- STEP 2: Create daily_listing_stats table for aggregated data (faster querying)
CREATE TABLE IF NOT EXISTS daily_listing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  view_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  UNIQUE(listing_id, date)
);

-- STEP 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_created_at ON listing_views(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_listing_date ON daily_listing_stats(listing_id, date);

-- STEP 4: Enable RLS
ALTER TABLE listing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_listing_stats ENABLE ROW LEVEL SECURITY;

-- STEP 5: RLS Policies
-- Only listing owners can see their analytics
CREATE POLICY "Users can view analytics for own listings" ON listing_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_views.listing_id 
      AND user_id = auth.uid()
    )
  );

-- Anyone can insert views (public tracking)
CREATE POLICY "Anyone can insert views" ON listing_views
  FOR INSERT WITH CHECK (true);

-- Owners can view aggregated stats
CREATE POLICY "Users can view stats for own listings" ON daily_listing_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = daily_listing_stats.listing_id 
      AND user_id = auth.uid()
    )
  );

-- STEP 6: Function to record a view
CREATE OR REPLACE FUNCTION record_listing_view(
  p_listing_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Insert individual view record
  INSERT INTO listing_views (listing_id, viewer_id, ip_hash, user_agent)
  VALUES (p_listing_id, p_viewer_id, p_ip_hash, p_user_agent);

  -- Update daily stats
  INSERT INTO daily_listing_stats (listing_id, date, view_count)
  VALUES (p_listing_id, v_today, 1)
  ON CONFLICT (listing_id, date) 
  DO UPDATE SET view_count = daily_listing_stats.view_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 7: Function to get seller analytics
CREATE OR REPLACE FUNCTION get_seller_analytics(p_seller_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  total_views BIGINT,
  total_favorites BIGINT,
  total_messages BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.date,
    SUM(d.view_count)::BIGINT as total_views,
    SUM(d.favorite_count)::BIGINT as total_favorites,
    SUM(d.message_count)::BIGINT as total_messages
  FROM daily_listing_stats d
  JOIN listings l ON d.listing_id = l.id
  WHERE l.user_id = p_seller_id
  AND d.date >= CURRENT_DATE - p_days
  GROUP BY d.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- STEP 8: Trigger to update favorite counts in daily stats
CREATE OR REPLACE FUNCTION trigger_update_favorite_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_listing_id UUID;
  v_change INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_listing_id := NEW.listing_id;
    v_change := 1;
  ELSIF TG_OP = 'DELETE' THEN
    v_listing_id := OLD.listing_id;
    v_change := -1;
  END IF;

  INSERT INTO daily_listing_stats (listing_id, date, favorite_count)
  VALUES (v_listing_id, CURRENT_DATE, GREATEST(0, v_change))
  ON CONFLICT (listing_id, date) 
  DO UPDATE SET favorite_count = GREATEST(0, daily_listing_stats.favorite_count + v_change);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_fav_stats ON favorites;
CREATE TRIGGER update_fav_stats
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_favorite_stats();

-- STEP 9: Verification
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('listing_views', 'daily_listing_stats');

-- ============================================================================
-- Migration Complete!
-- ============================================================================
