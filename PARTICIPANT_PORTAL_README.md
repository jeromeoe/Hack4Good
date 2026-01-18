# MINDS Charity Website - Participant/Caregiver Portal

This update adds a complete **Participant/Caregiver Portal** to the MINDS charity website, designed to reduce friction in activity sign-ups for both individuals and caregivers.

## 🎯 Features Implemented

### A) Participant/Caregiver Portal

#### 1. **Registration**
- **Page:** `/register` (ParticipantRegister.tsx)
- Email-based registration with mock data
- Collects participant information:
  - Name, email, phone number
  - Age and disability type
- Optional caregiver information:
  - Caregiver name, email, phone
  - Checkbox to indicate caregiver registration
- Password creation and confirmation
- All information automatically saved to profile

#### 2. **Participant Profile** (`/participant/profile`)
- View and edit basic information:
  - Personal details (name, age, email, phone)
  - Disability type
  - Caregiver information (if applicable)
- Inline editing with save/cancel functionality
- Success notifications on profile updates

#### 3. **Activity Calendar** (`/participant/calendar`)
- Grid view of all available activities
- Comprehensive filtering system:
  - **Date filter:** All dates, Today, Next 7 days, Next 30 days
  - **Location filter:** Filter by specific venues
  - **Suitability filter:** Show all activities or only suitable for participant's disability
  - **Availability filter:** Toggle to show only available activities
- Activity cards display:
  - Title, date/time, location
  - Registration status (Registered, Waitlisted, Full, Available)
  - Quick accessibility indicators
  - Capacity (registered/total)
  - Clash warnings
- Click on any activity to view detailed information

#### 4. **Activity Details Modal**
- Comprehensive activity information:
  - Full description
  - Date, time, and location
  - Meeting point
  - Meals provided status
  - Detailed accessibility features:
    - Wheelchair accessible
    - Visually impaired friendly
    - Hearing impaired friendly
    - Intellectual disability friendly
    - Autism friendly
  - Suitable disability types
  - Current capacity
- Register/Withdraw button
- Clash detection warnings

#### 5. **My Activities Page** (`/participant/my-activities`)
- View all registered activities
- Separated into:
  - **Upcoming Activities:** Shows days until event, meeting point
  - **Past Activities:** Marked as completed
- Summary statistics:
  - Total registered
  - Upcoming count
  - Past count
- Quick actions:
  - View details
  - Withdraw from activity
- Empty state with link to browse activities

#### 6. **Dashboard/Home** (`/participant`)
- Welcome message with participant name
- Statistics cards:
  - Number of registered activities
  - Activities this week (with weekly limit indicator)
  - Available activities count
- Preview of 3 upcoming activities
- Recommended activities section (3 suggestions)
- Quick links to relevant pages

#### 7. **Safety Features**
- **Clash Detection:** Warns when registering for overlapping activities
- **Weekly Limit:** Maximum 3 activities per week with warnings
- **Waitlist Support:** Automatic waitlist when activity is full
- Toast notifications for all actions (success/warning/error)

---

## 🗂️ File Structure

### New Files Created:

```
src/
├── layouts/
│   └── ParticipantLayout.tsx          # Layout with navigation for participant portal
├── pages/
│   ├── ParticipantHome.tsx            # Dashboard/home page
│   ├── ParticipantProfile.tsx         # Profile view/edit page
│   ├── ParticipantCalendar.tsx        # Activity calendar with filters
│   ├── ParticipantMyActivities.tsx    # Registered activities page
│   └── ParticipantRegister.tsx        # Registration page
├── components/
│   ├── ParticipantFilters.tsx         # Filter component for calendar
│   └── ActivityDetailModal.tsx        # Modal for activity details
├── lib/
│   └── ParticipantActivitiesContext.tsx  # State management context
└── types/
    └── participant.ts                 # TypeScript types
```

### Modified Files:

```
src/
├── App.tsx                            # Added participant routes with layout
└── main.tsx                           # Wrapped app with ParticipantActivitiesProvider
```

---

## 🎨 Design Features

- **Consistent UI:** Matches existing volunteer portal design
- **Responsive:** Works on mobile and desktop
- **Accessible:** Color-coded status badges, clear labels
- **User-friendly:** Toast notifications, clear CTAs, intuitive navigation
- **Professional:** Clean layout with proper spacing and typography

---

## 📊 Mock Data

The system includes comprehensive mock data with 6 sample activities featuring:
- Various disability suitability profiles
- Different accessibility features
- Mixed capacity levels (some full, some available)
- Diverse locations and times
- Realistic activity descriptions

---

## 🔧 Technical Implementation

### State Management
- Uses React Context API (`ParticipantActivitiesContext`)
- Centralized state for activities, profile, and filters
- Helper functions for clash detection and weekly limits

### Routing
- Protected routes using `RoleRoute` component
- Nested routes under `ParticipantLayout`
- Automatic redirects based on user role

### TypeScript
- Fully typed components and data structures
- Type-safe disability and accessibility enums
- Proper interface definitions

### Features
- Real-time filtering without page reload
- Modal-based activity details
- Form validation for registration and profile editing
- Automatic toast notification dismissal

---

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Access the participant portal:**
   - Go to `/login`
   - Select "Participant" from the role dropdown
   - Login with any email/password (mock authentication)
   - Or register as a new participant at `/register`

---

## 🔄 Future Enhancements

Potential improvements for production:
- Real database integration (Supabase/PostgreSQL)
- Email notifications for activity confirmations
- Calendar sync (Google Calendar, iCal)
- Advanced search and filtering
- Activity recommendations based on past participation
- Feedback/rating system for completed activities
- Print-friendly attendance confirmations
- Multi-language support

---

## 📝 Notes

- All authentication is currently mock-based (localStorage)
- No Supabase integration (as per requirements)
- Data resets on page refresh
- Weekly limits and clash detection work in real-time
- All features are fully functional for demo/testing purposes

---

## 👥 User Flow

1. **Registration:** User registers as participant/caregiver
2. **Login:** User logs in and is directed to participant portal
3. **Browse:** User views activity calendar with filters
4. **Details:** User clicks activity to see full details
5. **Register:** User registers for suitable activities
6. **Manage:** User views/manages registrations in "My Activities"
7. **Profile:** User can update profile information anytime

---

## ✅ Completed Requirements

- ✅ Register via email (mock data)
- ✅ Collect personal information (participant + caregiver)
- ✅ Auto-save to profile
- ✅ View/edit profile (disability, age, contact info)
- ✅ Activity calendar with filters
- ✅ Filter by disability suitability
- ✅ View activity details (location, meeting point, meals, wheelchair access, etc.)
- ✅ Sign up/withdraw functionality
- ✅ "My Activities" page
- ✅ Clash detection warnings
- ✅ Weekly limit warnings (max 3/week)
