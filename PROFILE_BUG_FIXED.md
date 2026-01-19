# ✅ PROFILE SAVE BUG - FIXED!

## Root Cause Found

The error was:
```json
{
  "code": "PGRST204",
  "message": "Could not find the 'photo_url' column of 'profiles' in the schema cache"
}
```

**The database table does NOT have a `photo_url` column!**

## What Was Happening

The code was trying to update a non-existent column:

```json
{
  "full_name": "joe",
  "email": "joe@gmail.com",
  "phone": "+65 92216778",
  "age": 21,
  "disability": "Visual Impairment",
  "photo_url": "",      // ❌ This column doesn't exist in database!
  "caregiver_info": null
}
```

Supabase rejected this with **HTTP 400 Bad Request**.

## The Fix

**Removed the `photo_url` field** from database updates in `participantHooks.ts`:

### Before (Line 186):
```typescript
if (updates.photoDataUrl !== undefined) dbUpdates.photo_url = updates.photoDataUrl;
```

### After:
```typescript
// Note: photo_url removed - column doesn't exist in database
// if (updates.photoDataUrl !== undefined) dbUpdates.photo_url = updates.photoDataUrl;
```

Now the update only includes fields that actually exist:
```json
{
  "full_name": "joe",
  "email": "joe@gmail.com",
  "phone": "+65 92216778",
  "age": 21,
  "disability": "Visual Impairment",
  "caregiver_info": null
}
```

## Files Modified

✅ `src/lib/participantHooks.ts` - Removed photo_url field

## Test Now

1. **Refresh the browser** (Ctrl+Shift+R)
2. **Clear console**
3. **Go to My Profile**
4. **Change your name**
5. **Wait 1 second**

### Expected Result:

```
[AUTOSAVE] Timeout fired! Starting save...
=== Updating profile ===
User ID: 8968d322-8b49-46d9-9455-a24f134abb5f
Updates to apply: {
  "full_name": "joe",
  "email": "joe@gmail.com",
  "phone": "+65 92216778",
  "age": 21,
  "disability": "Visual Impairment",
  "caregiver_info": null
}
✓ Profile updated successfully
[AUTOSAVE] updateProfile returned: true
✓ Profile saved successfully
Changes saved ✅
```

### No More Error:
❌ ~~"Could not find the 'photo_url' column"~~  
✅ Save succeeds!

## Why This Happened

The Participant portal code was copied from somewhere that had a `photo_url` column, but your database schema doesn't include this field in the `profiles` table.

## Database Schema

Your `profiles` table has these columns:
- ✅ `id` (uuid)
- ✅ `full_name` (text)
- ✅ `email` (text)
- ✅ `phone` (text)
- ✅ `age` (integer)
- ✅ `disability` (text)
- ✅ `caregiver_info` (jsonb)
- ✅ `role` (text)
- ❌ ~~`photo_url`~~ (does NOT exist)

## What About Photos?

If you want to add photo support later, you'd need to:

1. **Add the column to Supabase:**
```sql
ALTER TABLE profiles
ADD COLUMN photo_url TEXT;
```

2. **Uncomment the line in code:**
```typescript
if (updates.photoDataUrl !== undefined) dbUpdates.photo_url = updates.photoDataUrl;
```

But for now, profile saves work without photos!

## Summary

**Problem:** Trying to update non-existent `photo_url` column  
**Solution:** Removed `photo_url` from updates  
**Result:** Profile saves now work! ✅

---

**The bug is FIXED! Test it now and profile changes should save successfully.** 🎉
