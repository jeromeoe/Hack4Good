import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AREA_OPTIONS } from "../lib/locations";
import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";
import { supabase } from "../lib/supabase";
import { clearMockAuth } from "../auth/roles";

export default function VolunteerLayout() {
  const navigate = useNavigate();
  const { filters, setFilters } = useVolunteerActivities();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-4 py-2 rounded-md text-sm font-medium transition",
      isActive
        ? "bg-white shadow border text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
    ].join(" ");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearMockAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top thin bar */}
      <div className="h-10 bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between text-sm text-gray-600">
          {/* Area dropdown */}
          <div className="flex items-center gap-2">
            📍 <span className="font-medium text-gray-800">Area</span>

            <select
              className="ml-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-800"
              value={filters.area}
              onChange={(e) => setFilters({ area: e.target.value as any })}
            >
              {AREA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <span className="ml-2 text-xs text-gray-500">
              {filters.area === "all" ? "Showing all" : "Showing nearby"}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:text-gray-900 text-sm font-medium"
          >
            🚪 <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
          <img src="/src/assets/logo.png" alt="MINDS" className="h-10 w-auto" />

          <div className="flex-1">
            <div className="bg-gray-100 border rounded-lg px-2 py-2 flex gap-2 justify-center">
              <NavLink to="/volunteer" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/volunteer/calendar" className={linkClass}>
                Calendar
              </NavLink>
              <NavLink to="/volunteer/activities" className={linkClass}>
                Activities
              </NavLink>
              <NavLink to="/volunteer/commitments" className={linkClass}>
                My Commitments
              </NavLink>
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
