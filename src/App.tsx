import { Routes, Route, Navigate, Link } from "react-router-dom";
import VolunteerHome from "./pages/VolunteerHome";
import VolunteerCommitments from "./pages/VolunteerCommitments";

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/volunteer" style={{ marginRight: 16 }}>
          Volunteer Home
        </Link>
        <Link to="/volunteer/commitments">My Commitments</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/volunteer" replace />} />
        <Route path="/volunteer" element={<VolunteerHome />} />
        <Route path="/volunteer/commitments" element={<VolunteerCommitments />} />
      </Routes>
    </div>
  );
}
