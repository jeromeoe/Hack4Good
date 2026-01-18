import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCommitments from "./pages/VolunteerCommitments";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected area */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/volunteer" replace />} />
        <Route path="/volunteer" element={<VolunteerHome />} />
        <Route path="/volunteer/commitments" element={<VolunteerCommitments />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}