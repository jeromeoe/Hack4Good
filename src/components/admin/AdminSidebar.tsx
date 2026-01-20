import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import LogoutButton from "../../auth/LogoutButton";

const base =
  "flex items-center rounded-md px-3 py-2 text-sm transition hover:bg-muted";
const active = "bg-muted font-medium";
const sub = "ml-4 mt-1 flex flex-col space-y-1 border-l pl-4";

function Item({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `${base} ${isActive ? active : ""}`}
    >
      {label}
    </NavLink>
  );
}

export default function AdminSidebar() {
  const location = useLocation();

  // auto-open users menu if inside /admin/users
  const isUsersRoute = location.pathname.startsWith("/admin/users");
  const [usersOpen, setUsersOpen] = useState(isUsersRoute);

  return (
    <aside className="w-64 border-r bg-background p-4 flex flex-col">
      {/* header */}
      <div className="mb-6">
        <div className="text-lg font-semibold">minds</div>
        <div className="text-xs text-muted-foreground">admin panel</div>
      </div>

      {/* nav */}
      <nav className="space-y-1">
        <Item to="/admin" label="Dashboard" />
        <Item to="/admin/activities" label="Activities" />
        <Item to="/admin/registrations" label="Registrations" />
        <Item to="/admin/users" label="Users Overview" />

        <Item to="/admin/reports" label="Reports" />
        <Item to="/admin/settings" label="Settings" />
      </nav>

      {/* logout pinned bottom */}
      <div className="mt-auto pt-4 border-t">
        <LogoutButton />
      </div>
    </aside>
  );
}
