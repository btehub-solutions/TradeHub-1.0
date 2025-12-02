-- =====================================================
-- PRODUCTION DATABASE OPTIMIZATION
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Listings table indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at_desc ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings USING gin(location gin_trgm_ops);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_listings_status_category ON listings(status, category);
CREATE INDEX IF NOT EXISTS idx_listings_status_created_at ON listings(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings(user_id, status);

-- Partial index for available listings only (most common query)
CREATE INDEX IF NOT EXISTS idx_listings_available ON listings(created_at DESC) 
WHERE status = 'available';

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_listings_title_search ON listings USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_listings_description_search ON listings USING gin(to_tsvector('english', description));

-- Favorites table indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Composite index for unique constraint and common queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_listing ON favorites(user_id, listing_id);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON listing_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_viewed_at ON listing_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_date ON listing_views(listing_id, viewed_at DESC);

-- =====================================================
-- OPTIMIZED RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist and recreate optimized versions
DROP POLICY IF EXISTS "Users can view all listings" ON listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;

-- Optimized listings policies
CREATE POLICY "Users can view all listings"
ON listings FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own listings"
ON listings FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own listings"
ON listings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON listings FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- DATABASE FUNCTIONS FOR PERFORMANCE
-- =====================================================

-- Function to get paginated listings with filters (optimized)
CREATE OR REPLACE FUNCTION get_listings_paginated(
    p_category TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_status TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
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
    images TEXT[],
    category TEXT,
    status TEXT,
    user_id UUID,
    created_at TIMESTAMPTZ,
    total_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_listings AS (
        SELECT 
            l.*,
            COUNT(*) OVER() AS total_count
        FROM listings l
        WHERE 
            (p_category IS NULL OR l.category = p_category)
            AND (p_min_price IS NULL OR l.price >= p_min_price)
            AND (p_max_price IS NULL OR l.price <= p_max_price)
            AND (p_location IS NULL OR l.location ILIKE '%' || p_location || '%')
            AND (p_search IS NULL OR 
                 l.title ILIKE '%' || p_search || '%' OR 
                 l.description ILIKE '%' || p_search || '%')
            AND (p_status IS NULL OR l.status = p_status)
            AND (p_user_id IS NULL OR l.user_id = p_user_id)
        ORDER BY l.created_at DESC
        LIMIT p_limit
        OFFSET p_offset
    )
    SELECT * FROM filtered_listings;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check database health
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS JSON AS $$
DECLARE
    result JSON;
    connection_count INTEGER;
    slow_queries INTEGER;
BEGIN
    -- Get current connection count
    SELECT COUNT(*) INTO connection_count
    FROM pg_stat_activity
    WHERE datname = current_database();

    -- Get slow query count (queries taking > 1 second)
    SELECT COUNT(*) INTO slow_queries
    FROM pg_stat_statements
    WHERE mean_exec_time > 1000
    LIMIT 100;

    result := json_build_object(
        'status', 'healthy',
        'connections', connection_count,
        'slow_queries', slow_queries,
        'timestamp', NOW()
    );

    RETURN result;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'status', 'error',
        'message', SQLERRM,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VACUUM AND ANALYZE
-- =====================================================

-- Analyze tables to update statistics for query planner
ANALYZE listings;
ANALYZE favorites;
ANALYZE reviews;
ANALYZE listing_views;

-- =====================================================
-- CONNECTION POOLING SETTINGS (for reference)
-- =====================================================

-- These settings should be configured in Supabase Dashboard > Settings > Database
-- Recommended settings for production:
-- 
-- max_connections: 100 (adjust based on your plan)
-- shared_buffers: 256MB (25% of RAM)
-- effective_cache_size: 1GB (50-75% of RAM)
-- maintenance_work_mem: 64MB
-- checkpoint_completion_target: 0.9
-- wal_buffers: 16MB
-- default_statistics_target: 100
-- random_page_cost: 1.1 (for SSD)
-- effective_io_concurrency: 200
-- work_mem: 4MB
-- min_wal_size: 1GB
-- max_wal_size: 4GB

-- =====================================================
-- MONITORING VIEWS
-- =====================================================

-- View for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- queries taking more than 100ms on average
ORDER BY mean_exec_time DESC
LIMIT 20;

-- View for monitoring table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Production database optimization complete!';
    RAISE NOTICE '📊 Indexes created for optimal query performance';
    RAISE NOTICE '🔒 RLS policies optimized';
    RAISE NOTICE '⚡ Helper functions created';
    RAISE NOTICE '📈 Monitoring views available: slow_queries, table_sizes';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Remember to configure connection pooling in Supabase Dashboard';
    RAISE NOTICE '💡 Run ANALYZE periodically to keep statistics up to date';
END $$;
