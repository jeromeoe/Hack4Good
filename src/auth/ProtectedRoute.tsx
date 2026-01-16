import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ProtectedRoute() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setAuthed(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthed(!!session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!authed) return <Navigate to="/login" replace />;

  return <Outlet />;
}
