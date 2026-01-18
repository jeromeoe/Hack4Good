import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RoleRoute from "./auth/RoleRoute";
import VolunteerLayout from "./layouts/VolunteerLayout";

import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCommitments from "./pages/VolunteerCommitments";
import VolunteerCalendar from "./pages/VolunteerCalendar";
import VolunteerActivities from "./pages/VolunteerActivities";

import ParticipantHome from "./pages/ParticipantHome";
import StaffHome from "./pages/StaffHome";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ✅ Volunteer Portal (with layout/navbar) */}
      <Route element={<RoleRoute allow={["volunteer"]} />}>
        <Route path="/volunteer" element={<VolunteerLayout />}>
          <Route index element={<VolunteerHome />} />
          <Route path="calendar" element={<VolunteerCalendar />} />
          <Route path="activities" element={<VolunteerActivities />} />
          <Route path="commitments" element={<VolunteerCommitments />} />
        </Route>
      </Route>

      {/* Participant Portal */}
      <Route element={<RoleRoute allow={["participant"]} />}>
        <Route path="/participant" element={<ParticipantHome />} />
      </Route>

      {/* Staff Portal */}
      <Route element={<RoleRoute allow={["staff"]} />}>
        <Route path="/staff" element={<StaffHome />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
