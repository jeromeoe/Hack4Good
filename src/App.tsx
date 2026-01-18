import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RoleRoute from "./auth/RoleRoute";
import VolunteerLayout from "./layouts/VolunteerLayout";
import ParticipantLayout from "./layouts/ParticipantLayout";

import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCommitments from "./pages/VolunteerCommitments";
import VolunteerCalendar from "./pages/VolunteerCalendar";
import VolunteerActivities from "./pages/VolunteerActivities";

import ParticipantHome from "./pages/ParticipantHome";
import ParticipantProfile from "./pages/ParticipantProfile";
import ParticipantCalendar from "./pages/ParticipantCalendar";
import ParticipantMyActivities from "./pages/ParticipantMyActivities";
import ParticipantRegister from "./pages/ParticipantRegister";

import StaffHome from "./pages/StaffHome";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<ParticipantRegister />} />

      {/* ✅ Volunteer Portal (with layout/navbar) */}
      <Route element={<RoleRoute allow={["volunteer"]} />}>
        <Route path="/volunteer" element={<VolunteerLayout />}>
          <Route index element={<VolunteerHome />} />
          <Route path="calendar" element={<VolunteerCalendar />} />
          <Route path="activities" element={<VolunteerActivities />} />
          <Route path="commitments" element={<VolunteerCommitments />} />
        </Route>
      </Route>

      {/* ✅ Participant Portal (with layout/navbar) */}
      <Route element={<RoleRoute allow={["participant"]} />}>
        <Route path="/participant" element={<ParticipantLayout />}>
          <Route index element={<ParticipantHome />} />
          <Route path="profile" element={<ParticipantProfile />} />
          <Route path="calendar" element={<ParticipantCalendar />} />
          <Route path="my-activities" element={<ParticipantMyActivities />} />
        </Route>
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
