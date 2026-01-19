import { NavLink, Outlet, Link } from "react-router-dom";

export default function StaffLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-4 py-2 rounded-md text-sm font-medium transition",
      isActive
        ? "bg-white shadow border text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
    ].join(" ");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Admin Bar */}
      <div className="h-10 bg-gray-900 border-b border-gray-800">
        <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">MINDS Staff Portal</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 text-xs">
              Admin Access
            </span>
          </div>
          <Link to="/login" className="hover:text-white transition">
            Log Out
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
          <img src="/src/assets/logo.png" alt="MINDS" className="h-10 w-auto" />

          <div className="flex-1">
            <div className="bg-gray-100 border rounded-lg px-2 py-2 flex gap-2 justify-center">
              <NavLink to="/staff" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/staff/activities" className={linkClass}>
                Manage Activities
              </NavLink>
              <NavLink to="/staff/participants" className={linkClass}>
                Participants
              </NavLink>
              <NavLink to="/staff/reports" className={linkClass}>
                Reports & Export
              </NavLink>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-sm">
            + New Activity
          </button>
        </div>
      </div>

      {/* Page Content */}
      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}