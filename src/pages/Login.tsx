import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { setMockRole } from "../auth/roles";

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
        alert("Auth Error: " + authError.message);
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        console.log("Auth Success. User ID:", authData.user.id);

        // 2. Profile Check (The Buggy Part)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        // ⚠️ DEBUGGING TRAP ⚠️
        if (profileError) {
          console.error("Supabase Database Error:", profileError);
          // Alert the EXACT error from the database
          alert(`DATABASE ERROR:\n${profileError.message}\n\nHint: If the error says "JSON object requested, multiple (or no) rows returned", it means RLS is blocking the view.`);
          setIsLoading(false);
          return;
        }

        // 3. Success Path
        const role = profile?.role;
        alert(`Success! Found Role: ${role}`); // Temporary alert to confirm it works
        
        if (role) setMockRole(role as any);

        if (role === "staff") navigate("/staff");
        else if (role === "volunteer") navigate("/volunteer");
        else navigate("/participant");
      }
    } catch (err: any) {
      alert("Critical Crash: " + err.message);
      setIsLoading(false);
    }
  }

  // ... (Keep the rest of your UI/Return statement exactly the same)
  // Just copy the return (...) block from your previous file
  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel */}
      <div className="relative hidden md:flex" style={{ backgroundImage: "url('/src/assets/minds.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 p-12 text-white flex flex-col justify-between">
          <h2 className="text-3xl font-bold">Minds</h2>
          <p className="text-base leading-relaxed max-w-sm">We are grounded in the belief that every individual with special needs has innate talents and strengths to be nurtured.</p>
        </div>
      </div>

      {/* Right Panel */}
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
              {isLoading ? "Debugging..." : "Login"}
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