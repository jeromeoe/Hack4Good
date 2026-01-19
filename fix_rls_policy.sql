-- FIX FOR PROFILE NOT SAVING
-- The issue is that Row Level Security (RLS) is blocking UPDATE operations

-- Run this in Supabase SQL Editor to fix the issue:

-- 1. Check if UPDATE policy exists for profiles table
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- 2. If no UPDATE policy exists, create one:
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Verify the policy was created:
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- After running this, try updating your profile again in the app
-- You should see "Updated data: [array with your profile data]" instead of "Updated data: []"
