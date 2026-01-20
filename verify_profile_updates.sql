-- Supabase SQL Query to Verify Profile Updates
-- Run this in Supabase SQL Editor to check if updates are working

-- 1. Check current profile data for all participants
SELECT 
  id,
  email,
  full_name,
  phone,
  age,
  disability,
  caregiver_info,
  role,
  updated_at
FROM profiles
WHERE role = 'participant'
ORDER BY updated_at DESC;

-- 2. Check if email field exists and is updatable
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('email', 'full_name', 'phone', 'age', 'disability', 'caregiver_info')
ORDER BY ordinal_position;

-- 3. Check RLS policies for profiles table
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
WHERE tablename = 'profiles';

-- 4. Test if a specific user can update their profile (replace with actual user ID)
-- This is a read-only check - it shows what the update would affect
SELECT 
  id,
  email,
  full_name,
  phone,
  age,
  disability
FROM profiles
WHERE id = 'USER_ID_HERE';  -- Replace with actual user UUID

-- 5. Check recent profile updates (to see if updates are happening)
SELECT 
  id,
  email,
  full_name,
  role,
  updated_at,
  created_at
FROM profiles
WHERE role = 'participant'
  AND updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
