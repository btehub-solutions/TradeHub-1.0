-- TEST: Try to manually update a listing to 'sold' status
-- This will help us see if the database allows the update

-- First, let's see a sample listing
SELECT id, title, status, user_id FROM listings LIMIT 1;

-- Copy one of the IDs from above and use it below
-- Replace 'YOUR-LISTING-ID-HERE' with an actual ID from the query above

-- Try to update it to sold
-- UPDATE listings 
-- SET status = 'sold' 
-- WHERE id = 'YOUR-LISTING-ID-HERE';

-- Then check if it worked
-- SELECT id, title, status FROM listings WHERE id = 'YOUR-LISTING-ID-HERE';
