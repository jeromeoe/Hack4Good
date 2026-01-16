import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured. Please check your environment variables.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/volunteer"); // ✅ redirect after login
    }

    setLoading(false);
  };

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
                className="w-full border rounded-lg px-4 py-3"
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
                className="w-full border rounded-lg px-4 py-3"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-center mt-8 font-bold">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-500 underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
