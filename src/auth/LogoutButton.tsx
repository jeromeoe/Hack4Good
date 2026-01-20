import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-muted"
    >
      Log Out
    </button>
  );
}
