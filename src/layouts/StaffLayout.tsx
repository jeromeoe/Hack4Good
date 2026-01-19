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
    <div className="min-h-screen bg-gray-50">
      {/* Top Admin Bar */}
      <div className="h-10 bg-gray-900 border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 h-full flex items-center justify-between text-sm text-gray-400">
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
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-8">
          <img src="/src/assets/logo.png" alt="MINDS" className="h-10 w-auto" />

          <div className="flex-1">
            <div className="flex gap-1">
              <NavLink to="/staff" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/staff/activities" className={linkClass}>
                Manage Activities
              </NavLink>
              {/* Placeholders for future pages */}
              <span className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                Participants
              </span>
              <span className="px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
                Reports
              </span>
            </div>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-sm">
            + New Activity
          </button>
        </div>
      </div>

      {/* Page Content (Where StaffHome / StaffActivities appears) */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}