import LogoutButton from "../../auth/LogoutButton";

export function AdminTopbar() {
  return (
    <div className="flex justify-end border-b p-3">
      <LogoutButton />
    </div>
  );
}
