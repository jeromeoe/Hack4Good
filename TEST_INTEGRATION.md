# 🧪 QUICK TEST GUIDE: Staff → Participant Integration

## ⚡ 5-Minute Test

### Step 1: Login as Staff (1 min)
1. Go to `/login`
2. Login with staff credentials
3. Navigate to `/staff/activities`

### Step 2: Create Test Activity (2 min)
Click "New Activity" and fill in:

```
✏️ Title: Integration Test Activity
📋 Type: Social
📅 Date: [Tomorrow's date]
⏰ Time: 14:00 to 16:00
📍 Location: Marina Bay Sands
📌 Meeting Venue: Main Lobby
👥 Volunteers: 3
🎯 Participants: 15
♿ Access: Universal
📝 Notes: This is a test activity to verify integration
```

Click **Save Changes**

### Step 3: Verify in Participant Portal (2 min)
1. Open new tab/incognito window
2. Go to `/login`
3. Login with participant credentials
4. Navigate to `/participant/calendar`
5. Click tomorrow's date

**Expected Results:**
- ✅ See "Integration Test Activity"
- ✅ Shows "2:00 PM – 4:00 PM"
- ✅ Shows "Marina Bay Sands"
- ✅ Shows "0/15 registered"
- ✅ Click activity to see full details
- ✅ See "Meeting point: Main Lobby"
- ✅ See "This is a test activity..."
- ✅ All accessibility badges are checked ✓
- ✅ Can click "Register" button

### Step 4: Test Registration (30 sec)
1. Click "Register" button
2. Check that:
   - ✅ Success message appears
   - ✅ Count updates to "1/15 registered"
   - ✅ Badge changes to "✓ Registered"
   - ✅ Activity appears in "My Activities"

---

## 🔍 Detailed Test Scenarios

### Test A: Different Accessibility Levels

Create 4 activities with different access levels:

| Activity | Access Level | Participant Should See |
|----------|-------------|----------------------|
| Swimming | Universal | ✅ All accessibility badges checked |
| Dance Workshop | Ambulant | ❌ Wheelchair not accessible |
| Art Exhibition | Wheelchair Friendly | ✅ Wheelchair accessible only |
| Music Concert | Sensory Friendly | ✅ Sensory-related badges checked |

**Test Process:**
1. Create each activity as staff
2. View in participant calendar
3. Click each activity
4. Verify accessibility badges match table above

### Test B: Suitability Filtering

**Setup:**
1. Create activities with different access levels (use Test A)
2. Note your participant's disability type

**Test:**
1. Go to participant calendar
2. Enable "Only show suitable activities" filter
3. Verify only appropriate activities appear

**Expected Results:**

| Your Disability | Should See |
|----------------|-----------|
| Physical Disability | Universal + Wheelchair Friendly |
| Autism Spectrum | Universal + Sensory Friendly |
| Visual Impairment | Universal + Sensory Friendly + Ambulant |
| Any disability | Universal shows for everyone |

### Test C: Schedule Conflict Detection

**Setup:**
1. Create Activity A: Tomorrow 2:00 PM - 4:00 PM
2. Create Activity B: Tomorrow 3:00 PM - 5:00 PM (overlaps!)
3. Register for Activity A as participant

**Test:**
1. Try to register for Activity B
2. Should see: ⚠️ "Clash detected" warning
3. Can still register if you want (override)

### Test D: Weekly Limit

**Setup:**
1. Create 4 activities for this week

**Test:**
1. Register for 3 activities
2. Dashboard shows "You have registered for 3 activities this week (weekly limit reached)"
3. Try to register for 4th activity
4. Should see: ⚠️ "Weekly limit reached" warning

### Test E: Capacity and Waitlist

**Setup:**
1. Create activity with capacity of 2
2. Register 2 participants (use different accounts or manually insert)

**Test:**
1. As 3rd participant, try to register
2. Should see: "Added to waitlist" message
3. Badge shows "Waitlisted" instead of "Registered"

---

## 🐛 Common Issues & Solutions

### Issue: "No activities showing in calendar"

**Check:**
1. Did you create an activity with today's date or future?
2. Browser console (F12) - any errors?
3. Database query:
   ```sql
   SELECT * FROM activities WHERE date >= CURRENT_DATE;
   ```

**Solution:**
- Make sure `date` field has today or future date
- Check that activity was actually saved (refresh staff activities page)

### Issue: "Times showing incorrectly"

**Check:**
1. Time format in database (should be "HH:MM" like "14:00")
2. Browser timezone settings

**Solution:**
- Use 24-hour format in staff portal
- If showing AM/PM, times need to be converted to 24-hour

### Issue: "Profile Not Found" error

**Solution:**
- Follow the fixes in `COMPLETE_LOGIN_FIX.md`
- Make sure you're logged in as participant

### Issue: "Can't register for activity"

**Check:**
1. Are you logged in as participant?
2. Is activity at capacity?
3. Browser console for error messages

**Troubleshoot:**
```sql
-- Check registration status
SELECT 
  ar.participant_id,
  ar.status,
  a.title,
  a.participant_slots
FROM activity_registrations ar
JOIN activities a ON ar.activity_id = a.id
WHERE ar.participant_id = 'your-uuid';
```

---

## ✅ Success Checklist

After running all tests, verify:

- [ ] Activities created by staff appear in participant portal
- [ ] All dates and times are correct
- [ ] Locations and meeting points display properly
- [ ] Descriptions/comments show correctly
- [ ] Accessibility badges match disability_access setting
- [ ] Capacity tracking works (X/Y registered)
- [ ] Registration succeeds and updates count
- [ ] "My Activities" shows registered activities
- [ ] Schedule conflict detection works
- [ ] Weekly limit (3 activities) is enforced
- [ ] Waitlist works when activity is full
- [ ] Suitability filter shows only appropriate activities

---

## 📊 Quick Debug Queries

### See all activities with details:
```sql
SELECT 
  id, title, date, time_start, time_end, 
  location, participant_slots, disability_access
FROM activities 
WHERE date >= CURRENT_DATE 
ORDER BY date;
```

### See registrations for an activity:
```sql
SELECT 
  p.full_name,
  ar.status,
  ar.created_at
FROM activity_registrations ar
JOIN profiles p ON ar.participant_id = p.id
WHERE ar.activity_id = 123  -- Replace with activity ID
ORDER BY ar.created_at;
```

### See participant's activities:
```sql
SELECT 
  a.title,
  a.date,
  a.time_start,
  ar.status
FROM activity_registrations ar
JOIN activities a ON ar.activity_id = a.id
WHERE ar.participant_id = 'participant-uuid'
ORDER BY a.date;
```

---

## 🎯 Expected Behavior Summary

**Staff creates activity** → **Saves to database** → **Participant sees immediately**

No caching, no delays, no missing data. Everything works in real-time! ✨
