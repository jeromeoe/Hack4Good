import { Routes, Route, Navigate } from "react-router-dom";

import VolunteerLayout from "./layouts/VolunteerLayout";

import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCalendar from "./pages/VolunteerCalendar";
import VolunteerActivities from "./pages/VolunteerActivities";
import VolunteerCommitments from "./pages/VolunteerCommitments";
import MyAccount from "./pages/MyAccount";

export default function App() {
  return (
    <Routes>
      {/* Redirect root */}
      <Route path="/" element={<Navigate to="/volunteer" replace />} />

      {/* Volunteer Portal */}
      <Route path="/volunteer" element={<VolunteerLayout />}>
        <Route index element={<VolunteerHome />} />
        <Route path="calendar" element={<VolunteerCalendar />} />
        <Route path="activities" element={<VolunteerActivities />} />
        <Route path="commitments" element={<VolunteerCommitments />} />

        {/* ✅ My Account page */}
        <Route path="account" element={<MyAccount />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/volunteer" replace />} />
    </Routes>
  );
}
