import React, { createContext, useContext, useMemo, useState } from "react";
import type { 
  ParticipantActivity, 
  ParticipantProfile, 
  Disability,
  ActivityAccessibility 
} from "../types/participant";

export type ActivityFilters = {
  date: "all" | "today" | "week" | "month";
  suitability: "all" | "suitable";
  location: "all" | string;
  onlyAvailable: boolean;
};

type Toast = { message: string; type: "success" | "error" | "warning" } | null;

type Ctx = {
  activities: ParticipantActivity[];
  filteredActivities: ParticipantActivity[];
  myActivities: ParticipantActivity[];
  profile: ParticipantProfile | null;
  locations: string[];
  filters: ActivityFilters;
  setFilters: (patch: Partial<ActivityFilters>) => void;
  toast: Toast;
  clearToast: () => void;
  toggleRegistration: (activityId: string) => void;
  updateProfile: (profile: Partial<ParticipantProfile>) => void;
  checkClash: (activityId: string) => boolean;
  getWeeklyCount: () => number;
};

const ParticipantActivitiesContext = createContext<Ctx | null>(null);

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

function endOfNext30Days() {
  const d = startOfToday();
  d.setDate(d.getDate() + 30);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getStartOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getEndOfWeek() {
  const d = getStartOfWeek();
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function isActivitySuitableForDisability(
  activity: ParticipantActivity,
  disability: Disability
): boolean {
  // Check if activity explicitly lists this disability as suitable
  if (activity.suitableFor.includes(disability)) {
    return true;
  }

  // Check accessibility features based on disability type
  const { accessibility } = activity;
  
  switch (disability) {
    case "Physical Disability":
      return accessibility.wheelchairAccessible;
    case "Visual Impairment":
      return accessibility.visuallyImpairedFriendly;
    case "Hearing Impairment":
      return accessibility.hearingImpairedFriendly;
    case "Intellectual Disability":
      return accessibility.intellectualDisabilityFriendly;
    case "Autism Spectrum":
      return accessibility.autismFriendly;
    case "Multiple Disabilities":
      // For multiple disabilities, require multiple accessibility features
      return accessibility.wheelchairAccessible && 
             accessibility.visuallyImpairedFriendly;
    default:
      return true; // "Other" disability - show all activities
  }
}

export function ParticipantActivitiesProvider({ children }: { children: React.ReactNode }) {
  // Mock profile data
  const [profile, setProfile] = useState<ParticipantProfile>({
    id: "p1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+65 9123 4567",
    age: 25,
    disability: "Physical Disability",
    isCaregiver: false,
    photoDataUrl: "",
  });

  // Mock activities data
  const [activities, setActivities] = useState<ParticipantActivity[]>([
    {
      id: "pa1",
      title: "Art Jamming Session",
      startISO: "2026-01-22T10:00:00+08:00",
      endISO: "2026-01-22T12:00:00+08:00",
      location: "MINDS HQ",
      description: "A fun art jamming session where participants can explore their creativity through painting and drawing.",
      meetingPoint: "Main lobby at MINDS HQ",
      mealsProvided: true,
      accessibility: {
        wheelchairAccessible: true,
        visuallyImpairedFriendly: true,
        hearingImpairedFriendly: true,
        intellectualDisabilityFriendly: true,
        autismFriendly: true,
      },
      capacity: 15,
      registered: 8,
      isRegistered: false,
      waitlisted: false,
      suitableFor: ["Physical Disability", "Visual Impairment", "Intellectual Disability", "Autism Spectrum"],
    },
    {
      id: "pa2",
      title: "Music Therapy Workshop",
      startISO: "2026-01-23T14:00:00+08:00",
      endISO: "2026-01-23T16:00:00+08:00",
      location: "Community Center",
      description: "Experience the therapeutic benefits of music through guided activities and exercises.",
      meetingPoint: "Community Center entrance",
      mealsProvided: false,
      accessibility: {
        wheelchairAccessible: true,
        visuallyImpairedFriendly: true,
        hearingImpairedFriendly: false,
        intellectualDisabilityFriendly: true,
        autismFriendly: true,
      },
      capacity: 12,
      registered: 10,
      isRegistered: true,
      waitlisted: false,
      suitableFor: ["Physical Disability", "Visual Impairment", "Intellectual Disability", "Autism Spectrum"],
    },
    {
      id: "pa3",
      title: "Outdoor Walking Tour",
      startISO: "2026-01-25T09:00:00+08:00",
      endISO: "2026-01-25T11:30:00+08:00",
      location: "Botanic Gardens",
      description: "A guided walking tour through the beautiful Botanic Gardens with accessible pathways.",
      meetingPoint: "Botanic Gardens Visitor Center",
      mealsProvided: false,
      accessibility: {
        wheelchairAccessible: true,
        visuallyImpairedFriendly: true,
        hearingImpairedFriendly: true,
        intellectualDisabilityFriendly: true,
        autismFriendly: false,
      },
      capacity: 20,
      registered: 5,
      isRegistered: false,
      waitlisted: false,
      suitableFor: ["Physical Disability", "Visual Impairment", "Hearing Impairment"],
    },
    {
      id: "pa4",
      title: "Cooking Class",
      startISO: "2026-01-26T15:00:00+08:00",
      endISO: "2026-01-26T17:30:00+08:00",
      location: "MINDS Kitchen",
      description: "Learn to prepare simple and delicious meals in an adapted kitchen environment.",
      meetingPoint: "MINDS Kitchen, Level 2",
      mealsProvided: true,
      accessibility: {
        wheelchairAccessible: true,
        visuallyImpairedFriendly: false,
        hearingImpairedFriendly: true,
        intellectualDisabilityFriendly: true,
        autismFriendly: true,
      },
      capacity: 10,
      registered: 10,
      isRegistered: false,
      waitlisted: false,
      suitableFor: ["Physical Disability", "Hearing Impairment", "Intellectual Disability"],
    },
    {
      id: "pa5",
      title: "Movie Screening",
      startISO: "2026-01-27T19:00:00+08:00",
      endISO: "2026-01-27T21:00:00+08:00",
      location: "Community Hall",
      description: "Enjoy a movie screening with subtitles and audio description available.",
      meetingPoint: "Community Hall main entrance",
      mealsProvided: true,
      accessibility: {
        wheelchairAccessible: true,
        visuallyImpairedFriendly: true,
        hearingImpairedFriendly: true,
        intellectualDisabilityFriendly: true,
        autismFriendly: true,
      },
      capacity: 30,
      registered: 12,
      isRegistered: true,
      waitlisted: false,
      suitableFor: ["Physical Disability", "Visual Impairment", "Hearing Impairment", "Intellectual Disability", "Autism Spectrum"],
    },
    {
      id: "pa6",
      title: "Gardening Workshop",
      startISO: "2026-01-28T10:00:00+08:00",
      endISO: "2026-01-28T12:00:00+08:00",
      location: "MINDS Garden",
      description: "Learn basic gardening skills and plant your own herbs to take home.",
      meetingPoint: "MINDS Garden shed",
      mealsProvided: false,
      accessibility: {
        wheelchairAccessible: false,
        visuallyImpairedFriendly: true,
        hearingImpairedFriendly: true,
        intellectualDisabilityFriendly: true,
        autismFriendly: true,
      },
      capacity: 8,
      registered: 8,
      isRegistered: false,
      waitlisted: false,
      suitableFor: ["Visual Impairment", "Hearing Impairment", "Intellectual Disability"],
    },
  ]);

  const [filters, setFiltersState] = useState<ActivityFilters>({
    date: "all",
    suitability: "all",
    location: "all",
    onlyAvailable: false,
  });

  const [toast, setToast] = useState<Toast>(null);

  // Extract unique locations
  const locations = useMemo(() => {
    const locs = new Set(activities.map((a) => a.location));
    return Array.from(locs).sort();
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Date filter
    if (filters.date === "today") {
      const todayStart = startOfToday();
      const todayEnd = endOfToday();
      filtered = filtered.filter((a) => {
        const start = new Date(a.startISO);
        return start >= todayStart && start <= todayEnd;
      });
    } else if (filters.date === "week") {
      const todayStart = startOfToday();
      const weekEnd = endOfNext7Days();
      filtered = filtered.filter((a) => {
        const start = new Date(a.startISO);
        return start >= todayStart && start <= weekEnd;
      });
    } else if (filters.date === "month") {
      const todayStart = startOfToday();
      const monthEnd = endOfNext30Days();
      filtered = filtered.filter((a) => {
        const start = new Date(a.startISO);
        return start >= todayStart && start <= monthEnd;
      });
    }

    // Suitability filter
    if (filters.suitability === "suitable" && profile) {
      filtered = filtered.filter((a) => 
        isActivitySuitableForDisability(a, profile.disability)
      );
    }

    // Location filter
    if (filters.location !== "all") {
      filtered = filtered.filter((a) => a.location === filters.location);
    }

    // Only available filter
    if (filters.onlyAvailable) {
      filtered = filtered.filter((a) => !a.isRegistered && a.registered < a.capacity);
    }

    return filtered;
  }, [activities, filters, profile]);

  // My registered activities
  const myActivities = useMemo(() => {
    return activities.filter((a) => a.isRegistered);
  }, [activities]);

  const setFilters = (patch: Partial<ActivityFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }));
  };

  const clearToast = () => setToast(null);

  const toggleRegistration = (activityId: string) => {
    setActivities((prev) =>
      prev.map((a) => {
        if (a.id !== activityId) return a;

        // Check for clash
        const hasClash = checkClash(activityId);
        
        // Check weekly limit (max 3 activities per week)
        const weeklyCount = getWeeklyCount();

        if (!a.isRegistered) {
          // Registering
          if (hasClash) {
            setToast({ 
              message: "⚠️ Clash detected: This activity overlaps with another registered activity.", 
              type: "warning" 
            });
            return a;
          }

          if (weeklyCount >= 3) {
            setToast({ 
              message: "⚠️ Weekly limit reached: You can only register for 3 activities per week.", 
              type: "warning" 
            });
            return a;
          }

          if (a.registered >= a.capacity) {
            setToast({ 
              message: "✓ You've been added to the waitlist for this activity.", 
              type: "success" 
            });
            return { ...a, waitlisted: true };
          }

          setToast({ 
            message: "✓ Successfully registered for this activity!", 
            type: "success" 
          });
          return { ...a, isRegistered: true, registered: a.registered + 1 };
        } else {
          // Cancelling
          setToast({ 
            message: "✓ Successfully cancelled your registration.", 
            type: "success" 
          });
          return { ...a, isRegistered: false, registered: Math.max(0, a.registered - 1), waitlisted: false };
        }
      })
    );

    setTimeout(clearToast, 3000);
  };

  const updateProfile = (updates: Partial<ParticipantProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    setToast({ 
      message: "✓ Profile updated successfully!", 
      type: "success" 
    });
    setTimeout(clearToast, 3000);
  };

  const checkClash = (activityId: string): boolean => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return false;

    return myActivities.some((registered) => {
      if (registered.id === activityId) return false;
      return overlaps(
        activity.startISO,
        activity.endISO,
        registered.startISO,
        registered.endISO
      );
    });
  };

  const getWeeklyCount = (): number => {
    const weekStart = getStartOfWeek();
    const weekEnd = getEndOfWeek();

    return myActivities.filter((a) => {
      const start = new Date(a.startISO);
      return start >= weekStart && start <= weekEnd;
    }).length;
  };

  const value: Ctx = {
    activities,
    filteredActivities,
    myActivities,
    profile,
    locations,
    filters,
    setFilters,
    toast,
    clearToast,
    toggleRegistration,
    updateProfile,
    checkClash,
    getWeeklyCount,
  };

  return (
    <ParticipantActivitiesContext.Provider value={value}>
      {children}
    </ParticipantActivitiesContext.Provider>
  );
}

export function useParticipantActivities() {
  const ctx = useContext(ParticipantActivitiesContext);
  if (!ctx) {
    throw new Error("useParticipantActivities must be used within ParticipantActivitiesProvider");
  }
  return ctx;
}
