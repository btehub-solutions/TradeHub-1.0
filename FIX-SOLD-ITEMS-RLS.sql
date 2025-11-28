-- SIMPLE FIX: Just drop the restrictive policy
-- The policy "Anyone can view all listings" already exists from the previous run

-- Drop any old restrictive policies if they exist
DROP POLICY IF EXISTS "Anyone can view available listings" ON listings;
DROP POLICY IF EXISTS "View available listings or own listings" ON listings;

-- Verify the current policies
SELECT * FROM pg_policies WHERE tablename = 'listings';
