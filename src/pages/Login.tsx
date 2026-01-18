import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setMockRole } from "../auth/roles";
import type { Role } from "../auth/roles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ Mock role selector
  const [role, setRole] = useState<Role>("volunteer");

  const navigate = useNavigate();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // ✅ MOCK LOGIN (no Supabase needed)
    setMockRole(role);

    // ✅ Redirect to correct portal
    navigate(`/${role}`);
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

            {/* ✅ Role selector */}
            <div>
              <label className="block text-sm font-medium mb-1">Login as</label>
              <select
                className="w-full border rounded-lg px-4 py-3 text-base"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="participant">Participant</option>
                <option value="volunteer">Volunteer</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
              Login (Mock)
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
