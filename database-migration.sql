-- TradeHub Database Migration
-- Run this in your Supabase SQL Editor to add missing columns

-- Add missing columns to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Other',
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS images JSONB;

-- Update existing rows to have default values
UPDATE listings 
SET category = 'Other' 
WHERE category IS NULL;

UPDATE listings 
SET status = 'available' 
WHERE status IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

-- Update RLS policies to work with user_id
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;
DROP POLICY IF EXISTS "Anyone can insert listings" ON listings;

-- New policies with proper auth
CREATE POLICY "Anyone can view available listings" ON listings
  FOR SELECT USING (status = 'available' OR user_id = auth.uid());

CREATE POLICY "Authenticated users can insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);
