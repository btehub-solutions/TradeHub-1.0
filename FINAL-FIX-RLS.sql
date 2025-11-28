-- COMPREHENSIVE FIX FOR SOLD ITEMS DISAPPEARING
-- This will completely reset all RLS policies to ensure sold items are visible

-- Step 1: Drop ALL existing policies on listings table
DROP POLICY IF EXISTS "Anyone can view all listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view available listings" ON listings;
DROP POLICY IF EXISTS "View available listings or own listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can insert listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Anyone can insert listings" ON listings;

-- Step 2: Create new, clear policies

-- SELECT: Anyone can view all listings (both available and sold)
CREATE POLICY "Public read access" ON listings
  FOR SELECT USING (true);

-- INSERT: Authenticated users can create listings
CREATE POLICY "Authenticated insert" ON listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own listings
CREATE POLICY "Owner update" ON listings
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own listings  
CREATE POLICY "Owner delete" ON listings
  FOR DELETE USING (auth.uid() = user_id);

-- Step 3: Verify the policies
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Anyone can view'
    WHEN cmd = 'INSERT' THEN 'Authenticated users only'
    WHEN cmd = 'UPDATE' THEN 'Owners only'
    WHEN cmd = 'DELETE' THEN 'Owners only'
  END as description
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY cmd, policyname;
