import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

export default function VolunteerLayout() {
  const navigate = useNavigate();
  // REMOVED: useVolunteerActivities() hook 
  // This prevents the "Context Error" crash if the provider isn't wrapping the layout.

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2",
      isActive
        ? "bg-white shadow border text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
    ].join(" ");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
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
                My Profile
              </NavLink>
              
              <div className="w-px h-6 bg-gray-300 mx-1"></div>

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

      {/* Page content - The Outlet renders the child page (Home, Activities, etc) */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}