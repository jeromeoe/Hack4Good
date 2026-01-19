-- Test if RLS UPDATE policy exists for profiles table
-- Run this in Supabase SQL Editor

-- 1. Check current policies
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

-- 2. If no UPDATE policy exists, create one:
-- (Uncomment the lines below if needed)

-- CREATE POLICY "Users can update own profile"
-- ON profiles FOR UPDATE
-- USING (auth.uid() = id)
-- WITH CHECK (auth.uid() = id);

-- 3. Test manual update
-- Replace 'YOUR-USER-ID' with your actual user ID from console
-- UPDATE profiles
-- SET full_name = 'RLS Test'
-- WHERE id = 'YOUR-USER-ID';

-- 4. Check if it worked
-- SELECT id, full_name, email FROM profiles WHERE id = 'YOUR-USER-ID';
