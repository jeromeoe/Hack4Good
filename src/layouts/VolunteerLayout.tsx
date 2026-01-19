import { NavLink, Outlet, Link } from "react-router-dom";
import { AREA_OPTIONS } from "../lib/locations";
import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";

export default function VolunteerLayout() {
  const { filters, setFilters } = useVolunteerActivities();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2",
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

          {/* My Account link */}
          <Link
            to="/volunteer/account"
            className="flex items-center gap-2 hover:text-gray-900"
          >
            👤 <span className="font-medium">My Account</span>
          </Link>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
          <img src="/src/assets/logo.png" alt="MINDS" className="h-10 w-auto" />

          <div className="flex-1 flex justify-center">
            <div className="bg-gray-100 border rounded-lg p-1 flex gap-1 items-center">
              <NavLink to="/volunteer" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/volunteer/calendar" className={linkClass}>
                Calendar
              </NavLink>
              <NavLink to="/volunteer/activities" className={linkClass}>
                Activities
              </NavLink>
              <NavLink to="/volunteer/account" className={linkClass}>
                <User className="w-4 h-4" />
                My Account
              </NavLink>
              
              {/* Divider */}
              <div className="w-px h-6 bg-gray-300 mx-1"></div>

              {/* Log Out */}
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}