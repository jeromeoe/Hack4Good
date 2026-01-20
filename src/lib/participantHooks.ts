// Supabase hooks for participant operations - UNIFIED REGISTRATIONS TABLE
// activities.id = bigint (number)
// profiles.id = uuid (string)
// registrations table - unified for both volunteers and participants
import { supabase } from "./supabase";
import type { ParticipantProfile, ParticipantActivity, Disability } from "../types/participant";
import type { Database, CaregiverInfo } from "../types/database";

type DBProfile = Database['public']['Tables']['profiles']['Row'];
type DBActivity = Database['public']['Tables']['activities']['Row'];
type DBRegistration = Database['public']['Tables']['registrations']['Row'];

/**
 * Convert database profile to app profile format
 */
function convertDBProfileToApp(dbProfile: any): ParticipantProfile {
  const caregiverInfo = dbProfile.caregiver_info as CaregiverInfo | null;
  
  return {
    id: dbProfile.id,  // UUID string
    name: dbProfile.full_name || "",
    email: dbProfile.email || "",
    phone: dbProfile.phone || "",
    age: dbProfile.age || 0,
    disability: (dbProfile.disability || "Other") as Disability,
    isCaregiver: caregiverInfo !== null,
    caregiverName: caregiverInfo?.name,
    caregiverEmail: caregiverInfo?.email,
    caregiverPhone: caregiverInfo?.phone,
    photoDataUrl: (dbProfile as any).photo_url || "", // Optional field that might not exist
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
  const timeStart = dbActivity.time_start || dbActivity.start_time || '09:00';
  const timeEnd = dbActivity.time_end || dbActivity.end_time || '17:00';
  
  // Combine date with times to create ISO strings
  const startISO = dateStr ? `${dateStr}T${timeStart}:00+08:00` : new Date().toISOString();
  const endISO = dateStr ? `${dateStr}T${timeEnd}:00+08:00` : new Date().toISOString();
  
  // Map disability_access to accessibility features
  const disabilityAccess = dbActivity.disability_access || 'Universal';
  const accessibility = {
    wheelchairAccessible: dbActivity.wheelchair_accessible ?? (disabilityAccess === 'Universal' || disabilityAccess === 'Wheelchair Friendly'),
    visuallyImpairedFriendly: dbActivity.visually_impaired_friendly ?? (disabilityAccess === 'Universal' || disabilityAccess === 'Sensory Friendly'),
    hearingImpairedFriendly: dbActivity.hearing_impaired_friendly ?? (disabilityAccess === 'Universal' || disabilityAccess === 'Sensory Friendly'),
    intellectualDisabilityFriendly: dbActivity.intellectual_disability_friendly ?? (disabilityAccess === 'Universal'),
    autismFriendly: dbActivity.autism_friendly ?? (disabilityAccess === 'Universal' || disabilityAccess === 'Sensory Friendly'),
  };
  
  // Map disability_access and suitable_disabilities to suitable disabilities array
  const suitableFor: Disability[] = [];
  
  // First check if there's a suitable_disabilities array
  if (dbActivity.suitable_disabilities && Array.isArray(dbActivity.suitable_disabilities)) {
    suitableFor.push(...(dbActivity.suitable_disabilities as Disability[]));
  } else {
    // Fall back to disability_access mapping
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
  }
  
  // Determine if user is registered or waitlisted
  const isRegistered = userRegistration?.status === 'registered' || userRegistration?.status === 'confirmed';
  const waitlisted = userRegistration?.status === 'waitlisted';
  
  return {
    id: String(dbActivity.id),  // Convert bigint to string for app
    title: dbActivity.title,
    startISO,
    endISO,
    location: dbActivity.location,
    description: dbActivity.description || dbActivity.comments || dbActivity.title,
    meetingPoint: dbActivity.meeting_point || dbActivity.meeting_location || dbActivity.location,
    mealsProvided: dbActivity.meals_provided || false,
    accessibility,
    capacity: dbActivity.participant_slots ?? (dbActivity as any).capacity ?? 20,
    registered: registrationCount,
    isRegistered,
    waitlisted,
    suitableFor,
    image: dbActivity.image || null,
  };
}

/**
 * Fetch current user's profile from database
 */
export async function fetchParticipantProfile(): Promise<ParticipantProfile | null> {
  try {
    console.log('=== Starting fetchParticipantProfile ===');
    
    // Get current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return null;
    }
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return null;
    }

    console.log('✓ Authenticated user found:', user.id);

    // Fetch profile from database using UUID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return null;
    }

    if (!profile) {
      console.error('❌ No profile found for user');
      return null;
    }

    console.log('✓ Profile found:', profile.full_name);

    // Check if role is participant (case-insensitive)
    const userRole = (profile.role || '').trim().toLowerCase();
    if (userRole !== 'participant') {
      console.error('❌ User role is NOT participant:', profile.role);
      return null;
    }

    console.log('✓ User role is participant');
    const convertedProfile = convertDBProfileToApp(profile);
    console.log('=== fetchParticipantProfile complete ===');
    
    return convertedProfile;
  } catch (error) {
    console.error('❌ Unexpected error in fetchParticipantProfile:', error);
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
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.disability !== undefined) dbUpdates.disability = updates.disability;
    // Note: photo_url removed - column doesn't exist in database
    // if (updates.photoDataUrl !== undefined) dbUpdates.photo_url = updates.photoDataUrl;

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

    console.log('=== Updating profile ===');
    console.log('User ID:', user.id);
    console.log('Updates to apply:', JSON.stringify(dbUpdates, null, 2));

    // Check if there are any updates to apply
    if (Object.keys(dbUpdates).length === 0) {
      console.log('⚠️ No fields to update - skipping database call');
      return true; // Return success since there's nothing to update
    }

    console.log('🔹 Executing Supabase UPDATE query...');
    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select(); // Add .select() to return updated data

    console.log('🔹 Supabase response received');
    console.log('Updated data:', data);
    console.log('Error:', error);

    if (error) {
      console.error('❌ Error updating profile:', error);
      console.error('Error details:', JSON.stringify({
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      }, null, 2));
      console.error('Attempted updates:', JSON.stringify(dbUpdates, null, 2));
      return false;
    }

    console.log('✓ Profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateParticipantProfile:', error);
    return false;
  }
}

/**
 * Fetch all activities with user's registration status using unified registrations table
 */
export async function fetchActivitiesForParticipant(): Promise<ParticipantActivity[]> {
  try {
    console.log('=== fetchActivitiesForParticipant START ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user');
      return [];
    }

    console.log('✓ User authenticated:', user.id);

    // Fetch all activities
    const today = new Date().toISOString().split('T')[0];
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true });

    if (activitiesError) {
      console.error('❌ Error fetching activities:', activitiesError);
      return [];
    }

    if (!activities) {
      console.log('✓ No activities found');
      return [];
    }

    console.log('✓ Fetched', activities.length, 'activities');

    // Fetch ALL registrations (for counting)
    const { data: allRegistrations, error: allRegError } = await supabase
      .from('registrations')
      .select('*');

    if (allRegError) {
      console.error('❌ Error fetching all registrations:', allRegError);
    }

    console.log('✓ Fetched', allRegistrations?.length || 0, 'total registrations');

    // Create map of activity_id to user's registration
    const userRegMap = new Map<number, DBRegistration>();
    const countMap = new Map<number, number>();

    allRegistrations?.forEach(reg => {
      // Count only registered/confirmed participants
      if (reg.status === 'registered' || reg.status === 'confirmed') {
        // Check if this is for a participant (not volunteer)
        if (reg.user_type === 'participant' || reg.user_type === 'Participant') {
          countMap.set(reg.activity_id, (countMap.get(reg.activity_id) || 0) + 1);
        }
      }
      
      // Track user's own registrations regardless of status
      if (reg.user_id === user.id) {
        userRegMap.set(reg.activity_id, reg);
      }
    });

    console.log('✓ User is registered for', userRegMap.size, 'activities');

    // Convert to app format
    const result = activities.map(activity => {
      const count = countMap.get(activity.id) || 0;
      const userReg = userRegMap.get(activity.id) || null;
      return convertDBActivityToApp(activity, count, userReg);
    });

    console.log('=== fetchActivitiesForParticipant COMPLETE ===');
    return result;
  } catch (error) {
    console.error('❌ Error in fetchActivitiesForParticipant:', error);
    return [];
  }
}

/**
 * Register for an activity using the unified registrations table
 */
export async function registerForActivity(
  activityId: string
): Promise<{ success: boolean; waitlisted: boolean; message: string }> {
  try {
    console.log('=== registerForActivity START ===');
    console.log('Activity ID:', activityId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user');
      return { success: false, waitlisted: false, message: 'User not authenticated' };
    }

    console.log('✓ User authenticated:', user.id);

    const activityNumericId = parseInt(activityId, 10);
    if (isNaN(activityNumericId)) {
      console.error('❌ Invalid activity ID:', activityId);
      return { success: false, waitlisted: false, message: 'Invalid activity ID' };
    }

    console.log('✓ Activity ID converted to number:', activityNumericId);

    // Check activity capacity
    console.log('Fetching activity details...');
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select('participant_slots, title')
      .eq('id', activityNumericId)
      .maybeSingle();

    if (activityError) {
      console.error('❌ Database error fetching activity:', activityError);
      return { success: false, waitlisted: false, message: `Database error: ${activityError.message}` };
    }
    
    if (!activity) {
      console.error('❌ Activity not found with ID:', activityNumericId);
      return { success: false, waitlisted: false, message: 'Activity not found. It may have been deleted.' };
    }
    
    console.log('✓ Activity found:', activity.title);

    const maxCapacity = activity.participant_slots ?? 20;
    console.log('✓ Capacity:', maxCapacity);

    // Count current participant registrations from unified table
    const { data: registrations, error: countError } = await supabase
      .from('registrations')
      .select('id, user_type, status')
      .eq('activity_id', activityNumericId)
      .or('status.eq.registered,status.eq.confirmed')
      .or('user_type.eq.participant,user_type.eq.Participant');

    if (countError) {
      console.error('❌ Error counting registrations:', countError);
      return { success: false, waitlisted: false, message: 'Error checking availability' };
    }

    const currentCount = registrations?.length || 0;
    console.log('✓ Current registrations:', currentCount, '/', maxCapacity);

    // Determine status
    const status = currentCount >= maxCapacity ? 'waitlisted' : 'registered';
    console.log('✓ Registration status will be:', status);

    // Create registration in unified table
    const { error: insertError } = await supabase
      .from('registrations')
      .insert({
        activity_id: activityNumericId,
        user_id: user.id,
        user_type: 'participant',  // Mark as participant
        status: status,
      });

    if (insertError) {
      console.error('❌ Error creating registration:', insertError);
      if (insertError.code === '23505') {
        return { success: false, waitlisted: false, message: 'Already registered for this activity' };
      }
      return { success: false, waitlisted: false, message: insertError.message };
    }

    console.log('✓ Registration created successfully');
    console.log('=== registerForActivity COMPLETE ===');

    return {
      success: true,
      waitlisted: status === 'waitlisted',
      message: status === 'waitlisted' ? 'Added to waitlist' : 'Successfully registered'
    };
  } catch (error) {
    console.error('❌ Error in registerForActivity:', error);
    return { success: false, waitlisted: false, message: 'An error occurred' };
  }
}

/**
 * Cancel activity registration using the unified registrations table
 */
export async function cancelActivityRegistration(activityId: string): Promise<boolean> {
  try {
    console.log('=== cancelActivityRegistration START ===');
    console.log('Activity ID:', activityId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No authenticated user');
      return false;
    }

    console.log('✓ User authenticated:', user.id);

    const activityNumericId = parseInt(activityId, 10);
    if (isNaN(activityNumericId)) {
      console.error('❌ Invalid activity ID');
      return false;
    }

    console.log('✓ Activity ID converted:', activityNumericId);

    // Delete from unified registrations table
    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('activity_id', activityNumericId)
      .eq('user_id', user.id);

    if (error) {
      console.error('❌ Error cancelling registration:', error);
      return false;
    }

    console.log('✓ Registration cancelled successfully');
    console.log('=== cancelActivityRegistration COMPLETE ===');
    return true;
  } catch (error) {
    console.error('❌ Error in cancelActivityRegistration:', error);
    return false;
  }
}

/**
 * Check for scheduling conflicts using unified registrations table
 */
export async function checkSchedulingConflict(activityId: string): Promise<boolean> {
  try {
    console.log('=== checkSchedulingConflict START ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const activityNumericId = parseInt(activityId, 10);
    if (isNaN(activityNumericId)) return false;

    // Get the target activity
    const { data: targetActivity, error: targetError } = await supabase
      .from('activities')
      .select('date, time_start, time_end, start_time, end_time')
      .eq('id', activityNumericId)
      .single();

    if (targetError || !targetActivity) return false;

    // Get user's registered activities from unified table
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('activity_id')
      .eq('user_id', user.id)
      .or('status.eq.registered,status.eq.confirmed');

    if (regError || !registrations || registrations.length === 0) return false;

    const activityIds = registrations.map(r => r.activity_id);

    // Get details of registered activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('date, time_start, time_end, start_time, end_time')
      .in('id', activityIds);

    if (activitiesError || !activities) return false;

    // Build target time range
    const targetDate = targetActivity.date;
    const targetTimeStart = targetActivity.time_start || targetActivity.start_time || '09:00';
    const targetTimeEnd = targetActivity.time_end || targetActivity.end_time || '17:00';
    const targetStartISO = `${targetDate}T${targetTimeStart}:00+08:00`;
    const targetEndISO = `${targetDate}T${targetTimeEnd}:00+08:00`;
    const targetStart = new Date(targetStartISO).getTime();
    const targetEnd = new Date(targetEndISO).getTime();

    // Check for time overlaps
    for (const activity of activities) {
      const actDate = activity.date;
      const actTimeStart = activity.time_start || activity.start_time || '09:00';
      const actTimeEnd = activity.time_end || activity.end_time || '17:00';
      const actStartISO = `${actDate}T${actTimeStart}:00+08:00`;
      const actEndISO = `${actDate}T${actTimeEnd}:00+08:00`;
      const actStart = new Date(actStartISO).getTime();
      const actEnd = new Date(actEndISO).getTime();

      if (targetStart < actEnd && actStart < targetEnd) {
        console.log('✓ Conflict detected');
        return true; // Conflict found
      }
    }

    console.log('✓ No conflicts found');
    console.log('=== checkSchedulingConflict COMPLETE ===');
    return false;
  } catch (error) {
    console.error('Error in checkSchedulingConflict:', error);
    return false;
  }
}

/**
 * Get weekly activity count for current user using unified registrations table
 */
export async function getWeeklyActivityCount(): Promise<number> {
  try {
    console.log('=== getWeeklyActivityCount START ===');
    
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

    // Get user's registrations from unified table
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select('activity_id')
      .eq('user_id', user.id)
      .or('status.eq.registered,status.eq.confirmed');

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

    const count = activities?.length || 0;
    console.log('✓ Weekly count:', count);
    console.log('=== getWeeklyActivityCount COMPLETE ===');
    
    return count;
  } catch (error) {
    console.error('Error in getWeeklyActivityCount:', error);
    return 0;
  }
}
