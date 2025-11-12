-- ============================================
-- COMPLETE DATABASE SETUP - RUN THIS ONCE
-- This fixes EVERYTHING
-- ============================================

-- Drop and recreate table with correct structure
DROP TABLE IF EXISTS listings CASCADE;

CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  category TEXT DEFAULT 'Other',
  image_url TEXT,
  images JSONB,
  user_id UUID,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

-- NO ROW LEVEL SECURITY - Keep it simple
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Force schema refresh
NOTIFY pgrst, 'reload schema';

-- Done! Your database is ready.
