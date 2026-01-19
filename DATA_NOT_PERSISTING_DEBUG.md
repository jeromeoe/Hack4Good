# 🔍 DATA NOT PERSISTING - Debugging Guide

## Problem
Changes save successfully (no errors), but when you log out and log back in, the changes are gone. Data is also not showing in the Supabase database table.

## Possible Causes

### 1. Row Level Security (RLS) Blocking Updates
**Symptom:** No error shown, but data doesn't save  
**Cause:** Supabase RLS policy prevents UPDATE but allows SELECT

**Check:**
1. Go to Supabase Dashboard
2. Click on "Authentication" → "Policies"
3. Find `profiles` table policies
4. Look for UPDATE policy

**Fix if missing:**
```sql
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 2. Silent Transaction Failure
**Symptom:** Returns success but doesn't actually save  
**Cause:** Supabase transaction fails silently

**Debug:** Check new console logs I added:
```
🔹 Executing Supabase UPDATE query...
🔹 Supabase response received
Updated data: [...]
Error: null
```

### 3. Wrong User ID
**Symptom:** Updating wrong profile or no profile  
**Cause:** User ID mismatch between auth and database

**Check:** Look for logs:
```
User ID: [uuid]
```

Make sure this UUID matches your profile ID in Supabase.

### 4. Database Trigger Reverting Changes
**Symptom:** Saves but gets overwritten immediately  
**Cause:** Database trigger or function reverting the update

**Check:** In Supabase SQL Editor:
```sql
SELECT * FROM profiles WHERE id = 'your-user-id';
```

Run immediately after saving to see if data is there.

## Testing Steps

### Step 1: Make a Change
1. Open browser console (F12)
2. Clear console
3. Go to My Profile
4. Change name to "TEST123"
5. Wait 1 second

### Step 2: Check Console Output
Look for these logs in order:

```
[AUTOSAVE] Changes detected - setting up 1-second timeout...
[AUTOSAVE] Timeout fired! Starting save...
[AUTOSAVE] Calling updateProfile...
[CONTEXT] updateProfile called
[CONTEXT] Calling updateProfileInDB...
=== Updating profile ===
User ID: [your-uuid]
Updates to apply: {
  "full_name": "TEST123",
  ...
}
🔹 Executing Supabase UPDATE query...
🔹 Supabase response received
Updated data: [...]  ← IMPORTANT!
Error: null  ← IMPORTANT!
✓ Profile updated successfully
```

**What to look for:**
- ✅ `Updated data: [array with your data]` - Data was written
- ❌ `Updated data: null` or `[]` - Nothing was written
- ❌ `Error: {object}` - There was an error

### Step 3: Check Supabase Immediately
1. **Don't refresh the page yet**
2. Open Supabase Dashboard
3. Go to Table Editor → `profiles`
4. Find your row (search by your user ID)
5. Check if `full_name` is "TEST123"

**Result:**
- ✅ Data is there → RLS and update are working, issue is elsewhere
- ❌ Data is NOT there → RLS or update is failing

### Step 4: Check After Refresh
1. Refresh the page (F5)
2. Check if name is still "TEST123"

**Result:**
- ✅ Name is "TEST123" → Data persists in app state
- ❌ Name reverted → Not persisting to database

### Step 5: Check After Logout/Login
1. Logout
2. Login again
3. Go to My Profile
4. Check if name is "TEST123"

**Result:**
- ✅ Name is "TEST123" → Everything works!
- ❌ Name reverted → Data not in database

## Diagnostic Queries

Run these in Supabase SQL Editor:

### Check if row exists:
```sql
SELECT * FROM profiles WHERE id = 'YOUR-USER-ID';
```

### Check RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Check recent updates (if you have logging):
```sql
SELECT * FROM profiles 
WHERE id = 'YOUR-USER-ID' 
ORDER BY updated_at DESC 
LIMIT 1;
```

### Try manual update:
```sql
UPDATE profiles
SET full_name = 'MANUAL TEST'
WHERE id = 'YOUR-USER-ID';

-- Then check
SELECT full_name FROM profiles WHERE id = 'YOUR-USER-ID';
```

**If manual update works:**
→ RLS is fine, issue is in the app code

**If manual update fails:**
→ RLS policy or permissions issue

## Common Issues & Solutions

### Issue 1: No UPDATE Policy
**Symptoms:**
- Console shows success
- `Updated data: []` (empty array)
- Data not in database

**Solution:**
```sql
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### Issue 2: Wrong User ID
**Symptoms:**
- Console shows different user ID
- UPDATE happens to wrong row or no row

**Solution:**
Check authentication is working:
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Authenticated as:', user?.id);
```

### Issue 3: Session Expired
**Symptoms:**
- User object is null
- Function returns early

**Solution:**
Logout and login again with fresh session

### Issue 4: Database Column Mismatch
**Symptoms:**
- Error in console
- Specific field not updating

**Solution:**
Check column names match database schema

## What to Share

Please run the test above and share:

1. **Console output** after making a change (especially the `Updated data` line)
2. **Supabase table** screenshot showing your profile row
3. **User ID** from console logs
4. **Whether manual SQL UPDATE works** in Supabase

This will help identify exactly where the issue is!

## Next Steps

Based on what you find:

### If `Updated data: []` (empty):
→ RLS policy issue - need to add UPDATE policy

### If `Updated data: [your data]` but not in database:
→ Check for database triggers or constraints

### If `Error: {object}`:
→ Share the error details

### If everything looks good but still doesn't persist:
→ Check for concurrent sessions or caching issues

---

**Please test now and share the results!** 🔍
