import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const isAuthed = localStorage.getItem("mock_authed") === "true";

  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
