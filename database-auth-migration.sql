-- ═══════════════════════════════════════════════════════════════
-- TRADEHUB AUTHENTICATION & SELLER DASHBOARD - DATABASE MIGRATION
-- ═══════════════════════════════════════════════════════════════
-- Run this SQL in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Add user_id column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add status column for tracking sold items
ALTER TABLE listings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold'));

-- Create indexes for faster user listings queries
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;
DROP POLICY IF EXISTS "Anyone can insert listings" ON listings;
DROP POLICY IF EXISTS "Enable read access for all users" ON listings;
DROP POLICY IF EXISTS "Enable insert for all users" ON listings;

-- New RLS policies for authenticated users
CREATE POLICY "Anyone can view available listings" ON listings
  FOR SELECT USING (status = 'available' OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- OPTIONAL: Update existing demo listings to have a user_id
-- ═══════════════════════════════════════════════════════════════
-- You can manually assign them to your test user after creating an account
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from auth.users table
-- 
-- UPDATE listings 
-- SET user_id = 'YOUR_USER_ID_HERE', status = 'available' 
-- WHERE user_id IS NULL;
-- ═══════════════════════════════════════════════════════════════
