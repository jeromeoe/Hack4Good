import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { setMockRole } from "../auth/roles"; 
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

export default function ParticipantRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // ✅ Controls the "Success View"
  
  // Role Toggle
  const [isVolunteer, setIsVolunteer] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    password: "",
    confirmPassword: "",
    disability: "Physical Disability" as Disability,
    isCaregiver: false,
    caregiverName: "",
    caregiverEmail: "",
    caregiverPhone: "",
  });

  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

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
      if (!supabase) {
        setErrorMsg("Supabase is not configured. Please check environment variables.");
        setLoading(false);
        return;
      }

      const finalRole = isVolunteer ? "volunteer" : "participant";

      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: finalRole,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // B. Create Profile Entry in Database
        const caregiverInfo = formData.isCaregiver ? {
          name: formData.caregiverName,
          email: formData.caregiverEmail || undefined,
          phone: formData.caregiverPhone || undefined
        } : null;

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id, // Link to Auth ID
            email: formData.email,
            full_name: formData.name,
            role: finalRole, // Dynamic role based on toggle
            phone: formData.phone,
            age: formData.age ? parseInt(formData.age) : null,
            disability: !isVolunteer ? formData.disability : null,
            caregiver_info: !isVolunteer ? caregiverInfo : null
          });

        if (profileError) throw profileError;

        // C. Success!
        alert("Account created successfully! Please log in.");
        navigate("/login");
      }

    } catch (error: any) {
      console.error("Registration Error:", error);
      setErrorMsg(error.message || "Failed to register.");
      setLoading(false);
    }
  };

  // ✅ THE SUCCESS VIEW (Replaces the Form)
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MINDS!</h2>
          <p className="text-gray-600 mb-6">Your account has been created successfully.</p>
          <div className="animate-pulse text-sm text-blue-600 font-medium">
            Redirecting to your dashboard...
          </div>
        </div>
      </div>
    );
  }

  // ✅ THE FORM VIEW
  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
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

      <div className="flex items-center justify-center px-10 py-8 overflow-y-auto h-screen bg-white">
        <div className="w-full max-w-md">
          <img src="/src/assets/logo.png" alt="MINDS logo" className="h-20 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          
          {/* Toggle */}
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
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                {errorMsg}
              </div>
            )}

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

            {/* DYNAMIC FIELDS based on Toggle */}
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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="caregiver"
                    checked={formData.isCaregiver}
                    onChange={(e) => setFormData({ ...formData, isCaregiver: e.target.checked })}
                  />
                  <label htmlFor="caregiver" className="text-sm text-gray-700">I am a caregiver</label>
                </div>

                {formData.isCaregiver && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Caregiver Name</label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-4 py-2.5"
                        value={formData.caregiverName}
                        onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Caregiver Email</label>
                        <input
                          type="email"
                          className="w-full border rounded-lg px-4 py-2.5"
                          value={formData.caregiverEmail}
                          onChange={(e) => setFormData({ ...formData, caregiverEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Caregiver Phone</label>
                        <input
                          type="tel"
                          className="w-full border rounded-lg px-4 py-2.5"
                          value={formData.caregiverPhone}
                          onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

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