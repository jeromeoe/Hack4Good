import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import {
  fetchVolunteerProfile,
  updateVolunteerProfile as updateProfileInDB,
  type VolunteerProfile,
} from "./VolunteerHooks";

type Toast = { message: string; type: "success" | "error" | "warning" } | null;

type Ctx = {
  profile: VolunteerProfile | null;
  isLoading: boolean;
  toast: Toast;
  clearToast: () => void;
  updateProfile: (updates: Partial<Omit<VolunteerProfile, "id">>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
};

const VolunteerProfileContext = createContext<Ctx | null>(null);

export function VolunteerProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);

  const clearToast = () => setToast(null);

  const refreshProfile = async () => {
    try {
      setIsLoading(true);

      const profileData = await fetchVolunteerProfile();
      setProfile(profileData);

      // If profile is null, differentiate auth vs DB/RLS issues
      if (!profileData) {
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data.session;

        if (!hasSession) {
          setToast({
            message: "You’re not logged into Supabase (session missing). Please login again.",
            type: "warning",
          });
        } else {
          setToast({
            message:
              "Supabase session exists, but profile fetch failed. Likely RLS/policy issue on volunteer_profiles.",
            type: "warning",
          });
        }
        setTimeout(clearToast, 4000);
      }
    } catch (error) {
      console.error("[VolunteerProfileContext] Error loading volunteer profile:", error);
      setToast({
        message: "Error loading profile. Please refresh the page.",
        type: "error",
      });
      setTimeout(clearToast, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh whenever auth state changes (login/logout)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshProfile();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = async (
    updates: Partial<Omit<VolunteerProfile, "id">>
  ): Promise<boolean> => {
    if (!profile) return false;

    try {
      const success = await updateProfileInDB(updates);

      if (success) {
        setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
        setToast({ message: "✓ Profile updated successfully!", type: "success" });
      } else {
        setToast({ message: "Error updating profile. Please try again.", type: "error" });
      }

      setTimeout(clearToast, 3000);
      return success;
    } catch (error) {
      console.error("[VOL CONTEXT] Exception in updateProfile:", error);
      setToast({ message: "An error occurred. Please try again.", type: "error" });
      setTimeout(clearToast, 3000);
      return false;
    }
  };

  const value: Ctx = {
    profile,
    isLoading,
    toast,
    clearToast,
    updateProfile,
    refreshProfile,
  };

  return (
    <VolunteerProfileContext.Provider value={value}>
      {children}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            toast.type === "error"
              ? "bg-red-600 text-white"
              : toast.type === "warning"
              ? "bg-orange-600 text-white"
              : "bg-gray-900 text-white"
          }`}
        >
          <p className="font-medium">{toast.message}</p>
        </div>
      )}
    </VolunteerProfileContext.Provider>
  );
}

export function useVolunteerProfile() {
  const ctx = useContext(VolunteerProfileContext);
  if (!ctx) throw new Error("useVolunteerProfile must be used within VolunteerProfileProvider");
  return ctx;
}
