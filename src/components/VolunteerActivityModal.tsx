// components/VolunteerActivityModal.tsx
import type { ParticipantActivity } from "../types/participant";
import ActivityDetailModal from "./ActivityDetailModal";

// Extended Activity type that matches what VolunteerCalendar passes
type VolunteerActivity = {
  id: string;
  title: string;
  startISO: string;
  endISO: string;
  location: string;
  capacity: number;
  signedUp: number;
  isSignedUp: boolean;
  myRole?: string;
};

type Props = {
  activity: any; // Using any since the type definition doesn't match actual usage
  signedUp: boolean;
  onToggle: () => void;
  onClose: () => void;
};

// Convert volunteer Activity to ParticipantActivity format
function convertToParticipantActivity(activity: any, signedUp: boolean): ParticipantActivity {
  return {
    id: String(activity.id),
    title: activity.title,
    startISO: activity.startISO || new Date().toISOString(),
    endISO: activity.endISO || new Date().toISOString(),
    location: activity.location,
    description: "Volunteer activity - help support participants with special needs. Your contribution makes a meaningful difference in the lives of individuals with special needs.",
    meetingPoint: activity.location,
    mealsProvided: false,
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: true,
      hearingImpairedFriendly: true,
      intellectualDisabilityFriendly: true,
      autismFriendly: true,
    },
    capacity: activity.capacity || activity.volunteerSlotsTotal || 10,
    registered: activity.signedUp || activity.volunteerSlotsFilled || 0,
    isRegistered: signedUp,
    waitlisted: false,
    suitableFor: [
      "Physical Disability",
      "Visual Impairment",
      "Hearing Impairment",
      "Intellectual Disability",
      "Autism Spectrum",
      "Multiple Disabilities",
      "Other",
    ],
  };
}

export default function VolunteerActivityModal({ activity, signedUp, onToggle, onClose }: Props) {
  const participantActivity = convertToParticipantActivity(activity, signedUp);

  return (
    <ActivityDetailModal
      activity={participantActivity}
      onClose={onClose}
      onToggleRegistration={onToggle}
      hasClash={false}
    />
  );
}
