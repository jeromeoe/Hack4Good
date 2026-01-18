import { VOLUNTEER_ROLES } from "../lib/VolunteerActivitiesContext";
import type { VolunteerRole } from "../lib/VolunteerActivitiesContext";

export default function VolunteerRoleSelect({
  value,
  onChange,
  disabled,
}: {
  value?: VolunteerRole;
  onChange: (role: VolunteerRole) => void;
  disabled?: boolean;
}) {
  return (
    <select
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
      value={value ?? "General support"}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as VolunteerRole)}
    >
      {VOLUNTEER_ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
