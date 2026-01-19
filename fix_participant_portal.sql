-- SIMPLE FIX: Make your database work with the participant portal
-- Run this in Supabase SQL Editor

-- Step 1: Check current schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'activities' 
ORDER BY ordinal_position;

-- Step 2: Add columns that participant portal expects
ALTER TABLE activities 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS meeting_point TEXT,
ADD COLUMN IF NOT EXISTS meals_provided BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS visually_impaired_friendly BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hearing_impaired_friendly BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS intellectual_disability_friendly BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS autism_friendly BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suitable_disabilities TEXT[] DEFAULT '{}';

-- Step 3: Populate from existing data
-- Convert date + time_start/time_end to timestamps
UPDATE activities
SET start_time = (date || ' ' || COALESCE(time_start, '09:00') || ':00')::timestamp
WHERE start_time IS NULL AND date IS NOT NULL;

UPDATE activities
SET end_time = (date || ' ' || COALESCE(time_end, '12:00') || ':00')::timestamp
WHERE end_time IS NULL AND date IS NOT NULL;

-- Copy meeting_location to meeting_point
UPDATE activities
SET meeting_point = COALESCE(meeting_location, location)
WHERE meeting_point IS NULL;

-- Copy comments to description
UPDATE activities
SET description = COALESCE(comments, title)
WHERE description IS NULL;

-- Set capacity from participant_slots
UPDATE activities
SET capacity = COALESCE(participant_slots, 20)
WHERE capacity IS NULL;

-- Step 4: Set some default accessibility (you can edit individual activities later)
UPDATE activities
SET wheelchair_accessible = true,
    visually_impaired_friendly = true,
    hearing_impaired_friendly = true,
    intellectual_disability_friendly = true,
    autism_friendly = true
WHERE wheelchair_accessible IS NULL;

-- Step 5: Set suitable disabilities based on disability_access
UPDATE activities
SET suitable_disabilities = CASE
  WHEN disability_access = 'Universal' THEN ARRAY['Physical Disability', 'Visual Impairment', 'Hearing Impairment', 'Intellectual Disability', 'Autism Spectrum', 'Multiple Disabilities', 'Other']
  WHEN disability_access = 'Wheelchair Friendly' THEN ARRAY['Physical Disability', 'Multiple Disabilities']
  WHEN disability_access = 'Sensory Friendly' THEN ARRAY['Autism Spectrum', 'Visual Impairment', 'Hearing Impairment']
  ELSE ARRAY['Other']
END
WHERE suitable_disabilities = '{}';

-- Step 6: Verify the data
SELECT 
  id,
  title,
  date,
  start_time,
  end_time,
  location,
  meeting_point,
  capacity,
  participant_slots,
  volunteer_slots
FROM activities
LIMIT 5;

-- Step 7: Check if activities will show in participant portal
SELECT 
  COUNT(*) as total_activities,
  COUNT(CASE WHEN start_time > NOW() THEN 1 END) as future_activities
FROM activities;
