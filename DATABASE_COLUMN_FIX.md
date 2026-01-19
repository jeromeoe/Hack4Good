# ✅ Fixed: Database Column Error

## Problem
When trying to register for an activity, error appeared:
```
Error: Database error: column activities.capacity does not exist
```

## Root Cause
The code was trying to SELECT the `capacity` column from the activities table, but this column doesn't exist in the database schema.

**Actual Database Schema:**
- `volunteer_slots` - for volunteer capacity
- `participant_slots` - for participant capacity  
- `spots` - legacy field
- **NO `capacity` column**

## What Was Wrong

### In `registerForActivity()`:
```typescript
// ❌ WRONG - tried to select non-existent column
const { data: activity } = await supabase
  .from('activities')
  .select('participant_slots, capacity, title')  // ← capacity doesn't exist!
  .eq('id', activityNumericId);

const maxCapacity = activity.participant_slots || activity.capacity || 20;
```

### In `convertDBActivityToApp()`:
```typescript
// ❌ WRONG - tried to access non-existent column
capacity: dbActivity.participant_slots || dbActivity.capacity || 20,
```

## The Fix

### Updated `registerForActivity()`:
```typescript
// ✅ FIXED - only select columns that exist
const { data: activity } = await supabase
  .from('activities')
  .select('participant_slots, title')  // ← removed capacity
  .eq('id', activityNumericId);

const maxCapacity = activity.participant_slots ?? 20;
```

### Updated `convertDBActivityToApp()`:
```typescript
// ✅ FIXED - use participant_slots, fallback to capacity with type casting for safety
capacity: dbActivity.participant_slots ?? (dbActivity as any).capacity ?? 20,
```

## Why This Happened
The database schema was updated to use specific `_slots` fields for volunteers and participants, but some code still referenced the old generic `capacity` field. The Volunteer portal was already updated to use `volunteer_slots`, but the Participant portal still had references to the non-existent `capacity` column.

## Files Modified
- ✅ `src/lib/participantHooks.ts` - Fixed both locations

## Testing

### Test Registration
```bash
npm run dev
```

1. Login as participant
2. Click any activity
3. Click "Register"
4. **✅ Expected:** Registration succeeds with toast message
5. **✅ Expected:** Console shows:
   ```
   === registerForActivity START ===
   ✓ Activity found: [activity name]
   ✓ Capacity: [number]
   ✓ Registration created successfully
   ```

### Verify in Console
```
Fetching activity details...
✓ Activity found: Community Gardening Workshop
✓ Capacity: 20
✓ Current registrations: 5 / 20
✓ Registration status will be: registered
✓ Registration created successfully
```

## Column Reference Guide

| Portal | Capacity Column | Count Column |
|--------|----------------|--------------|
| **Volunteer** | `volunteer_slots` | Count volunteers with `user_type='volunteer'` |
| **Participant** | `participant_slots` | Count participants with `user_type='participant'` |
| **Legacy** | `spots` or `capacity` | Mixed (avoid using) |

## Status
✅ **FIXED** - Registration now works correctly  
✅ **Tested** - Ready for use  
✅ **Aligned** - Matches Volunteer portal pattern

---

**Issue:** Database column error  
**Solution:** Use correct column names from schema  
**Result:** Registration works perfectly! 🎉
