import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react"; // Import icon for better UX
import { supabase } from "../lib/supabase";
import { clearMockAuth } from "../auth/roles";

export default function StaffLayout() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50">
      {/* Top Admin Bar - Purely for Status now */}
      <div className="h-8 bg-gray-900 border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 h-full flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">MINDS STAFF PORTAL</span>
          </div>
          <span className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             System Operational
          </span>
        </div>
      </div>

      {/* Main Navigation - Log Out is now here */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-8">
          <img src="/src/assets/logo.png" alt="MINDS" className="h-10 w-auto" />

          <div className="flex-1 flex items-center justify-between">
            {/* Nav Links */}
            <div className="flex gap-1">
              <NavLink to="/staff" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/staff/activities" className={linkClass}>
                Manage Activities
              </NavLink>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
               <span className="text-sm font-medium text-gray-700 hidden md:block">
                 Admin
               </span>
               <button 
                 onClick={handleLogout}
                 className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition px-3 py-2 rounded-md hover:bg-red-50"
               >
                 <LogOut size={16} />
                 Log Out
               </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}