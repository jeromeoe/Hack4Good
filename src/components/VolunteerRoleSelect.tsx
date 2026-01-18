import { VOLUNTEER_ROLES } from "../types/volunteer";

type Props = {
  value?: string;
  onChange: (role: string) => void;
  disabled?: boolean;
};

export default function VolunteerRoleSelect({ value, onChange, disabled }: Props) {
  return (
    <select
      className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
      value={value ?? "General support"}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {VOLUNTEER_ROLES.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  );
}
