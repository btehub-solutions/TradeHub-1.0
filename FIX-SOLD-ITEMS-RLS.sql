-- FIX FOR SOLD ITEMS APPEARING DELETED
-- This updates the Row Level Security policy to allow users to see their own sold items

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view available listings" ON listings;

-- Create a new policy that allows:
-- 1. Anyone to view available listings
-- 2. Users to view ALL their own listings (including sold ones)
CREATE POLICY "View available listings or own listings" ON listings
  FOR SELECT USING (
    status = 'available' OR user_id = auth.uid()
  );

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'listings' AND policyname = 'View available listings or own listings';
