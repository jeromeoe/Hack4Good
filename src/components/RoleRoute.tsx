import { Navigate, Outlet, useLocation } from "react-router-dom";

type Props = {
  allow: Array<"participant" | "staff" | "volunteer">;
};

function getRoleFromStorage(): string {
  // Support multiple keys (merge-friendly)
  return (
    localStorage.getItem("minds_role") ||
    localStorage.getItem("role") ||
    localStorage.getItem("user_role") ||
    ""
  );
}

function isLoggedInFromStorage(): boolean {
  // Support multiple keys (merge-friendly)
  const a = localStorage.getItem("minds_logged_in") === "true";
  const b = localStorage.getItem("logged_in") === "true";
  const c = Boolean(localStorage.getItem("token"));
  return a || b || c;
}

export default function RoleRoute({ allow }: Props) {
  const loc = useLocation();

  const loggedIn = isLoggedInFromStorage();
  const role = getRoleFromStorage();

  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (!allow.includes(role as any)) {
    // if they are logged in but wrong role, send to their home
    if (role === "participant") return <Navigate to="/participant" replace />;
    if (role === "staff") return <Navigate to="/staff" replace />;
    if (role === "volunteer") return <Navigate to="/volunteer" replace />;

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
