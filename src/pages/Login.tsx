import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { setMockRole } from "../auth/roles"; //

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Auth Check
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        alert(authError.message); // Keep only real error alerts
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Profile Check
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          navigate("/participant"); // Safe fallback
          return;
        }

        // 3. Sanitize & Route
        const role = (profile?.role || "").trim().toLowerCase();
        
        if (role) setMockRole(role as any);

        if (role === "staff") navigate("/staff");
        else if (role === "volunteer") navigate("/volunteer");
        else navigate("/participant");
      }
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative hidden md:flex" style={{ backgroundImage: "url('/src/assets/minds.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/30" />
         <div className="relative z-10 p-12 text-white flex flex-col justify-between">
          <h2 className="text-3xl font-bold">Minds</h2>
          <p className="text-base leading-relaxed max-w-sm">We are grounded in the belief that every individual with special needs has innate talents and strengths to be nurtured.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-10">
        <div className="w-full max-w-md">
          <img src="/src/assets/logo.png" alt="MINDS logo" className="h-20 mx-auto mb-10" />
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required className="w-full border rounded-lg px-4 py-3 text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" required className="w-full border rounded-lg px-4 py-3 text-base" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
           <p className="text-sm text-center mt-8 font-bold text-gray-800 drop-shadow-sm">
            Don’t have an account? <Link to="/register" className="text-blue-500 underline hover:text-blue-700">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}