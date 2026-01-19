import React, { createContext, useContext, useMemo, useState } from "react";
import { areaFromLocation, type Area } from "./locations";

export const VOLUNTEER_ROLES = ["General support", "Wheelchair assistance"] as const;
export type VolunteerRole = (typeof VOLUNTEER_ROLES)[number];

export type Activity = {
  id: string;
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
  location: "all" | string;     // optional: exact location filter
  area: Area;                   // ✅ NEW: area filter (Central/East/West)
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
  setMyRole: (activityId: string, role: VolunteerRole) => void;
  toggleSignup: (activityId: string) => void;
};

const VolunteerActivitiesContext = createContext<Ctx | null>(null);

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && bs < ae;
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

function formatWhen(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const day = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const startTime = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return `${day}, ${startTime} – ${endTime}`;
}

export function VolunteerActivitiesProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "a1",
      title: "Art Jamming",
      startISO: "2026-01-20T10:00:00+08:00",
      endISO: "2026-01-20T12:00:00+08:00",
      location: "MINDS HQ",
      capacity: 5,
      signedUp: 2,
      isSignedUp: false,
      myRole: "General support",
    },
    {
      id: "a2",
      title: "Music Therapy",
      startISO: "2026-01-21T14:00:00+08:00",
      endISO: "2026-01-21T16:00:00+08:00",
      location: "MINDS West",
      capacity: 3,
      signedUp: 3,
      isSignedUp: false,
      myRole: "Wheelchair assistance",
    },
    {
      id: "a3",
      title: "Board Games",
      startISO: "2026-01-21T15:30:00+08:00",
      endISO: "2026-01-21T17:00:00+08:00",
      location: "MINDS HQ",
      capacity: 4,
      signedUp: 1,
      isSignedUp: true,
      myRole: "General support",
    },
    {
      id: "a4",
      title: "Walking Club",
      startISO: "2026-01-05T09:00:00+08:00",
      endISO: "2026-01-05T10:30:00+08:00",
      location: "MINDS East",
      capacity: 6,
      signedUp: 4,
      isSignedUp: true,
      myRole: "General support",
    },
  ]);

  const [filters, _setFilters] = useState<Filters>({
    date: "all",
    location: "all",
    area: "all",          // ✅ default to show everything
    onlyNeeding: false,
  });

  const [toast, setToast] = useState<Toast>(null);

  function clearToast() {
    setToast(null);
  }
  function showToast(message: string) {
    setToast({ message });
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToast(null), 2200);
  }

  function setFilters(patch: Partial<Filters>) {
    _setFilters((prev) => ({ ...prev, ...patch }));
  }

  const locations = useMemo(() => {
    const set = new Set<string>();
    activities.forEach((a) => set.add(a.location));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const commitments = useMemo(() => {
    return activities
      .filter((a) => a.isSignedUp)
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const t0 = startOfToday().getTime();
    const t1Today = endOfToday().getTime();
    const t1Week = endOfNext7Days().getTime();

    return activities
      .filter((a) => {
        // ✅ Area filter (nearby)
        if (filters.area !== "all") {
          const aArea = areaFromLocation(a.location);
          if (aArea !== filters.area) return false;
        }

        // Optional exact location filter
        if (filters.location !== "all" && a.location !== filters.location) return false;

        const st = new Date(a.startISO).getTime();
        if (filters.date === "today") {
          if (st < t0 || st > t1Today) return false;
        }
        if (filters.date === "week") {
          if (st < t0 || st > t1Week) return false;
        }

        if (filters.onlyNeeding) {
          const needing = a.signedUp < a.capacity;
          if (!a.isSignedUp && !needing) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());
  }, [activities, filters]);

  function setMyRole(activityId: string, role: VolunteerRole) {
    setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, myRole: role } : a)));
    showToast(`Role set: ${role}`);
  }

  function toggleSignup(activityId: string) {
    setActivities((prev) => {
      const target = prev.find((a) => a.id === activityId);
      if (!target) return prev;

      if (target.isSignedUp) {
        showToast("Cancelled successfully.");
        return prev.map((a) =>
          a.id === activityId
            ? { ...a, isSignedUp: false, signedUp: Math.max(0, a.signedUp - 1) }
            : a
        );
      }

      if (target.signedUp >= target.capacity) {
        showToast("This activity is full.");
        return prev;
      }

      for (const c of prev) {
        if (!c.isSignedUp) continue;
        if (c.id === target.id) continue;
        if (overlaps(target.startISO, target.endISO, c.startISO, c.endISO)) {
          showToast(`Clash with "${c.title}" (${formatWhen(c.startISO, c.endISO)}).`);
          return prev;
        }
      }

      const role = target.myRole ?? "General support";
      showToast(`Signed up successfully! (${role})`);

      return prev.map((a) =>
        a.id === activityId
          ? { ...a, isSignedUp: true, signedUp: Math.min(a.capacity, a.signedUp + 1), myRole: role }
          : a
      );
    });
  }

  const value: Ctx = {
    activities,
    filteredActivities,
    commitments,
    locations,
    filters,
    setFilters,
    toast,
    clearToast,
    setMyRole,
    toggleSignup,
  };

  return (
    <VolunteerActivitiesContext.Provider value={value}>
      {children}
    </VolunteerActivitiesContext.Provider>
  );
}

export function useVolunteerActivities() {
  const ctx = useContext(VolunteerActivitiesContext);
  if (!ctx) throw new Error("useVolunteerActivities must be used within VolunteerActivitiesProvider");
  return ctx;
}
