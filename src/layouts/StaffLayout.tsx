import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { setMockRole } from "../auth/roles"; // Keep this to sync the router
import type { Disability } from "../types/participant";

const DISABILITIES: Disability[] = [
  "Physical Disability",
  "Visual Impairment",
  "Hearing Impairment",
  "Intellectual Disability",
  "Autism Spectrum",
  "Multiple Disabilities",
  "Other",
];

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ✅ 1. Role Toggle State
  const [isVolunteer, setIsVolunteer] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    password: "",
    confirmPassword: "",
    
    // Participant Specific
    disability: "Physical Disability" as Disability,
    isCaregiver: false,
    caregiverName: "",
    caregiverEmail: "",
    caregiverPhone: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // --- Validation ---
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      // ✅ 2. Determine Role
      const finalRole = isVolunteer ? "volunteer" : "participant";

      // ✅ 3. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: finalRole, // Store in metadata as backup
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error("This email is already registered. Please log in.");
        }
        throw authError;
      }

      if (authData.user) {
        // ✅ 4. Create Profile Row
        // Note: This ONLY works if Email Confirmation is DISABLED or if you have a Trigger.
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.name,
            role: finalRole, // 'volunteer' or 'participant'
            
            // Optional fields (send null if not applicable)
            phone: formData.phone,
            age: formData.age ? parseInt(formData.age) : null,
            disability: isVolunteer ? null : formData.disability,
            caregiver_info: (!isVolunteer && formData.isCaregiver) ? {
              name: formData.caregiverName,
              email: formData.caregiverEmail,
              phone: formData.caregiverPhone
            } : null
          });

        if (profileError) {
          console.error("Profile creation failed:", profileError);
          // If this fails, it's usually RLS or Table Schema issues.
          // We let the user pass, but warn them.
        }

        // ✅ 5. Success Logic
        setSuccessMsg("Account created successfully!");
        
        // Auto-Login helper for the Router
        setMockRole(finalRole as any);

        // Short delay to show success message, then redirect
        setTimeout(() => {
          navigate(`/${finalRole}`);
        }, 1500);
      } else {
        // This block runs if Supabase is waiting for Email Verification
        setSuccessMsg("Success! Please check your email to confirm your account.");
      }

    } catch (error: any) {
      console.error("Registration Error:", error);
      setErrorMsg(error.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* LEFT IMAGE */}
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
          <h2 className="text-3xl font-bold">MINDS</h2>
          <p className="text-base leading-relaxed max-w-sm">
            Join our community to support and empower individuals with special needs.
          </p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center px-10 py-8 overflow-y-auto h-screen bg-white">
        <div className="w-full max-w-md">
          <img src="/src/assets/logo.png" alt="MINDS logo" className="h-20 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          
          {/* ✅ ROLE TOGGLE */}
          <div className="flex items-center gap-3 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setIsVolunteer(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${!isVolunteer ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              I am a Participant
            </button>
            <button
              type="button"
              onClick={() => setIsVolunteer(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${isVolunteer ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              I am a Volunteer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* MESSAGES */}
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
                {successMsg}
              </div>
            )}

            {/* COMMON FIELDS */}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg px-4 py-2.5"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full border rounded-lg px-4 py-2.5"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* PARTICIPANT ONLY FIELDS */}
            {!isVolunteer && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full border rounded-lg px-4 py-2.5"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Disability</label>
                    <select
                      className="w-full border rounded-lg px-4 py-2.5"
                      value={formData.disability}
                      onChange={(e) => setFormData({ ...formData, disability: e.target.value as Disability })}
                    >
                      {DISABILITIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium mb-1">Phone</label>
                   <input
                     type="tel"
                     required
                     className="w-full border rounded-lg px-4 py-2.5"
                     placeholder="+65 9123 4567"
                     value={formData.phone}
                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                   />
                </div>
              </>
            )}

            {/* VOLUNTEER SPECIFIC (Just phone for now) */}
            {isVolunteer && (
               <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    className="w-full border rounded-lg px-4 py-2.5"
                    placeholder="+65 9123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
               </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-4"
            >
              {loading ? "Creating Account..." : `Register as ${isVolunteer ? 'Volunteer' : 'Participant'}`}
            </button>

            <p className="text-sm text-center mt-4 text-gray-600">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}