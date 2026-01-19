# 🚀 Quick Start: Participant Supabase Integration

## What Changed?
Participant portal now uses the **unified `registrations` table** (same as Volunteer portal).

---

## Test It Now (2 minutes)

### 1. Start Server
```bash
cd /Users/shanice/Downloads/Hack4Good
npm run dev
```

### 2. Test Registration
1. Login as participant
2. Go to Activities page
3. Click "Register" on any activity
4. **See:** Green toast "✓ Successfully registered!"
5. **Check console:** Should show detailed logs

### 3. Test Cancellation
1. Click "Cancel Registration"
2. **See:** Toast "✓ Successfully cancelled"

### 4. Verify Database
Open Supabase → Run this query:
```sql
SELECT * FROM registrations 
WHERE user_type = 'participant' 
ORDER BY created_at DESC;
```

---

## Files Changed

1. `src/lib/participantHooks.ts` - Uses `registrations` table now
2. `src/lib/ParticipantActivitiesContext.tsx` - Added toast UI

---

## What to Look For

### ✅ Good Signs
- Toast notifications appear
- Console shows "✓" success messages
- Activities show as registered after refresh
- Database has records in `registrations` table

### ❌ Problem Signs
- No toast appears
- Console shows "❌" error messages
- Activities don't stay registered
- No records in database

---

## Common Issues

### No Toast Showing
**Fix:** Toast UI is now in ParticipantActivitiesContext - it should work automatically

### Registration Not Saving
**Check:** Console for error messages
**Look for:** "❌ Error creating registration"

### Wrong Count
**Check:** Database query filters by `user_type = 'participant'`

---

## Key Changes

### Before
```typescript
// Old: activity_registrations table
.from('activity_registrations')
.insert({
  participant_id: userId,
  activity_id: activityId
})
```

### After
```typescript
// New: registrations table
.from('registrations')
.insert({
  user_id: userId,
  activity_id: activityId,
  user_type: 'participant'  // ← New!
})
```

---

## Benefits

- ✅ Same table as Volunteers (unified data)
- ✅ Toast notifications (better UX)
- ✅ Better logging (easier debugging)
- ✅ Consistent code patterns

---

## Need Help?

1. Check console for error messages
2. Look at `PARTICIPANT_INTEGRATION_COMPLETE.md` for details
3. Verify Supabase table structure
4. Check that `registrations` table exists

---

## Status
✅ **Code Ready**  
⏳ **Needs Testing**  
📋 **Full Docs Available**

**Start testing now! 🚀**
