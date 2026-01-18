import { Routes, Route, Navigate } from "react-router-dom";

import VolunteerLayout from "./layouts/VolunteerLayout";
import ParticipantLayout from "./layouts/ParticipantLayout";

import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCalendar from "./pages/VolunteerCalendar";
import VolunteerActivities from "./pages/VolunteerActivities";

import ParticipantHome from "./pages/ParticipantHome";
import StaffHome from "./pages/StaffHome";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Volunteer Portal */}
      <Route path="/volunteer" element={<VolunteerLayout />}>
        <Route index element={<VolunteerHome />} />
        <Route path="calendar" element={<VolunteerCalendar />} />
        <Route path="activities" element={<VolunteerActivities />} />
        <Route path="commitments" element={<VolunteerCommitments />} />

      {/* Participant Portal */}
      <Route element={<RoleRoute allow={["participant"]} />}>
        <Route path="/participant" element={<ParticipantHome />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/volunteer" replace />} />
    </Routes>
  );
}
