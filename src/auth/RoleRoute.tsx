import { Navigate, Outlet } from "react-router-dom";
import { getMockRole, isMockAuthed } from "./roles";
import type { Role } from "./roles";

export default function RoleRoute({ allow }: { allow: Role[] }) {
  const authed = isMockAuthed();
  const role = getMockRole();

  if (!authed || !role) return <Navigate to="/login" replace />;

  if (!allow.includes(role)) {
    return <Navigate to={`/${role}`} replace />;
  }

  return <Outlet />;
}
