import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function VolunteerLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }

    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "px-4 py-2 rounded-md text-sm font-medium transition",
      isActive
        ? "bg-white shadow border text-gray-900"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60",
    ].join(" ");

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center gap-6">
          <img src="/src/assets/logo.png" alt="MINDS" className="h-10 w-auto" />

          <div className="flex-1">
            {/* ✅ Navbar row */}
            <div className="bg-gray-100 border rounded-lg px-2 py-2 flex gap-2 justify-center items-center">
              <NavLink to="/volunteer" end className={linkClass}>
                Home
              </NavLink>
              <NavLink to="/volunteer/calendar" className={linkClass}>
                Calendar
              </NavLink>
              <NavLink to="/volunteer/activities" className={linkClass}>
                Activities
              </NavLink>
              <NavLink to="/volunteer/profile" className={linkClass}>
                My Profile
              </NavLink>

              {/* ✅ Logout inside the same row */}
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium transition text-gray-600 hover:text-red-600 hover:bg-white/60"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
