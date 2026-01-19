import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RoleRoute from "./auth/RoleRoute";
import VolunteerLayout from "./layouts/VolunteerLayout";
import ParticipantLayout from "./layouts/ParticipantLayout";
import StaffLayout from "./layouts/StaffLayout";

import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCalendar from "./pages/VolunteerCalendar";
import VolunteerActivities from "./pages/VolunteerActivities";
import VolunteerProfile from "./pages/VolunteerProfile";
import MyAccount from "./pages/MyAccount";

import ParticipantHome from "./pages/ParticipantHome";
import ParticipantProfile from "./pages/ParticipantProfile";
import ParticipantCalendar from "./pages/ParticipantCalendar";
import ParticipantMyActivities from "./pages/ParticipantMyActivities";
import ParticipantRegister from "./pages/ParticipantRegister";

import StaffHome from "./pages/StaffHome";
import StaffActivities from "./pages/StaffActivities";

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
          <Route path="profile" element={<VolunteerProfile />} />
          <Route path="account" element={<MyAccount />} />
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
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<StaffHome />} />
          <Route path="activities" element={<StaffActivities />} />
        </Route>
      </Route>

      {/* Fallback Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
