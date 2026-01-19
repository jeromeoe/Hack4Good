-- DEBUG SCRIPT: Check participant login issues
-- Run these queries in Supabase SQL Editor to diagnose problems

-- ===================================================
-- 1. CHECK ALL PROFILES AND THEIR AUTH STATUS
-- ===================================================
SELECT 
  auth.users.email as auth_email,
  auth.users.id as auth_id,
  auth.users.created_at as auth_created,
  profiles.id as profile_id,
  profiles.email as profile_email,
  profiles.full_name,
  profiles.role,
  profiles.age,
  profiles.disability,
  profiles.phone
FROM auth.users
LEFT JOIN profiles ON auth.users.id = profiles.id
ORDER BY auth.users.created_at DESC;

-- Expected: Each auth.users row should have a matching profiles row
-- Problem: If profile_id is NULL, the profile wasn't created during registration


-- ===================================================
-- 2. FIND ORPHANED AUTH ACCOUNTS (no profile)
-- ===================================================
SELECT 
  auth.users.email,
  auth.users.id,
  auth.users.created_at
FROM auth.users
LEFT JOIN profiles ON auth.users.id = profiles.id
WHERE profiles.id IS NULL;

-- If this returns rows: These users have auth accounts but no profiles
-- Fix: Either delete these accounts or manually create profiles for them


-- ===================================================
-- 3. CHECK FOR ROLE ISSUES
-- ===================================================
SELECT 
  email,
  role,
  LENGTH(role) as role_length,
  role = 'participant' as exact_match,
  LOWER(TRIM(role)) as normalized_role,
  LOWER(TRIM(role)) = 'participant' as normalized_match
FROM profiles
WHERE role IS NOT NULL;

-- Check the results:
-- - exact_match should be TRUE for participants
-- - If FALSE, check if there's whitespace or wrong casing
-- - normalized_match should be TRUE after the fix


-- ===================================================
-- 4. FIX ROLE CASING ISSUES (if needed)
-- ===================================================
-- Only run this if you see roles with wrong casing
UPDATE profiles
SET role = LOWER(TRIM(role))
WHERE role IS NOT NULL 
  AND role != LOWER(TRIM(role));

-- This normalizes all roles to lowercase without spaces


-- ===================================================
-- 5. COUNT USERS BY ROLE
-- ===================================================
SELECT 
  LOWER(TRIM(role)) as normalized_role,
  COUNT(*) as count
FROM profiles
GROUP BY LOWER(TRIM(role))
ORDER BY count DESC;

-- Shows distribution of users across roles


-- ===================================================
-- 6. FIND INCOMPLETE PROFILES
-- ===================================================
SELECT 
  email,
  full_name,
  role,
  CASE 
    WHEN full_name IS NULL THEN '❌ Missing name'
    WHEN email IS NULL THEN '❌ Missing email'
    WHEN role IS NULL THEN '❌ Missing role'
    WHEN age IS NULL AND LOWER(role) = 'participant' THEN '⚠️ Missing age'
    WHEN disability IS NULL AND LOWER(role) = 'participant' THEN '⚠️ Missing disability'
    ELSE '✅ Complete'
  END as status
FROM profiles;

-- Shows which profiles have missing data


-- ===================================================
-- 7. DELETE A TEST USER (use with caution!)
-- ===================================================
-- Replace 'test@example.com' with the actual email
-- This will delete both auth account and profile
/*
DELETE FROM auth.users 
WHERE email = 'test@example.com';
*/


-- ===================================================
-- 8. MANUALLY CREATE A PROFILE FOR AN ORPHANED USER
-- ===================================================
-- Use this if a user has auth but no profile
-- Replace values with actual user data
/*
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  phone,
  age,
  disability
) VALUES (
  'uuid-from-auth-users',  -- Get from query #2
  'user@example.com',
  'User Full Name',
  'participant',
  '+65 91234567',
  25,
  'Physical Disability'
);
*/


-- ===================================================
-- 9. CHECK RLS POLICIES ON PROFILES TABLE
-- ===================================================
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

-- Make sure there's a policy allowing users to read their own profile:
-- USING (auth.uid() = id)


-- ===================================================
-- 10. TEST IF A SPECIFIC USER CAN BE FOUND
-- ===================================================
-- Replace with actual email to test
SELECT 
  id,
  email,
  full_name,
  role,
  LOWER(TRIM(role)) as normalized_role
FROM profiles
WHERE email = 'participant@test.com';

-- This is what the app tries to fetch
-- If this returns 0 rows, the profile doesn't exist


-- ===================================================
-- COMMON FIXES
-- ===================================================

-- Fix #1: Normalize all roles to lowercase
-- UPDATE profiles SET role = LOWER(TRIM(role));

-- Fix #2: Delete orphaned auth accounts
-- DELETE FROM auth.users WHERE id IN (
--   SELECT auth.users.id 
--   FROM auth.users 
--   LEFT JOIN profiles ON auth.users.id = profiles.id 
--   WHERE profiles.id IS NULL
-- );

-- Fix #3: Create RLS policy for profile reading
-- CREATE POLICY "Users can read own profile"
-- ON profiles FOR SELECT
-- USING (auth.uid() = id);
