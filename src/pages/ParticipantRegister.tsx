import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // Real Supabase Client
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
  
  const [formData, setFormData] = useState({
    // Participant info
    participantName: "",
    participantEmail: "",
    participantPhone: "",
    participantAge: "",
    disability: "Physical Disability" as Disability,
    
    // Account info
    password: "",
    confirmPassword: "",
    
    // Caregiver info
    isCaregiver: false,
    caregiverName: "",
    caregiverEmail: "",
    caregiverPhone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    // --- 1. Client-Side Validation ---
    const newErrors: Record<string, string> = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.isCaregiver && !formData.caregiverName) {
      newErrors.caregiverName = "Caregiver name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // --- 2. Real Registration Logic ---
    setLoading(true);
    try {
      // A. Create User in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.participantEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.participantName, // stored in auth metadata
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // B. Create Profile Entry in Database
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id, // Link to Auth ID
            email: formData.participantEmail,
            full_name: formData.participantName,
            role: 'participant', // HARDCODED ROLE
            phone: formData.participantPhone,
            age: parseInt(formData.participantAge),
            disability: formData.disability,
            caregiver_info: formData.isCaregiver ? {
              name: formData.caregiverName,
              email: formData.caregiverEmail,
              phone: formData.caregiverPhone
            } : null
          });

        if (profileError) throw profileError;

        // C. Success!
        alert("Account created successfully!");
        navigate("/participant");
      }

    } catch (error: any) {
      console.error("Registration Error:", error);
      setErrors({ form: error.message || "Failed to register. Please try again." });
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold">MINDS</h2>
          <p className="text-base leading-relaxed max-w-sm">
            Join our community and participate in activities designed to support and empower individuals with special needs.
          </p>
        </div>
      </div>

      {/* RIGHT REGISTRATION PANEL */}
      <div className="flex items-center justify-center px-10 py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          <img
            src="/src/assets/logo.png"
            alt="MINDS logo"
            className="h-20 mx-auto mb-8"
          />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600 mb-6">Register as a participant or caregiver</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Global Error Message */}
            {errors.form && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                {errors.form}
              </div>
            )}

            {/* Participant Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Participant Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 text-base"
                  placeholder="Participant's full name"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    className="w-full border rounded-lg px-4 py-2.5 text-base"
                    placeholder="Age"
                    value={formData.participantAge}
                    onChange={(e) => setFormData({ ...formData, participantAge: e.target.value })}
                  />
                  {errors.participantAge && (
                    <p className="text-xs text-red-600 mt-1">{errors.participantAge}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Disability *</label>
                  <select
                    required
                    className="w-full border rounded-lg px-4 py-2.5 text-base"
                    value={formData.disability}
                    onChange={(e) => setFormData({ ...formData, disability: e.target.value as Disability })}
                  >
                    {DISABILITIES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 text-base"
                  placeholder="participant@example.com"
                  value={formData.participantEmail}
                  onChange={(e) => setFormData({ ...formData, participantEmail: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 text-base"
                  placeholder="+65 9123 4567"
                  value={formData.participantPhone}
                  onChange={(e) => setFormData({ ...formData, participantPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 text-base"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 text-base"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Caregiver Information */}
            <div className="space-y-4 pt-4 border-t">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isCaregiver}
                  onChange={(e) => setFormData({ ...formData, isCaregiver: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium">I am registering as a caregiver</span>
              </label>

              {formData.isCaregiver && (
                <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                  <div>
                    <label className="block text-sm font-medium mb-1">Caregiver Name *</label>
                    <input
                      type="text"
                      required={formData.isCaregiver}
                      className="w-full border rounded-lg px-4 py-2.5 text-base"
                      placeholder="Your full name"
                      value={formData.caregiverName}
                      onChange={(e) => setFormData({ ...formData, caregiverName: e.target.value })}
                    />
                    {errors.caregiverName && (
                      <p className="text-xs text-red-600 mt-1">{errors.caregiverName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Caregiver Email</label>
                    <input
                      type="email"
                      className="w-full border rounded-lg px-4 py-2.5 text-base"
                      placeholder="caregiver@example.com"
                      value={formData.caregiverEmail}
                      onChange={(e) => setFormData({ ...formData, caregiverEmail: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Caregiver Phone</label>
                    <input
                      type="tel"
                      className="w-full border rounded-lg px-4 py-2.5 text-base"
                      placeholder="+65 8123 4567"
                      value={formData.caregiverPhone}
                      onChange={(e) => setFormData({ ...formData, caregiverPhone: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center mt-6 font-bold text-gray-800">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-500 underline hover:text-blue-700"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}