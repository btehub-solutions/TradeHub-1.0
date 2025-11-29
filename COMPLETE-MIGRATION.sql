-- ============================================================================
-- TradeHub MASTER MIGRATION - All 5 Phases
-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy ALL text in this file (Ctrl+A, Ctrl+C)
-- 2. Paste into Supabase SQL Editor (Ctrl+V)
-- 3. Click "Run"
-- ============================================================================

-- ============================================================================
-- PHASE 1: Image Upload System
-- ============================================================================

-- STEP 1: Create Storage Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'listing-images',
  'listing-images',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- STEP 2: Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- STEP 3: Update listings table
-- First, ensure images column exists and is the correct type (JSONB)
DO $$
BEGIN
  -- Check if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'images') THEN
    -- If it exists, check if it's NOT jsonb
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'images' AND data_type = 'jsonb') THEN
      -- Convert it to JSONB (handles text[] -> jsonb conversion)
      ALTER TABLE listings ALTER COLUMN images TYPE JSONB USING to_jsonb(images);
    END IF;
  ELSE
    -- If it doesn't exist, create it
    ALTER TABLE listings ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS primary_image_index INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_listings_images ON listings USING gin(images);

COMMENT ON COLUMN listings.images IS 'Array of image URLs stored in Supabase Storage (JSONB array)';
COMMENT ON COLUMN listings.image_url IS 'Deprecated: Legacy single image URL, kept for backward compatibility. Use images array instead.';
COMMENT ON COLUMN listings.primary_image_index IS 'Index of the primary image in the images array (0-based)';

-- STEP 4: Migration function to move old image_url to images array
DO $$
DECLARE
  listing_record RECORD;
BEGIN
  FOR listing_record IN 
    SELECT id, image_url 
    FROM listings 
    WHERE image_url IS NOT NULL 
    AND (images IS NULL OR jsonb_array_length(images) = 0)
  LOOP
    UPDATE listings
    SET images = jsonb_build_array(listing_record.image_url)
    WHERE id = listing_record.id;
  END LOOP;
END $$;

-- STEP 5: Create helper function to get primary image
CREATE OR REPLACE FUNCTION get_primary_image(listing_id UUID)
RETURNS TEXT AS $$
DECLARE
  listing_images JSONB;
  primary_index INTEGER;
BEGIN
  SELECT images, primary_image_index 
  INTO listing_images, primary_index
  FROM listings 
  WHERE id = listing_id;
  
  IF listing_images IS NULL OR jsonb_array_length(listing_images) = 0 THEN
    RETURN NULL;
  END IF;
  
  IF primary_index >= jsonb_array_length(listing_images) THEN
    primary_index := 0;
  END IF;
  
  RETURN listing_images->primary_index->>0;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- PHASE 2: Advanced Search & Filtering
-- ============================================================================

-- Enable pg_trgm extension for fuzzy text search (MUST BE FIRST)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- STEP 1: Add indexes for price filtering
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_price_status ON listings(price, status) WHERE status = 'available';

-- STEP 2: Add indexes for location filtering
CREATE INDEX IF NOT EXISTS idx_listings_location_lower ON listings(LOWER(location));
CREATE INDEX IF NOT EXISTS idx_listings_location_trgm ON listings USING gin(location gin_trgm_ops);

-- STEP 3: Add full-text search indexes
CREATE INDEX IF NOT EXISTS idx_listings_title_search 
ON listings USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_listings_description_search 
ON listings USING gin(to_tsvector('english', description));

-- Combined full-text search index
CREATE INDEX IF NOT EXISTS idx_listings_fulltext_search 
ON listings USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- STEP 4: Add composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_listings_category_price_status 
ON listings(category, price, status) WHERE status = 'available';

CREATE INDEX IF NOT EXISTS idx_listings_status_created 
ON listings(status, created_at DESC) WHERE status = 'available';

CREATE INDEX IF NOT EXISTS idx_listings_category_created 
ON listings(category, created_at DESC) WHERE status = 'available';

-- STEP 5: Create materialized view for popular searches
CREATE MATERIALIZED VIEW IF NOT EXISTS listing_search_stats AS
SELECT 
  category,
  COUNT(*) as listing_count,
  AVG(price) as avg_price,
  MIN(price) as min_price,
  MAX(price) as max_price,
  array_agg(DISTINCT location) as locations
FROM listings
WHERE status = 'available'
GROUP BY category;

CREATE UNIQUE INDEX IF NOT EXISTS idx_listing_search_stats_category 
ON listing_search_stats(category);

-- STEP 6: Create function to refresh search stats
CREATE OR REPLACE FUNCTION refresh_listing_search_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY listing_search_stats;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Create function for advanced search
CREATE OR REPLACE FUNCTION search_listings(
  search_query TEXT DEFAULT NULL,
  filter_category TEXT DEFAULT NULL,
  min_price NUMERIC DEFAULT NULL,
  max_price NUMERIC DEFAULT NULL,
  filter_location TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC',
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
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
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
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
    CASE 
      WHEN search_query IS NOT NULL THEN
        ts_rank(
          to_tsvector('english', l.title || ' ' || l.description),
          plainto_tsquery('english', search_query)
        )
      ELSE 0
    END::REAL as relevance
  FROM listings l
  WHERE l.status = 'available'
    AND (filter_category IS NULL OR filter_category = 'All' OR l.category = filter_category)
    AND (min_price IS NULL OR l.price >= min_price)
    AND (max_price IS NULL OR l.price <= max_price)
    AND (filter_location IS NULL OR LOWER(l.location) LIKE '%' || LOWER(filter_location) || '%')
    AND (
      search_query IS NULL OR
      to_tsvector('english', l.title || ' ' || l.description) @@ plainto_tsquery('english', search_query)
    )
  ORDER BY
    CASE WHEN sort_by = 'price' AND sort_order = 'ASC' THEN l.price END ASC NULLS LAST,
    CASE WHEN sort_by = 'price' AND sort_order = 'DESC' THEN l.price END DESC NULLS LAST,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN l.created_at END DESC NULLS LAST,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN l.created_at END ASC NULLS LAST,
    CASE WHEN sort_by = 'relevance' AND search_query IS NOT NULL THEN
      ts_rank(
        to_tsvector('english', l.title || ' ' || l.description),
        plainto_tsquery('english', search_query)
      )
    END DESC NULLS LAST,
    l.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- STEP 8: Create function to get filter options
CREATE OR REPLACE FUNCTION get_filter_options()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'priceRange', (
      SELECT json_build_object(
        'min', COALESCE(MIN(price), 0),
        'max', COALESCE(MAX(price), 1000000)
      )
      FROM listings
      WHERE status = 'available'
    ),
    'locations', (
      SELECT json_agg(DISTINCT location ORDER BY location)
      FROM listings
      WHERE status = 'available' AND location IS NOT NULL
    ),
    'categories', (
      SELECT json_agg(
        json_build_object(
          'name', category,
          'count', count
        ) ORDER BY category
      )
      FROM (
        SELECT category, COUNT(*) as count
        FROM listings
        WHERE status = 'available'
        GROUP BY category
      ) cat_counts
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================================
-- PHASE 3: Favorites/Wishlist System
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
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove their favorites" ON favorites;

CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites" ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

CREATE INDEX IF NOT EXISTS idx_favorite_stats_listing 
ON favorites(listing_id, created_at DESC);

COMMENT ON TABLE favorites IS 'Stores user favorites/wishlist items';
COMMENT ON COLUMN favorites.user_id IS 'User who favorited the listing';
COMMENT ON COLUMN favorites.listing_id IS 'The favorited listing';
COMMENT ON COLUMN favorites.created_at IS 'When the listing was favorited';

-- STEP 10: Create trigger to prevent favoriting own listings
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


-- ============================================================================
-- PHASE 4: User Ratings & Reviews
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

COMMENT ON TABLE reviews IS 'User reviews and ratings for sellers';
COMMENT ON TABLE user_stats IS 'Aggregated statistics for users';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN reviews.comment IS 'Optional review text';
COMMENT ON COLUMN user_stats.average_rating IS 'Average rating from all reviews';


-- ============================================================================
-- PHASE 5: Analytics Dashboard
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
