import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase"; //

export const VOLUNTEER_ROLES = ["General support", "Wheelchair assistance"] as const;
export type VolunteerRole = (typeof VOLUNTEER_ROLES)[number];

export type Activity = {
  id: number;
  title: string;
  startISO: string;
  endISO: string;
  location: string;
  capacity: number;
  signedUp: number; // Total count
  isSignedUp: boolean; // Did *I* sign up?
  myRole?: VolunteerRole;
};

export type Filters = {
  date: "all" | "today" | "week";
  location: "all" | string;
  onlyNeeding: boolean;
  area: "all" | string; // Added area to match your layout
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

// Helper: Staff usually save "2024-05-20", we convert to "2024-05-20T09:00:00"
function synthesizeTimes(dateStr: string) {
  const start = new Date(dateStr);
  start.setHours(9, 0, 0, 0); // Default 9 AM
  const end = new Date(dateStr);
  end.setHours(12, 0, 0, 0); // Default 12 PM
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
  const [filters, _setFilters] = useState<Filters>({
    date: "all",
    location: "all",
    onlyNeeding: false,
    area: "all"
  });
  const [toast, setToast] = useState<Toast>(null);

  // --- 1. FETCH DATA (Real Supabase) ---
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // A. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // B. Get Activities
    const { data: events, error: err1 } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true });

    if (err1) console.error("Error fetching activities:", err1);

    // C. Get Registrations (My friends' table)
    const { data: allRegs, error: err2 } = await supabase
      .from('registrations')
      .select('*');
      
    if (err2) console.error("Error fetching registrations:", err2);

    // D. Merge
    if (events) {
      const merged = events.map((event: any) => {
        // Find registrations for this specific event
        const eventRegs = allRegs?.filter((r: any) => r.activity_id === event.id) || [];
        const myReg = eventRegs.find((r: any) => r.user_id === user.id);
        const { startISO, endISO } = synthesizeTimes(event.date);

        return {
          id: event.id,
          title: event.title,
          location: event.location,
          capacity: event.spots || 0,
          startISO,
          endISO,
          signedUp: eventRegs.length,
          isSignedUp: !!myReg,
          myRole: (myReg?.role as VolunteerRole) || "General support"
        };
      });
      setActivities(merged);
    }
  }

  // --- Helpers ---
  function clearToast() { setToast(null); }
  function showToast(message: string) {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  }
  function setFilters(patch: Partial<Filters>) {
    _setFilters((prev) => ({ ...prev, ...patch }));
  }

  // Local state update only (Role selection before signup)
  function setMyRole(activityId: number, role: VolunteerRole) {
    setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, myRole: role } : a)));
  }

  // --- 2. TOGGLE SIGNUP (Real DB) ---
  async function toggleSignup(activityId: number) {
    const target = activities.find(a => a.id === activityId);
    if (!target) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Please log in.");
      return;
    }

    if (target.isSignedUp) {
      // CANCEL
      const { error } = await supabase
        .from('registrations')
        .delete()
        .match({ user_id: user.id, activity_id: activityId });

      if (error) {
        showToast("Error: " + error.message);
      } else {
        showToast("Cancelled successfully.");
        fetchData(); // Refresh to sync counts
      }
    } else {
      // SIGN UP
      if (target.signedUp >= target.capacity) {
        showToast("Activity is full!");
        return;
      }
      const { error } = await supabase
        .from('registrations')
        .insert({
          user_id: user.id,
          activity_id: activityId,
          role: target.myRole || "General support"
        });

      if (error) {
        showToast("Error: " + error.message);
      } else {
        showToast("Signed up!");
        fetchData(); // Refresh
      }
    }
  }

  // --- Derived State (Filtering) ---
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

    return activities.filter((a) => {
      // Location Filter
      if (filters.location !== "all" && a.location !== filters.location) return false;
      
      // Date Filter
      const st = new Date(a.startISO).getTime();
      if (filters.date === "today" && (st < t0 || st > t1Today)) return false;
      if (filters.date === "week" && (st < t0 || st > t1Week)) return false;

      // "Only Needing" Filter
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