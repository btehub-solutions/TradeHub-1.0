-- DEBUG: Check what's happening when we try to update status to 'sold'
-- This will help us understand if there's a policy or constraint issue

-- First, let's see all current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'listings';

-- Check if there are any triggers on the listings table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'listings';

-- Check table constraints
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'listings';
