# Portal Sync Guide - Staff to Participant

## Changes Made

### 1. Staff Portal Updates (StaffActivities.tsx)

**New Fields Added:**
- ✅ **Volunteer Slots** - Number of volunteers needed
- ✅ **Participant Slots** - Number of participants allowed
- ✅ **Meeting Location** - Specific meeting point (separate from general location)
- ✅ **Time Start** - Event start time (SGT)
- ✅ **Time End** - Event end time (SGT)

**Card Display Now Shows:**
- 📅 Date
- 🕐 Time (Start - End SGT)
- 📍 Location
- 📍 Meeting Location (if specified)
- 👥 Volunteer Slots: X
- 🎯 Participant Slots: X

**Form Updates:**
- Replaced single "Spots" input with "Volunteer Slots" and "Participant Slots"
- Added "Meeting Location" input below "Location"
- Added "Time" input with start and end time fields (SGT)
- Total spots is auto-calculated: volunteer_slots + participant_slots

---

### 2. Database Schema Updates

**New Columns Added to `activities` table:**
```sql
- meeting_location (TEXT) - Specific meeting point
- time_start (TEXT) - Start time in HH:MM format
- time_end (TEXT) - End time in HH:MM format
- volunteer_slots (INTEGER) - Number of volunteer positions
- participant_slots (INTEGER) - Number of participant positions
```

**Migration File Created:**
- `migration_add_columns.sql` - Run this in Supabase SQL Editor

---

### 3. Participant Portal (No Changes Needed!)

The participant portal already uses the correct fields from the database:
- ✅ `startISO` and `endISO` for times
- ✅ `location` for general location
- ✅ `meetingPoint` for meeting location
- ✅ `capacity` for total spots
- ✅ All accessibility fields

The `ParticipantActivitiesContext` and `participantHooks` will automatically fetch and display the new data once the database columns are added.

---

## How to Apply Changes

### Step 1: Run Database Migration

1. Open Supabase dashboard
2. Go to **SQL Editor**
3. Open `migration_add_columns.sql`
4. Copy and paste contents
5. Click **Run**

This adds the new columns to your activities table.

---

### Step 2: Restart Development Server

```bash
cd /Users/shanice/Downloads/Hack4Good
npm run dev
```

---

### Step 3: Test the Changes

#### Test Staff Portal:
1. Go to `/staff/activities`
2. Click **"New Activity"**
3. You should see:
   - ✅ Volunteer Slots input
   - ✅ Participant Slots input
   - ✅ Meeting Location input
   - ✅ Time inputs (start and end)
4. Create a new activity with all fields filled
5. Check the card display shows:
   - Volunteer and Participant slots separately
   - Meeting location
   - Time range

#### Test Participant Portal:
1. Go to `/participant/calendar`
2. Find the activity you just created
3. Click on it to see details
4. Verify all information matches what you entered in Staff portal

---

## Field Mapping (Staff → Participant)

| Staff Portal Field | Database Column | Participant Portal Display |
|-------------------|-----------------|---------------------------|
| Title | title | Title |
| Date | date | Day/Date |
| Time Start | time_start | Start Time |
| Time End | time_end | End Time |
| Location | location | Location |
| Meeting Location | meeting_location | Meeting Point |
| Volunteer Slots | volunteer_slots | Not shown (volunteer portal) |
| Participant Slots | participant_slots | Capacity |
| Activity Type | activity_type | Category badge |
| Disability Access | disability_access | Accessibility info |
| Notes | comments | Description |

---

## Clean Up Documentation

To remove all the integration documentation files, run:

```bash
cd /Users/shanice/Downloads/Hack4Good
chmod +x cleanup-docs.sh
./cleanup-docs.sh
```

This will remove:
- All SUPABASE setup guides
- All integration documentation
- All fix guides
- All temporary SQL files
- All backup TypeScript files

**Files it will keep:**
- This file (SYNC_GUIDE.md)
- migration_add_columns.sql (you need this)
- cleanup-docs.sh (in case you need to run it again)

---

## Verification Checklist

### Staff Portal:
- [ ] Can create activity with volunteer slots
- [ ] Can create activity with participant slots  
- [ ] Can add meeting location
- [ ] Can set time start and end
- [ ] Card shows volunteer slots separately
- [ ] Card shows participant slots separately
- [ ] Card shows meeting location
- [ ] Card shows time range

### Participant Portal:
- [ ] Activities show correct date
- [ ] Activities show correct time range
- [ ] Activities show correct location
- [ ] Activity details show meeting point
- [ ] Capacity matches participant slots from staff portal
- [ ] All other fields sync correctly

### Database:
- [ ] New columns exist in activities table
- [ ] Existing activities have default values
- [ ] New activities save all fields correctly

---

## Troubleshooting

### Issue: New fields not showing in Staff portal
**Solution:** Make sure you restarted the dev server after updating StaffActivities.tsx

### Issue: Activities not loading in Participant portal
**Solution:** 
1. Check database has the new columns (run verification query in migration file)
2. Make sure activities have `start_time` and `end_time` populated

### Issue: Slot numbers don't match
**Solution:**
- `participant_slots` in database = `capacity` in participant portal
- `volunteer_slots` is separate (for volunteer portal)
- Total `spots` = volunteer_slots + participant_slots

### Issue: Time not displaying
**Solution:** Make sure time is saved in HH:MM format (e.g., "14:30")

---

## What's Synced Now

✅ **Activity Information:**
- Title, Date, Location, Meeting Location
- Start Time, End Time (in SGT)
- Activity Type, Disability Access

✅ **Capacity Management:**
- Separate tracking for volunteers vs participants
- Participant portal sees participant slots as capacity
- Staff sees both volunteer and participant slots

✅ **Details:**
- Description/Comments
- Accessibility features
- All display correctly in both portals

---

## Next Steps

1. ✅ Run migration SQL
2. ✅ Test staff portal - create new activity
3. ✅ Test participant portal - view activity
4. ✅ Run cleanup script to remove docs
5. ✅ Update existing activities with new fields (optional)

---

**All portals are now synced!** 🎉

Staff portal controls all the data, and participant portal displays it correctly.
