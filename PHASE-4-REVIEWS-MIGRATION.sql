-- ============================================================================
-- TradeHub Enhancement Migration - Phase 4: User Ratings & Reviews
-- ============================================================================
-- This migration adds review and rating functionality for sellers
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(listing_id, reviewer_id)
);

-- STEP 2: Create user_stats table for aggregated statistics
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  member_since TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- STEP 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- STEP 4: Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create RLS Policies for reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" ON reviews
  FOR DELETE USING (auth.uid() = reviewer_id);

-- STEP 6: Create RLS Policies for user_stats
DROP POLICY IF EXISTS "Anyone can view user stats" ON user_stats;

CREATE POLICY "Anyone can view user stats" ON user_stats
  FOR SELECT USING (true);

-- STEP 7: Create function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats(user_uuid UUID)
RETURNS void AS $$
DECLARE
  review_count INTEGER;
  avg_rating DECIMAL(3,2);
  sales_count INTEGER;
  listing_count INTEGER;
BEGIN
  -- Count reviews
  SELECT COUNT(*), COALESCE(AVG(rating), 0)
  INTO review_count, avg_rating
  FROM reviews
  WHERE seller_id = user_uuid;
  
  -- Count sales (sold listings)
  SELECT COUNT(*)
  INTO sales_count
  FROM listings
  WHERE user_id = user_uuid AND status = 'sold';
  
  -- Count total listings
  SELECT COUNT(*)
  INTO listing_count
  FROM listings
  WHERE user_id = user_uuid;
  
  -- Insert or update stats
  INSERT INTO user_stats (
    user_id,
    total_reviews,
    average_rating,
    total_sales,
    total_listings,
    updated_at
  ) VALUES (
    user_uuid,
    review_count,
    avg_rating,
    sales_count,
    listing_count,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_reviews = review_count,
    average_rating = avg_rating,
    total_sales = sales_count,
    total_listings = listing_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Create trigger to update stats when review is added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_user_stats(OLD.seller_id);
    RETURN OLD;
  ELSE
    PERFORM update_user_stats(NEW.seller_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_review ON reviews;
CREATE TRIGGER update_stats_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_user_stats();

-- STEP 9: Create function to prevent self-reviews
CREATE OR REPLACE FUNCTION prevent_self_review()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reviewer_id = NEW.seller_id THEN
    RAISE EXCEPTION 'Cannot review yourself';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_self_review ON reviews;
CREATE TRIGGER check_self_review
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_review();

-- STEP 10: Create function to get seller reviews
CREATE OR REPLACE FUNCTION get_seller_reviews(seller_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  listing_id UUID,
  listing_title TEXT,
  reviewer_id UUID,
  reviewer_name TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.listing_id,
    l.title as listing_title,
    r.reviewer_id,
    u.raw_user_meta_data->>'full_name' as reviewer_name,
    r.rating,
    r.comment,
    r.created_at,
    r.updated_at
  FROM reviews r
  INNER JOIN listings l ON r.listing_id = l.id
  LEFT JOIN auth.users u ON r.reviewer_id = u.id
  WHERE r.seller_id = seller_uuid
  ORDER BY r.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- STEP 11: Create function to get listing reviews
CREATE OR REPLACE FUNCTION get_listing_reviews(listing_uuid UUID)
RETURNS TABLE (
  id UUID,
  reviewer_id UUID,
  reviewer_name TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.reviewer_id,
    u.raw_user_meta_data->>'full_name' as reviewer_name,
    r.rating,
    r.comment,
    r.created_at
  FROM reviews r
  LEFT JOIN auth.users u ON r.reviewer_id = u.id
  WHERE r.listing_id = listing_uuid
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- STEP 12: Create view for review statistics
CREATE OR REPLACE VIEW review_stats AS
SELECT 
  seller_id,
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
FROM reviews
GROUP BY seller_id;

-- STEP 13: Initialize stats for existing users
INSERT INTO user_stats (user_id, member_since)
SELECT DISTINCT user_id, created_at
FROM listings
WHERE user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Update stats for all users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT DISTINCT user_id FROM listings WHERE user_id IS NOT NULL
  LOOP
    PERFORM update_user_stats(user_record.user_id);
  END LOOP;
END $$;

-- STEP 14: Add helpful comments
COMMENT ON TABLE reviews IS 'User reviews and ratings for sellers';
COMMENT ON TABLE user_stats IS 'Aggregated statistics for users';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN reviews.comment IS 'Optional review text';
COMMENT ON COLUMN user_stats.average_rating IS 'Average rating from all reviews';

-- STEP 15: Verification queries
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('reviews', 'user_stats');

-- Check indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE tablename IN ('reviews', 'user_stats');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('reviews', 'user_stats');

-- Check review stats
SELECT * FROM review_stats LIMIT 5;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Features added:
-- - Review submission with ratings (1-5 stars)
-- - User statistics tracking
-- - Self-review prevention
-- - Automatic stats updates
-- - Review aggregation views
-- ============================================================================
