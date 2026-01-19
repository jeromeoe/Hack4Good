-- Add new columns to activities table for portal sync
-- Run this in your Supabase SQL Editor

-- Step 1: Add new columns
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS meeting_location TEXT,
ADD COLUMN IF NOT EXISTS time_start TEXT,
ADD COLUMN IF NOT EXISTS time_end TEXT,
ADD COLUMN IF NOT EXISTS volunteer_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS participant_slots INTEGER DEFAULT 0;

-- Step 2: Migrate data from old 'spots' column to new columns
-- Assuming spots were participant slots
UPDATE activities 
SET participant_slots = spots 
WHERE participant_slots IS NULL AND spots IS NOT NULL;

UPDATE activities 
SET volunteer_slots = 0 
WHERE volunteer_slots IS NULL;

-- Step 3: Drop the old 'spots' column
ALTER TABLE activities 
DROP COLUMN IF EXISTS spots;

-- Step 4: Verify the changes
SELECT 
  id, 
  title, 
  date,
  time_start,
  time_end,
  location, 
  meeting_location,
  volunteer_slots, 
  participant_slots
FROM activities
LIMIT 5;
