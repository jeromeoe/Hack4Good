import { NavLink } from "react-router-dom";

const linkBase =
  "px-5 py-2 rounded-md text-sm font-medium transition border";
const active =
  "bg-white shadow border-gray-200 text-gray-900";
const inactive =
  "bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200";

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? active : inactive}`
      }
    >
      {label}
    </NavLink>
  );
}

export default function VolunteerNav() {
  return (
    <div className="w-full flex items-center gap-3 bg-gray-50 rounded-lg p-2">
      <Tab to="/volunteer/home" label="Home" />
      <Tab to="/volunteer/calendar" label="Calendar" />
      <Tab to="/volunteer/activities" label="Activities" />
      <Tab to="/volunteer/commitments" label="My Commitments" />
    </div>
  );
}
