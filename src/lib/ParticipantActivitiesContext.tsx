import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchParticipantProfile,
  updateParticipantProfile as updateProfileInDB,
  fetchActivitiesForParticipant,
  registerForActivity as registerInDB,
  cancelActivityRegistration as cancelInDB,
  checkSchedulingConflict,
  getWeeklyActivityCount as getWeeklyCountFromDB,
} from "./participantHooks";
import type { 
  ParticipantActivity, 
  ParticipantProfile, 
  Disability,
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
  toggleRegistration: (activityId: string) => Promise<void>;
  updateProfile: (profile: Partial<ParticipantProfile>) => Promise<boolean>;
  checkClash: (activityId: string) => boolean;
  getWeeklyCount: () => number;
  isLoading: boolean;
  refreshActivities: () => Promise<void>;
};

const ParticipantActivitiesContext = createContext<Ctx | null>(null);

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
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [activities, setActivities] = useState<ParticipantActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [clashCache, setClashCache] = useState<Map<string, boolean>>(new Map());

  const [filters, setFiltersState] = useState<ActivityFilters>({
    date: "all",
    suitability: "all",
    location: "all",
    onlyAvailable: false,
  });

  const [toast, setToast] = useState<Toast>(null);

  // Load participant data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Load profile
        const profileData = await fetchParticipantProfile();
        setProfile(profileData);

        if (profileData) {
          // Load activities
          const activitiesData = await fetchActivitiesForParticipant();
          setActivities(activitiesData);

          // Load weekly count
          const count = await getWeeklyCountFromDB();
          setWeeklyCount(count);
        } else {
          console.log('No profile found - user may not be logged in as participant');
        }
      } catch (error) {
        console.error('Error loading participant data:', error);
        setToast({ 
          message: "Error loading data. Please try refreshing the page.", 
          type: "error" 
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Preload clash detection for all activities
  useEffect(() => {
    if (activities.length === 0) return;
    
    const newCache = new Map<string, boolean>();
    
    // Check for clashes asynchronously for all activities
    Promise.all(
      activities.map(async (activity) => {
        const hasClash = await checkSchedulingConflict(activity.id);
        return [activity.id, hasClash] as [string, boolean];
      })
    ).then((results) => {
      results.forEach(([id, hasClash]) => {
        newCache.set(id, hasClash);
      });
      setClashCache(newCache);
    });
  }, [activities]);

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

  const refreshActivities = async () => {
    if (!profile) return;
    
    try {
      const activitiesData = await fetchActivitiesForParticipant();
      setActivities(activitiesData);
      
      const count = await getWeeklyCountFromDB();
      setWeeklyCount(count);
      
      // Clear clash cache when activities refresh
      setClashCache(new Map());
    } catch (error) {
      console.error('Error refreshing activities:', error);
    }
  };

  const toggleRegistration = async (activityId: string) => {
    if (!profile) {
      setToast({ 
        message: "Profile not loaded. Please try again.", 
        type: "error" 
      });
      setTimeout(clearToast, 3000);
      return;
    }

    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    try {
      if (!activity.isRegistered) {
        // Registering
        
        // Check for clash
        const hasClash = await checkSchedulingConflict(activityId);
        if (hasClash) {
          setToast({ 
            message: "⚠️ Clash detected: This activity overlaps with another registered activity.", 
            type: "warning" 
          });
          setTimeout(clearToast, 3000);
          return;
        }

        // Check weekly limit
        if (weeklyCount >= 3) {
          setToast({ 
            message: "⚠️ Weekly limit reached: You can only register for 3 activities per week.", 
            type: "warning" 
          });
          setTimeout(clearToast, 3000);
          return;
        }

        // Register
        const result = await registerInDB(activityId);
        
        if (result.success) {
          setToast({ 
            message: result.waitlisted 
              ? "✓ You've been added to the waitlist for this activity." 
              : "✓ Successfully registered for this activity!", 
            type: "success" 
          });
          
          // Refresh activities to get updated data
          await refreshActivities();
        } else {
          setToast({ 
            message: `Error: ${result.message}`, 
            type: "error" 
          });
        }
      } else {
        // Cancelling
        const success = await cancelInDB(activityId);
        
        if (success) {
          setToast({ 
            message: "✓ Successfully cancelled your registration.", 
            type: "success" 
          });
          
          // Refresh activities to get updated data
          await refreshActivities();
        } else {
          setToast({ 
            message: "Error cancelling registration. Please try again.", 
            type: "error" 
          });
        }
      }

      setTimeout(clearToast, 3000);
    } catch (error) {
      console.error('Error toggling registration:', error);
      setToast({ 
        message: "An error occurred. Please try again.", 
        type: "error" 
      });
      setTimeout(clearToast, 3000);
    }
  };

  const updateProfile = async (updates: Partial<ParticipantProfile>): Promise<boolean> => {
    console.log('[CONTEXT] updateProfile called');
    console.log('[CONTEXT] Profile exists?', !!profile);
    console.log('[CONTEXT] Updates received:', JSON.stringify(updates, null, 2));
    
    if (!profile) {
      console.error('[CONTEXT] No profile - returning false');
      return false;
    }

    try {
      console.log('[CONTEXT] Calling updateProfileInDB...');
      const success = await updateProfileInDB(updates);
      console.log('[CONTEXT] updateProfileInDB returned:', success);
      
      if (success) {
        console.log('[CONTEXT] Update succeeded - updating local profile state');
        // Update profile state so data persists and survives refresh
        setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
        setToast({ 
          message: "✓ Profile updated successfully!", 
          type: "success" 
        });
      } else {
        console.error('[CONTEXT] Update failed - setting error toast');
        setToast({ 
          message: "Error updating profile. Please try again.", 
          type: "error" 
        });
      }
      
      setTimeout(clearToast, 3000);
      console.log('[CONTEXT] Returning:', success);
      return success;
    } catch (error) {
      console.error('[CONTEXT] Exception in updateProfile:', error);
      setToast({ 
        message: "An error occurred. Please try again.", 
        type: "error" 
      });
      setTimeout(clearToast, 3000);
      return false;
    }
  };

  const checkClash = (activityId: string): boolean => {
    // Return cached result if available
    if (clashCache.has(activityId)) {
      return clashCache.get(activityId)!;
    }
    
    // Check async and cache the result
    checkSchedulingConflict(activityId).then((hasClash) => {
      setClashCache((prev) => new Map(prev).set(activityId, hasClash));
    });
    
    // Return false initially (will update on next render if clash detected)
    return false;
  };

  const getWeeklyCount = (): number => {
    return weeklyCount;
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
    isLoading,
    refreshActivities,
  };

  return (
    <ParticipantActivitiesContext.Provider value={value}>
      {children}
      
      {/* Toast notification UI */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 
            toast.type === 'warning' ? 'bg-orange-600 text-white' : 
            'bg-gray-900 text-white'
        }`}>
          <p className="font-medium">{toast.message}</p>
        </div>
      )}
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
