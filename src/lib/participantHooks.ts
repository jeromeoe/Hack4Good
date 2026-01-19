// Supabase hooks for participant/caregiver operations - YOUR EXACT SCHEMA
// activities.id = bigint (number)
// profiles.id = uuid (string)
import { supabase } from "./supabase";
import type { ParticipantProfile, ParticipantActivity, Disability } from "../types/participant";
import type { Database, CaregiverInfo } from "../types/database";

type DBProfile = Database['public']['Tables']['profiles']['Row'];
type DBActivity = Database['public']['Tables']['activities']['Row'];
type DBRegistration = Database['public']['Tables']['activity_registrations']['Row'];

/**
 * Convert database profile to app profile format
 */
function convertDBProfileToApp(dbProfile: DBProfile): ParticipantProfile {
  const caregiverInfo = dbProfile.caregiver_info as CaregiverInfo | null;
  
  return {
    id: dbProfile.id,  // UUID string
    name: dbProfile.full_name,
    email: dbProfile.email,
    phone: dbProfile.phone || "",
    age: dbProfile.age || 0,
    disability: (dbProfile.disability || "Other") as Disability,
    isCaregiver: caregiverInfo !== null,
    caregiverName: caregiverInfo?.name,
    caregiverEmail: caregiverInfo?.email,
    caregiverPhone: caregiverInfo?.phone,
    photoDataUrl: dbProfile.photo_url || "",
  };
}

/**
 * Convert database activity to app activity format
 */
function convertDBActivityToApp(
  dbActivity: DBActivity,
  registrationCount: number,
  userRegistration: DBRegistration | null
): ParticipantActivity {
  // Build start and end times from date + time_start/time_end
  const dateStr = dbActivity.date;
  const timeStart = dbActivity.time_start || '09:00';
  const timeEnd = dbActivity.time_end || '17:00';
  
  // Combine date with times to create ISO strings
  const startISO = dateStr ? `${dateStr}T${timeStart}:00+08:00` : new Date().toISOString();
  const endISO = dateStr ? `${dateStr}T${timeEnd}:00+08:00` : new Date().toISOString();
  
  // Map disability_access to accessibility features
  const disabilityAccess = dbActivity.disability_access || 'Universal';
  const accessibility = {
    wheelchairAccessible: disabilityAccess === 'Universal' || disabilityAccess === 'Wheelchair Friendly',
    visuallyImpairedFriendly: disabilityAccess === 'Universal' || disabilityAccess === 'Sensory Friendly',
    hearingImpairedFriendly: disabilityAccess === 'Universal' || disabilityAccess === 'Sensory Friendly',
    intellectualDisabilityFriendly: disabilityAccess === 'Universal',
    autismFriendly: disabilityAccess === 'Universal' || disabilityAccess === 'Sensory Friendly',
  };
  
  // Map disability_access to suitable disabilities
  const suitableFor: Disability[] = [];
  if (disabilityAccess === 'Universal') {
    suitableFor.push(
      'Physical Disability',
      'Visual Impairment',
      'Hearing Impairment',
      'Intellectual Disability',
      'Autism Spectrum',
      'Multiple Disabilities',
      'Other'
    );
  } else if (disabilityAccess === 'Wheelchair Friendly') {
    suitableFor.push('Physical Disability', 'Multiple Disabilities');
  } else if (disabilityAccess === 'Sensory Friendly') {
    suitableFor.push('Autism Spectrum', 'Visual Impairment', 'Hearing Impairment');
  } else if (disabilityAccess === 'Ambulant') {
    suitableFor.push('Visual Impairment', 'Hearing Impairment', 'Intellectual Disability', 'Other');
  }
  
  return {
    id: String(dbActivity.id),  // Convert bigint to string for app
    title: dbActivity.title,
    startISO,
    endISO,
    location: dbActivity.location,
    description: dbActivity.comments || dbActivity.title,
    meetingPoint: dbActivity.meeting_location || dbActivity.location,
    mealsProvided: false, // Not in current schema
    accessibility,
    capacity: dbActivity.participant_slots || 20,
    registered: registrationCount,
    isRegistered: userRegistration?.status === 'registered',
    waitlisted: userRegistration?.status === 'waitlisted',
    suitableFor,
  };
}

/**
 * Fetch current user's profile from database
 */
export async function fetchParticipantProfile(): Promise<ParticipantProfile | null> {
  try {
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return null;
    }

    console.log('Fetching profile for user ID:', user.id);

    // Fetch profile from database using UUID (without role filter first to debug)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)  // user.id is UUID
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      console.error('Profile error details:', JSON.stringify(profileError, null, 2));
      return null;
    }

    if (!profile) {
      console.error('No profile found for user ID:', user.id);
      return null;
    }

    console.log('Profile found:', {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      full_name: profile.full_name
    });

    // Check if role is participant (case-insensitive)
    const userRole = (profile.role || '').trim().toLowerCase();
    if (userRole !== 'participant') {
      console.error('User role is not participant:', profile.role);
      console.error('User should access their portal at:', userRole === 'staff' ? '/staff' : userRole === 'volunteer' ? '/volunteer' : 'unknown');
      return null;
    }

    return convertDBProfileToApp(profile);
  } catch (error) {
    console.error('Error in fetchParticipantProfile:', error);
    return null;
  }
}

/**
 * Update participant profile in database
 */
export async function updateParticipantProfile(
  updates: Partial<ParticipantProfile>
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Prepare database updates
    const dbUpdates: Database['public']['Tables']['profiles']['Update'] = {};

    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.disability !== undefined) dbUpdates.disability = updates.disability;
    if (updates.photoDataUrl !== undefined) dbUpdates.photo_url = updates.photoDataUrl;

    // Handle caregiver info
    if (updates.isCaregiver !== undefined) {
      if (updates.isCaregiver) {
        const caregiverInfo: CaregiverInfo = {
          name: updates.caregiverName || '',
          email: updates.caregiverEmail || undefined,
          phone: updates.caregiverPhone || undefined,
        };
        dbUpdates.caregiver_info = caregiverInfo as any;
      } else {
        dbUpdates.caregiver_info = null;
      }
    } else if (updates.caregiverName || updates.caregiverEmail || updates.caregiverPhone) {
      // Update existing caregiver info
      const caregiverInfo: CaregiverInfo = {
        name: updates.caregiverName || '',
        email: updates.caregiverEmail,
        phone: updates.caregiverPhone,
      };
      dbUpdates.caregiver_info = caregiverInfo as any;
    }

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateParticipantProfile:', error);
    return false;
  }
}

/**
 * Fetch all activities with user's registration status
 */
export async function fetchActivitiesForParticipant(): Promise<ParticipantActivity[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Fetch all activities (filter by date on client side since we need to combine date + time)
    const today = new Date().toISOString().split('T')[0];
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return [];
    }

    if (!activities) return [];

    // Fetch user's registrations (participant_id is UUID)
    const { data: userRegistrations, error: regError } = await supabase
      .from('activity_registrations')
      .select('*')
      .eq('participant_id', user.id);  // UUID

    if (regError) {
      console.error('Error fetching registrations:', regError);
    }

    // Create map of activity_id (number) to user registration
    const userRegMap = new Map<number, DBRegistration>();
    userRegistrations?.forEach(reg => {
      userRegMap.set(reg.activity_id, reg);
    });

    // Fetch registration counts for each activity
    const { data: allRegistrations, error: countError } = await supabase
      .from('activity_registrations')
      .select('activity_id, status')
      .eq('status', 'registered');

    if (countError) {
      console.error('Error fetching registration counts:', countError);
    }

    // Count registrations per activity
    const countMap = new Map<number, number>();
    allRegistrations?.forEach(reg => {
      countMap.set(reg.activity_id, (countMap.get(reg.activity_id) || 0) + 1);
    });

    // Convert to app format
    return activities.map(activity => {
      const count = countMap.get(activity.id) || 0;
      const userReg = userRegMap.get(activity.id) || null;
      return convertDBActivityToApp(activity, count, userReg);
    });
  } catch (error) {
    console.error('Error in fetchActivitiesForParticipant:', error);
    return [];
  }
}

/**
 * Register for an activity
 */
export async function registerForActivity(
  activityId: string
): Promise<{ success: boolean; waitlisted: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, waitlisted: false, message: 'User not authenticated' };
    }

    const activityNumericId = parseInt(activityId, 10);
    if (isNaN(activityNumericId)) {
      return { success: false, waitlisted: false, message: 'Invalid activity ID' };
    }

    // Check activity capacity
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('participant_slots')
      .eq('id', activityNumericId)
      .single();

    if (activityError || !activity) {
      return { success: false, waitlisted: false, message: 'Activity not found' };
    }

    const maxCapacity = activity.participant_slots || 20;

    // Count current registrations
    const { data: registrations, error: countError } = await supabase
      .from('activity_registrations')
      .select('id')
      .eq('activity_id', activityNumericId)
      .eq('status', 'registered');

    if (countError) {
      console.error('Error counting registrations:', countError);
      return { success: false, waitlisted: false, message: 'Error checking availability' };
    }

    const currentCount = registrations?.length || 0;
    const status = currentCount >= maxCapacity ? 'waitlisted' : 'registered';

    // Create registration
    const { error: insertError } = await supabase
      .from('activity_registrations')
      .insert({
        activity_id: activityNumericId,  // bigint
        participant_id: user.id,  // UUID
        status,
      });

    if (insertError) {
      console.error('Error creating registration:', insertError);
      if (insertError.code === '23505') {
        return { success: false, waitlisted: false, message: 'Already registered for this activity' };
      }
      return { success: false, waitlisted: false, message: insertError.message };
    }

    return {
      success: true,
      waitlisted: status === 'waitlisted',
      message: status === 'waitlisted' ? 'Added to waitlist' : 'Successfully registered'
    };
  } catch (error) {
    console.error('Error in registerForActivity:', error);
    return { success: false, waitlisted: false, message: 'An error occurred' };
  }
}

/**
 * Cancel activity registration
 */
export async function cancelActivityRegistration(activityId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const activityNumericId = parseInt(activityId, 10);
    if (isNaN(activityNumericId)) return false;

    const { error } = await supabase
      .from('activity_registrations')
      .update({ status: 'cancelled' })
      .eq('activity_id', activityNumericId)  // bigint
      .eq('participant_id', user.id);  // UUID

    if (error) {
      console.error('Error cancelling registration:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in cancelActivityRegistration:', error);
    return false;
  }
}

/**
 * Check for scheduling conflicts
 */
export async function checkSchedulingConflict(activityId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const activityNumericId = parseInt(activityId, 10);
    if (isNaN(activityNumericId)) return false;

    // Get the target activity
    const { data: targetActivity, error: targetError } = await supabase
      .from('activities')
      .select('date, time_start, time_end')
      .eq('id', activityNumericId)
      .single();

    if (targetError || !targetActivity) return false;

    // Get user's registered activities
    const { data: registrations, error: regError } = await supabase
      .from('activity_registrations')
      .select('activity_id')
      .eq('participant_id', user.id)  // UUID
      .eq('status', 'registered');

    if (regError || !registrations || registrations.length === 0) return false;

    const activityIds = registrations.map(r => r.activity_id);

    // Get details of registered activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('date, time_start, time_end')
      .in('id', activityIds);

    if (activitiesError || !activities) return false;

    // Build target time range
    const targetDate = targetActivity.date;
    const targetTimeStart = targetActivity.time_start || '09:00';
    const targetTimeEnd = targetActivity.time_end || '17:00';
    const targetStartISO = `${targetDate}T${targetTimeStart}:00+08:00`;
    const targetEndISO = `${targetDate}T${targetTimeEnd}:00+08:00`;
    const targetStart = new Date(targetStartISO).getTime();
    const targetEnd = new Date(targetEndISO).getTime();

    // Check for time overlaps
    for (const activity of activities) {
      const actDate = activity.date;
      const actTimeStart = activity.time_start || '09:00';
      const actTimeEnd = activity.time_end || '17:00';
      const actStartISO = `${actDate}T${actTimeStart}:00+08:00`;
      const actEndISO = `${actDate}T${actTimeEnd}:00+08:00`;
      const actStart = new Date(actStartISO).getTime();
      const actEnd = new Date(actEndISO).getTime();

      if (targetStart < actEnd && actStart < targetEnd) {
        return true; // Conflict found
      }
    }

    return false;
  } catch (error) {
    console.error('Error in checkSchedulingConflict:', error);
    return false;
  }
}

/**
 * Get weekly activity count for current user
 */
export async function getWeeklyActivityCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Get start and end of current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Get user's registrations for this week
    const { data: registrations, error: regError } = await supabase
      .from('activity_registrations')
      .select('activity_id')
      .eq('participant_id', user.id)  // UUID
      .eq('status', 'registered');

    if (regError || !registrations) return 0;

    const activityIds = registrations.map(r => r.activity_id);
    if (activityIds.length === 0) return 0;

    // Get activities within this week
    const startDateStr = startOfWeek.toISOString().split('T')[0];
    const endDateStr = endOfWeek.toISOString().split('T')[0];
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id')
      .in('id', activityIds)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (activitiesError) return 0;

    return activities?.length || 0;
  } catch (error) {
    console.error('Error in getWeeklyActivityCount:', error);
    return 0;
  }
}
