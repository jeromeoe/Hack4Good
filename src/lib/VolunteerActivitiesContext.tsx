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
  signedUp: number; 
  isSignedUp: boolean;
  myRole?: VolunteerRole;
};

export type Filters = {
  date: "all" | "today" | "week";
  location: "all" | string;
  onlyNeeding: boolean;
  area: "all" | string;
};

type Toast = { message: string; type: 'success' | 'error' } | null;

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

function synthesizeTimes(dateStr: string) {
  try {
    if (!dateStr) throw new Error("Missing date");
    const start = new Date(dateStr);
    if (isNaN(start.getTime())) throw new Error("Invalid date");
    start.setHours(9, 0, 0, 0); 
    const end = new Date(dateStr);
    end.setHours(12, 0, 0, 0); 
    return { startISO: start.toISOString(), endISO: end.toISOString() };
  } catch (e) {
    const now = new Date();
    return { startISO: now.toISOString(), endISO: now.toISOString() };
  }
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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: events, error: err1 } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: true });

      if (err1) { console.error("Error fetching activities:", err1); return; }

      const { data: allRegs, error: err2 } = await supabase
        .from('registrations')
        .select('*');
      
      if (err2) console.error("Error fetching registrations:", err2);

      if (events) {
        const merged = events.map((event: any) => {
          const eventRegs = allRegs?.filter((r: any) => 
            r.activity_id === event.id && 
            (r.status === 'registered' || r.status === 'confirmed')
          ) || [];
          
          const myReg = eventRegs.find((r: any) => r.user_id === user.id);
          const { startISO, endISO } = synthesizeTimes(event.date);
          const capacity = event.volunteer_slots ?? event.spots ?? 0;

          return {
            id: event.id,
            title: event.title || "Untitled Activity",
            location: event.location || "TBC",
            capacity: capacity,
            startISO,
            endISO,
            signedUp: eventRegs.length,
            isSignedUp: !!myReg,
            myRole: (myReg?.user_type === 'Wheelchair assistance' ? 'Wheelchair assistance' : 'General support')
          };
        });
        setActivities(merged);
      }
    } catch (err) {
      console.error("Crash in fetchData:", err);
    }
  }

  function clearToast() { setToast(null); }
  
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    console.log(`[TOAST] ${type}: ${message}`); // Debug log
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function setFilters(patch: Partial<Filters>) {
    _setFilters((prev) => ({ ...prev, ...patch }));
  }

  function setMyRole(activityId: number, role: VolunteerRole) {
    setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, myRole: role } : a)));
  }

  // --- 3. TOGGLE SIGNUP ---
  async function toggleSignup(activityId: number) {
    console.log("Button Clicked for Activity ID:", activityId);

    const target = activities.find(a => a.id === activityId);
    if (!target) {
        console.error("Activity not found in local state!");
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast("Please log in.", "error");
      return;
    }

    if (target.isSignedUp) {
      // WITHDRAW
      console.log("Attempting to withdraw...");
      const { error } = await supabase
        .from('registrations')
        .delete()
        .match({ 
          user_id: user.id, 
          activity_id: activityId 
        });

      if (error) {
        console.error("Supabase Error:", error);
        showToast("Withdrawal failed: " + error.message, "error");
      } else {
        console.log("Withdrawal success!");
        showToast("Withdrawn successfully.", "success");
        fetchData();
      }
    } else {
      // REGISTER
      console.log("Attempting to register...");
      if (target.signedUp >= target.capacity) {
        showToast("Activity is full!", "error");
        return;
      }

      const { error } = await supabase
        .from('registrations')
        .insert({
          user_id: user.id,
          activity_id: activityId,
          user_type: target.myRole || 'volunteer', 
          status: 'registered'
        });

      if (error) {
        console.error("Supabase Error:", error);
        showToast("Registration failed: " + error.message, "error");
      } else {
        console.log("Registration success!");
        showToast("Registered successfully!", "success");
        fetchData();
      }
    }
  }

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
      
      {/* ✅ THIS IS THE MISSING PART: The Toast UI */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          <p className="font-medium">{toast.message}</p>
        </div>
      )}
    </VolunteerActivitiesContext.Provider>
  );
}

export function useVolunteerActivities() {
  const ctx = useContext(VolunteerActivitiesContext);
  if (!ctx) throw new Error("useVolunteerActivities must be used within VolunteerActivitiesProvider");
  return ctx;
}