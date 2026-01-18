import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearMockAuth } from "../auth/roles";

export default function ParticipantLayout() {
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-4 py-2 rounded-md text-sm font-medium transition",
      isActive
        ? "bg-white shadow border text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
    ].join(" ");

  const handleLogout = () => {
    clearMockAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/logo.png"
              alt="MINDS"
              className="h-10 w-auto"
            />
          </div>

          {/* Nav Tabs */}
          <div className="flex-1">
            <div className="bg-gray-100 border rounded-lg px-2 py-2 flex gap-2 justify-center">
              <NavLink to="/participant" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/participant/calendar" className={linkClass}>
                Calendar
              </NavLink>
              <NavLink to="/participant/my-activities" className={linkClass}>
                My Activities
              </NavLink>
              <NavLink to="/participant/profile" className={linkClass}>
                My Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium transition text-gray-600 hover:text-gray-900 hover:bg-white/60"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
