# 🔍 How to Check Browser Console - Step by Step

## The Issue
You're looking at the terminal (command line), but we need the **browser console** (in Chrome/Firefox/Safari).

The terminal shows:
```
VITE v7.3.1  ready in 164 ms
➜  Local:   http://localhost:5173/
```

This is GOOD ✅ - Your dev server is running!

But logs appear in the **browser**, not here.

---

## Step-by-Step: Open Browser Console

### Step 1: Open the App in Browser
1. Open your web browser (Chrome, Firefox, or Safari)
2. Go to: `http://localhost:5173/`
3. You should see the Hack4Good app

### Step 2: Open Developer Tools (Browser Console)

**On Mac:**
- Chrome/Edge: Press `Cmd + Option + J`
- Firefox: Press `Cmd + Option + K`
- Safari: Press `Cmd + Option + C`

**Or use the menu:**
- Right-click anywhere on the page
- Click "Inspect" or "Inspect Element"
- Click the "Console" tab

### Step 3: You Should See
A panel that looks like this:

```
Console
▶ Elements  ▶ Console  ▶ Sources  ▶ Network
---------------------------------------------
> 
```

### Step 4: Check Console Filter
At the top of the console, make sure:
- ✅ "All levels" is selected (not just "Errors")
- ✅ No text in the filter box
- ✅ "Preserve log" is checked (gear icon ⚙️)

---

## What to Look For

### When Page Loads
You should see logs like:
```
[AUTOSAVE] Effect triggered
[AUTOSAVE] Profile exists? true
=== fetchParticipantProfile START ===
✓ Profile found: John Doe
```

### When You Make a Change
1. Go to "My Profile" tab
2. Click in the "Name" field
3. Type one letter
4. You should IMMEDIATELY see:
```
[AUTOSAVE] Cleanup function registered
[AUTOSAVE] Effect triggered
[AUTOSAVE] Setting up 1-second timeout...
```

5. Wait 1 second
6. You should see:
```
[AUTOSAVE] Timeout fired! Starting save...
[CONTEXT] updateProfile called
=== Updating profile ===
```

---

## If You See Red Errors

Look for messages in red like:
```
❌ Error: ...
Uncaught TypeError: ...
Failed to fetch: ...
```

Copy the ENTIRE error message.

---

## Screenshot Guide

Here's what to look for:

### ✅ CORRECT - Browser Console (What we need)
```
┌─────────────────────────────────────────┐
│ localhost:5173                          │
├─────────────────────────────────────────┤
│ [Your App Content Here]                 │
│                                         │
└─────────────────────────────────────────┘
┌─ Developer Tools ──────────────────────┐
│ Elements Console Sources Network       │
├────────────────────────────────────────┤
│ > [AUTOSAVE] Effect triggered          │
│ > [AUTOSAVE] Profile exists? true      │
│ > ✓ Profile found: John Doe            │
└────────────────────────────────────────┘
```

### ❌ WRONG - Terminal (What you showed me)
```
Terminal
$ npm run dev
VITE v7.3.1  ready in 164 ms
➜  Local:   http://localhost:5173/
```

---

## Quick Test

1. Open browser to `http://localhost:5173/`
2. Right-click on the page
3. Click "Inspect"
4. Click "Console" tab
5. Type this in the console:
   ```javascript
   console.log('TEST - Console is working!')
   ```
6. Press Enter

You should see:
```
> console.log('TEST - Console is working!')
< TEST - Console is working!
```

If you see this ✅ - Console is working!

---

## Common Issues

### Issue 1: Can't Find "Inspect"
**Solution:** Try keyboard shortcut:
- Mac: `Cmd + Option + J`
- Windows: `Ctrl + Shift + J`

### Issue 2: Safari - Console Disabled
**Solution:**
1. Safari → Preferences
2. Advanced tab
3. Check "Show Develop menu in menu bar"
4. Then: Develop → Show JavaScript Console

### Issue 3: Console is Blank
**Solution:**
1. Click the "Console" tab (not Elements or Network)
2. Check filter settings (⚙️ gear icon)
3. Refresh the page (F5 or Cmd+R)

---

## What to Share

Once you open the browser console:

1. **Go to My Profile tab**
2. **Make a change** (type in any field)
3. **Wait 2 seconds**
4. **Take a screenshot** of the console
   - Or copy ALL the text from console
   - Include EVERYTHING, even if it seems unrelated

Share:
- ✅ Screenshot of browser console
- ✅ Any red error messages
- ✅ All `[AUTOSAVE]` and `[CONTEXT]` logs

---

## Video Tutorial (Steps)

1. **Open browser** → Go to localhost:5173
2. **Press F12** (or right-click → Inspect)
3. **Click "Console" tab**
4. **Refresh page** (F5)
5. **Go to "My Profile"**
6. **Type in a field**
7. **Watch console output**
8. **Copy everything and share**

---

## Need Help?

If you're still stuck, share:
1. What browser are you using? (Chrome/Firefox/Safari)
2. Screenshot of your browser window
3. Screenshot after pressing F12

We'll get this figured out! 🔍

---

**Remember: The terminal (where npm run dev is) will stay the same. We need the BROWSER console!**
