import { NavLink, Outlet } from "react-router-dom";

export default function VolunteerLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-4 py-2 rounded-md text-sm font-medium transition",
      isActive
        ? "bg-white shadow border text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
    ].join(" ");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top thin bar */}
      <div className="h-10 bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 h-full flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2">
              📍 <span>Location</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span>👤</span>
            <span>My Account</span>
          </div>
        </div>
      </div>

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
