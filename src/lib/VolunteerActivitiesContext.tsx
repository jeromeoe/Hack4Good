import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

export const VOLUNTEER_ROLES = ["General support", "Wheelchair assistance"] as const;
export type VolunteerRole = (typeof VOLUNTEER_ROLES)[number];

export type Activity = {
  id: number; // Changed from string to number to match DB
  title: string;
  startISO: string;
  endISO: string;
  location: string;
  capacity: number;
  signedUp: number; // How many people total
  isSignedUp: boolean; // Is the CURRENT user signed up?
  myRole?: VolunteerRole;
};

export type Filters = {
  date: "all" | "today" | "week";
  location: "all" | string;
  onlyNeeding: boolean;
};

type Toast = { message: string } | null;

type Ctx = {
  activities: Activity[];
  filteredActivities: Activity[];
  commitments: Activity[];
  locations: string[];
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  toast: Toast;
  clearToast: () => void;
  setMyRole: (activityId: number, role: VolunteerRole) => void;
  toggleSignup: (activityId: number) => Promise<void>;
};

const VolunteerActivitiesContext = createContext<Ctx | null>(null);

// Helper: Convert "2024-05-20" -> ISO String for 9AM - 12PM
function synthesizeTimes(dateStr: string) {
  const start = new Date(dateStr);
  start.setHours(9, 0, 0, 0); // Default to 9 AM
  
  const end = new Date(dateStr);
  end.setHours(12, 0, 0, 0); // Default to 12 PM
  
  return {
    startISO: start.toISOString(),
    endISO: end.toISOString()
  };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function endOfNext7Days() {
  const d = startOfToday();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function VolunteerActivitiesProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [_loading, setLoading] = useState(true);
  const [filters, _setFilters] = useState<Filters>({
    date: "all",
    location: "all",
    onlyNeeding: false,
  });
  const [toast, setToast] = useState<Toast>(null);
  const clearToast = () => setToast(null);
  const setFilters = (patch: Partial<Filters>) =>
    _setFilters((prev) => ({ ...prev, ...patch }));

  function showToast(message: string) {
    setToast({ message });
    window.setTimeout(() => setToast(null), 2500);
  }

  function setMyRole(activityId: number, role: VolunteerRole) {
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, myRole: role } : a))
    );
  }

  // --- 1. FETCH REAL DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
  
    // 1. Fetch all activities posted by Staff
    const { data: events } = await supabase
      .from('activities')
      .select('*');
  
    // 2. Fetch all signups from your specific REGISTRATIONS table
    // NOTE: The typed Supabase `Database` may not include this table in all environments.
    // Fall back to `any` here to avoid `never` typing errors.
    const { data: allRegistrations } = await (supabase as any)
      .from("registrations") // Targeting your friend's table name
      .select("*");
  
    if (events && allRegistrations) {
      const merged = events.map((event: any) => {
        const eventRegs = (allRegistrations as any[]).filter((r) => r.activity_id === event.id);
        const myReg = eventRegs.find((r) => r.user_id === user.id);
        const { startISO, endISO } = synthesizeTimes(event.date);
  
        return {
          id: event.id,
          title: event.title,
          location: event.location,
          capacity: event.spots,
          signedUp: eventRegs.length,
          isSignedUp: !!myReg,
          myRole: (myReg?.role as VolunteerRole | undefined) || "General support",
          startISO,
          endISO,
        };
      });
      setActivities(merged);
    }
    setLoading(false);
  }
  
  async function toggleSignup(activityId: number) {
    const target = activities.find(a => a.id === activityId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !target) return;
  
    if (target.isSignedUp) {
      // Cancel: Delete from REGISTRATIONS
      const { error } = await (supabase as any)
        .from("registrations")
        .delete()
        .match({ user_id: user.id, activity_id: activityId });

      if (error) showToast("Error cancelling: " + error.message);
      else showToast("Unregistered successfully.");
    } else {
      if (target.signedUp >= target.capacity) {
        showToast("Activity is full!");
        return;
      }

      // Signup: Insert into REGISTRATIONS
      const { error } = await (supabase as any).from("registrations").insert({
        user_id: user.id,
        activity_id: activityId,
        role: target.myRole || "General support",
      });

      if (error) showToast("Error signing up: " + error.message);
      else showToast("Registration successful!");
    }

    fetchData(); // Refresh to sync counts
  }

  // --- Derived State (Filters) ---
  const locations = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => set.add(a.location));
    return Array.from(set).sort();
  }, [activities]);

  const commitments = useMemo(() => {
    return activities.filter((a) => a.isSignedUp);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const t0 = startOfToday().getTime();
    const t1Today = endOfToday().getTime();
    const t1Week = endOfNext7Days().getTime();

    return activities
      .filter((a) => {
        if (filters.location !== "all" && a.location !== filters.location) return false;
        const st = new Date(a.startISO).getTime();
        if (filters.date === "today" && (st < t0 || st > t1Today)) return false;
        if (filters.date === "week" && (st < t0 || st > t1Week)) return false;
        if (filters.onlyNeeding) {
          if (!a.isSignedUp && a.signedUp >= a.capacity) return false;
        }
        return true;
      });
  }, [activities, filters]);

  return (
    <VolunteerActivitiesContext.Provider value={{
      activities, filteredActivities, commitments, locations, filters, setFilters, toast, clearToast, setMyRole, toggleSignup
    }}>
      {children}
    </VolunteerActivitiesContext.Provider>
  );
}

export function useVolunteerActivities() {
  const ctx = useContext(VolunteerActivitiesContext);
  if (!ctx) throw new Error("useVolunteerActivities must be used within VolunteerActivitiesProvider");
  return ctx;
}