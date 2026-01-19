import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { setMockRole } from "../auth/roles"; // ✅ Import the bridge function

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        alert(authError.message);
        setIsLoading(false);
        return;
      }

      // 2. Check the Database for the Role
      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          navigate("/participant");
          return;
        }

        const role = profile?.role;
        console.log("Supabase says you are:", role);

        // ✅ CRITICAL FIX: Update the Router's "Badge"
        // This ensures RoleRoute lets you in!
        if (role) {
            setMockRole(role as any); 
        }

        // 3. Navigation
        if (role === "staff") {
          navigate("/staff");
        } else if (role === "volunteer") {
          navigate("/volunteer");
        } else {
          navigate("/participant");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* LEFT IMAGE PANEL */}
      <div
        className="relative hidden md:flex"
        style={{
          backgroundImage: "url('/src/assets/minds.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 p-12 text-white flex flex-col justify-between">
          <h2 className="text-3xl font-bold">Minds</h2>
          <p className="text-base leading-relaxed max-w-sm">
            We are grounded in the belief that every individual with special
            needs has innate talents and strengths to be nurtured.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="flex items-center justify-center px-10">
        <div className="w-full max-w-md">
          <img
            src="/src/assets/logo.png"
            alt="MINDS logo"
            className="h-20 mx-auto mb-10"
          />

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full border rounded-lg px-4 py-3 text-base"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full border rounded-lg px-4 py-3 text-base"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? "Verifying Access..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-8 font-bold text-gray-800 drop-shadow-sm">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 underline hover:text-blue-700"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}