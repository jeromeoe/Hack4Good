# 🔧 Profile Save Issue - Debugging Guide

## Status
✅ Email field mapping is **ALREADY FIXED** in code (line 191)  
⏳ Need to check console for actual error

## What We Know

### Code Status
The `updateParticipantProfile` function in `participantHooks.ts` **already includes** the email field mapping:

```typescript
if (updates.name !== undefined) dbUpdates.full_name = updates.name;
if (updates.email !== undefined) dbUpdates.email = updates.email; // ✅ THIS EXISTS
if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
if (updates.age !== undefined) dbUpdates.age = updates.phone;
if (updates.disability !== undefined) dbUpdates.disability = updates.disability;
if (updates.photoDataUrl !== undefined) dbUpdates.photo_url = updates.photoDataUrl;
```

### Enhanced Error Logging
I've added detailed error logging to help identify the actual problem:

```typescript
if (error) {
  console.error('❌ Error updating profile:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
  console.error('Attempted updates:', dbUpdates);
  return false;
}
```

## How to Debug

### Step 1: Open Browser Console
1. Press `F12` or right-click → "Inspect"
2. Go to "Console" tab
3. Clear console (trash icon)

### Step 2: Make a Change
1. Go to "My Profile" tab
2. Change any field (name, email, phone, etc.)
3. Wait 1 second for auto-save
4. Watch console output

### Step 3: Check Console Output

#### If Successful:
```
Auto-saving profile changes...
=== Updating profile ===
User ID: [your-uuid]
Updates to apply: {full_name: "...", email: "...", ...}
✓ Profile updated successfully
```

#### If Failed:
```
Auto-saving profile changes...
=== Updating profile ===
User ID: [your-uuid]
Updates to apply: {full_name: "...", email: "...", ...}
❌ Error updating profile: [error object]
Error details: {
  code: "...",
  message: "...",
  details: "...",
  hint: "..."
}
Attempted updates: {...}
```

## Possible Issues & Solutions

### Issue 1: RLS (Row Level Security) Policy
**Error Code:** `42501` or message contains "policy"

**Problem:** Supabase RLS blocking the update

**Solution:**
```sql
-- Run in Supabase SQL Editor
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Issue 2: Missing Column
**Error Message:** "column does not exist"

**Problem:** Database schema mismatch

**Solution:** Check which column is missing and add it to the database

### Issue 3: Data Type Mismatch
**Error Code:** `22P02` or "invalid input syntax"

**Problem:** Sending wrong data type (e.g., string instead of number)

**Solution:** Check the `dbUpdates` object in console - see what values are being sent

### Issue 4: Null Constraint Violation
**Error Code:** `23502`

**Problem:** Trying to set a required field to null

**Solution:** Ensure required fields always have values

### Issue 5: Session Expired
**Error Message:** "JWT expired" or "Invalid token"

**Problem:** User session expired

**Solution:** Log out and log back in

## Quick Test

### Test 1: Simple Name Change
```bash
1. Go to My Profile
2. Change name to "Test User"
3. Wait 1 second
4. Check console
5. Copy entire error output
```

### Test 2: Check Database Directly
```sql
-- Run in Supabase SQL Editor
SELECT * FROM profiles 
WHERE id = '[your-user-id]';
```

### Test 3: Manual Update Test
```sql
-- Try updating directly in Supabase
UPDATE profiles
SET full_name = 'Manual Test'
WHERE id = '[your-user-id]';
```

If this works but the app doesn't, it's likely an RLS issue.

## Common Fixes

### Fix 1: Clear Browser Cache
```
1. Press Ctrl+Shift+Delete (Cmd+Shift+Delete on Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh page
```

### Fix 2: Hard Refresh
```
Press Ctrl+F5 (Cmd+Shift+R on Mac)
```

### Fix 3: Check Supabase Connection
```typescript
// Add this temporarily to ParticipantProfile.tsx
useEffect(() => {
  supabase.auth.getUser().then(({ data, error }) => {
    console.log('Auth check:', { data, error });
  });
}, []);
```

### Fix 4: Verify Profile Loaded
```typescript
// Check if profile is actually loaded
console.log('Profile state:', profile);
console.log('Form data:', formData);
```

## Files Modified
- ✅ `src/lib/participantHooks.ts` - Added detailed error logging

## Next Steps

1. **Run the app and reproduce the error**
2. **Copy the ENTIRE console output** when "Failed to save" appears
3. **Share the console output** - this will tell us the exact problem
4. **Check Supabase dashboard** - look at the profiles table RLS policies

## Status Check

Run this to verify the fix is in place:
```bash
grep -n "if (updates.email" /Users/shanice/Downloads/Hack4Good/src/lib/participantHooks.ts
```

Should show:
```
191:    if (updates.email !== undefined) dbUpdates.email = updates.email;
```

---

**The email field IS being mapped. We need to see the console error to identify the real problem.**

Please reproduce the error and share the console output! 🔍
