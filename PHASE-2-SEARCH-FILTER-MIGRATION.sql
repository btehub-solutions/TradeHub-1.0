-- ============================================================================
-- TradeHub Enhancement Migration - Phase 2: Advanced Search & Filtering
-- ============================================================================
-- This migration adds database indexes for better search and filter performance
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- STEP 1: Add indexes for price filtering
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_price_status ON listings(price, status) WHERE status = 'available';

-- STEP 2: Add indexes for location filtering
CREATE INDEX IF NOT EXISTS idx_listings_location_lower ON listings(LOWER(location));
CREATE INDEX IF NOT EXISTS idx_listings_location_trgm ON listings USING gin(location gin_trgm_ops);

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

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

-- STEP 5: Create materialized view for popular searches (optional, for performance)
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

-- Create index on materialized view
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

-- STEP 9: Verification queries
-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'listings'
ORDER BY indexname;

-- Test search function
SELECT * FROM search_listings(
  search_query := 'phone',
  filter_category := NULL,
  min_price := NULL,
  max_price := NULL,
  filter_location := NULL,
  sort_by := 'relevance',
  sort_order := 'DESC',
  limit_count := 10
);

-- Get filter options
SELECT get_filter_options();

-- Check materialized view
SELECT * FROM listing_search_stats;

-- ============================================================================
-- Migration Complete!
-- ============================================================================
-- Performance improvements:
-- - Full-text search on title and description
-- - Optimized price range filtering
-- - Location fuzzy matching
-- - Composite indexes for common queries
-- - Materialized view for statistics
-- ============================================================================
