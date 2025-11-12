-- COMPLETE DATABASE SETUP FOR TRADEHUB
-- This will drop and recreate the listings table with all required columns
-- WARNING: This will delete all existing listings data!
-- If you want to keep your data, use the migration script instead

-- Step 1: Drop existing table (CAREFUL - this deletes all data!)
DROP TABLE IF EXISTS listings CASCADE;

-- Step 2: Create the complete table with all columns
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
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create indexes for better performance
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);

-- Step 5: Create RLS Policies
CREATE POLICY "Anyone can view available listings" ON listings
  FOR SELECT USING (status = 'available' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Done! Your database is now ready.
