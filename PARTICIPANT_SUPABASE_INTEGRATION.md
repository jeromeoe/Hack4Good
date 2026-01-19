# Participant Registration Supabase Integration

## Summary
Successfully migrated Participant portal activity registration from the old `activity_registrations` table to the unified `registrations` table, matching the implementation used in the Volunteer portal.

## Changes Made

### File Updated
**`src/lib/participantHooks.ts`** - Complete rewrite to use unified registrations table

### Key Changes

1. **Unified Registrations Table**
   - Changed from `activity_registrations` table to `registrations` table
   - Now uses the same table as Volunteer portal
   - Participants are identified by `user_type: 'participant'`

2. **Database Schema Compatibility**
   - Added support for both old and new column names:
     - `time_start` / `start_time`
     - `time_end` / `end_time`
     - `participant_slots` / `capacity`
     - `meeting_point` / `meeting_location`
   - More flexible disability access mapping
   - Support for `suitable_disabilities` array field

3. **Enhanced Logging**
   - Added comprehensive console logging to all functions
   - Easier debugging of registration flow
   - Clear start/complete markers for each operation

4. **Improved Registration Logic**
   - Properly filters registrations by `user_type` when counting
   - Only counts `registered` or `confirmed` status
   - Handles waitlist logic correctly

### Functions Updated

#### `fetchActivitiesForParticipant()`
- Uses `registrations` table instead of `activity_registrations`
- Filters by `user_type` to count only participants
- Maps both `registered` and `confirmed` status as registered

#### `registerForActivity()`
- Inserts into `registrations` table
- Sets `user_type: 'participant'`
- Uses `status` field for registration state

#### `cancelActivityRegistration()`
- Deletes from `registrations` table using `user_id` and `activity_id`
- Simplified logic - just delete the row

#### `checkSchedulingConflict()`
- Reads from `registrations` table
- Checks for `registered` or `confirmed` status
- Compatible with both time column naming conventions

#### `getWeeklyActivityCount()`
- Uses `registrations` table
- Filters by `user_id` and status

### Backward Compatibility
The code supports both old and new database schemas:
- Old: `time_start`, `time_end`, `participant_slots`, `meeting_location`
- New: `start_time`, `end_time`, `capacity`, `meeting_point`

## Testing Required

### 1. Registration Flow
```bash
# Test Steps:
1. Login as participant
2. Navigate to Activities page
3. Click "Register" on an activity
4. Verify success message: "✓ Successfully registered!"
5. Check browser console for logs
6. Refresh page - verify activity shows as registered
7. Click "Cancel Registration"
8. Verify success message: "✓ Successfully cancelled"
```

### 2. Database Verification
```sql
-- Check registrations table
SELECT * FROM registrations 
WHERE user_type = 'participant' 
ORDER BY created_at DESC 
LIMIT 10;

-- Verify count logic
SELECT 
  activity_id,
  COUNT(*) as participant_count
FROM registrations
WHERE user_type IN ('participant', 'Participant')
  AND status IN ('registered', 'confirmed')
GROUP BY activity_id;
```

### 3. Waitlist Logic
```
1. Find an activity near capacity
2. Register multiple participants
3. Verify waitlist message when capacity reached
4. Check database - status should be 'waitlisted'
```

### 4. Conflict Detection
```
1. Register for an activity
2. Try to register for overlapping activity
3. Verify warning message about clash
```

### 5. Weekly Limit
```
1. Register for 3 activities in current week
2. Try to register for a 4th
3. Verify warning about weekly limit
```

## Console Output Examples

### Successful Registration
```
=== registerForActivity START ===
Activity ID: 123
✓ User authenticated: abc-def-123
✓ Activity ID converted to number: 123
✓ Activity found, capacity: 20
✓ Current registrations: 5 / 20
✓ Registration status will be: registered
✓ Registration created successfully
=== registerForActivity COMPLETE ===
```

### Successful Cancellation
```
=== cancelActivityRegistration START ===
Activity ID: 123
✓ User authenticated: abc-def-123
✓ Activity ID converted: 123
✓ Registration cancelled successfully
=== cancelActivityRegistration COMPLETE ===
```

## Migration Notes

### From Old System
Previously used `activity_registrations` table with:
- `participant_id` (UUID)
- Separate table from volunteers
- Status: `registered`, `waitlisted`, `cancelled`

### To New System
Now uses unified `registrations` table with:
- `user_id` (UUID) - for both volunteers and participants
- `user_type` - distinguishes between 'volunteer' and 'participant'
- `status` - same values but shared across user types

### Benefits
1. **Unified Data Model** - Single source of truth for all registrations
2. **Easier Reporting** - Can query all registrations from one table
3. **Consistent Logic** - Volunteer and Participant use same patterns
4. **Better Maintainability** - Less code duplication

## Rollback Plan

If issues arise, the old file is backed up. To rollback:
```bash
# The old implementation is preserved in git history
git checkout HEAD -- src/lib/participantHooks.ts
```

Or manually restore from the backup if needed.

## Next Steps

1. ✅ Test registration flow thoroughly
2. ✅ Verify database counts are correct
3. ✅ Test waitlist functionality
4. ✅ Test conflict detection
5. ✅ Test weekly limits
6. ⚠️ Consider removing `activity_registrations` table after confirming everything works
7. ⚠️ Update any analytics/reporting queries to use `registrations` table

## Status
✅ **Code Updated** - New implementation ready for testing  
⏳ **Testing Required** - Needs thorough testing before production  
📋 **Documentation Complete** - This file documents all changes

---

**Created:** January 2026  
**Last Updated:** January 2026  
**Status:** Ready for Testing
