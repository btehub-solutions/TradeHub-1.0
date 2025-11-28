-- Check the current RLS policies to see if UPDATE is blocked
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY cmd, policyname;
