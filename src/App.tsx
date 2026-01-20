import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RoleRoute from "./auth/RoleRoute";
import VolunteerLayout from "./layouts/VolunteerLayout";
import ParticipantLayout from "./layouts/ParticipantLayout";
import StaffLayout from "./layouts/StaffLayout";

import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCommitments from "./pages/VolunteerCommitments";
import VolunteerCalendar from "./pages/VolunteerCalendar";
import VolunteerActivities from "./pages/VolunteerActivities";
import MyAccount from "./pages/MyAccount";

import ParticipantHome from "./pages/ParticipantHome";
import ParticipantProfile from "./pages/ParticipantProfile";
import ParticipantCalendar from "./pages/ParticipantCalendar";
import ParticipantMyActivities from "./pages/ParticipantMyActivities";
import ParticipantRegister from "./pages/ParticipantRegister";

import StaffHome from "./pages/StaffHome";
import StaffActivities from "./pages/StaffActivities";

// your admin imports
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import ActivitiesPage from "./pages/admin/activities/ActivitiesPage";
import RegistrationsPage from "./pages/admin/registrations/RegistrationsPage";
import UsersOverviewPage from "./pages/admin/users/UsersOverviewPage";
import StaffCrudPage from "./pages/admin/users/StaffCrudPage";
import VolunteersPage from "./pages/admin/volunteers/VolunteersPage";
import ReportsPage from "./pages/admin/reports/ReportsPage";
import SettingsPage from "./pages/admin/settings/SettingsPage";

// ✅ IMPORT THE PROVIDER
import { VolunteerActivitiesProvider } from "./lib/VolunteerActivitiesContext"; 

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<ParticipantRegister />} />

      <Route element={<RoleRoute allow={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="users" element={<UsersOverviewPage />} />
          <Route path="users/staff" element={<StaffCrudPage />} />
          <Route path="volunteers" element={<VolunteersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* ✅ FIXED: Wrapped Volunteer Portal in the Provider */}
      <Route element={<RoleRoute allow={["volunteer"]} />}>
        <Route path="/volunteer" element={
          <VolunteerActivitiesProvider>
            <VolunteerLayout />
          </VolunteerActivitiesProvider>
        }>
          <Route index element={<VolunteerHome />} />
          <Route path="calendar" element={<VolunteerCalendar />} />
          <Route path="activities" element={<VolunteerActivities />} />
          <Route path="commitments" element={<VolunteerCommitments />} />
          <Route path="account" element={<MyAccount />} />
        </Route>
      </Route>

      {/* Participant Portal */}
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