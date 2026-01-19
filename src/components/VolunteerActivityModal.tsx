// components/VolunteerActivityModal.tsx
import { createPortal } from "react-dom";
import type { ParticipantActivity } from "../types/participant";
import ActivityDetailModal from "./ActivityDetailModal";

type VolunteerActivity = {
  id: number; // ✅ your context uses number
  title: string;
  startISO?: string;
  endISO?: string;
  location: string;
  capacity?: number;
  signedUp?: number;
  isSignedUp?: boolean;

  volunteerSlotsTotal?: number;
  volunteerSlotsFilled?: number;
};

type Props = {
  activity: VolunteerActivity;
  onClose: () => void;

  // ✅ your context function signature
  onToggleSignup: (activityId: number) => Promise<void> | void;
};

function convertToParticipantActivity(activity: VolunteerActivity): ParticipantActivity {
  const startISO = activity.startISO ?? new Date().toISOString();
  const endISO = activity.endISO ?? new Date().toISOString();

  const capacity = activity.capacity ?? activity.volunteerSlotsTotal ?? 10;
  const registered = activity.signedUp ?? activity.volunteerSlotsFilled ?? 0;

  return {
    id: String(activity.id),
    title: activity.title,
    startISO,
    endISO,
    location: activity.location,
    description:
      "Volunteer activity - help support participants with special needs. Your contribution makes a meaningful difference in the lives of individuals with special needs.",
    meetingPoint: activity.location,
    mealsProvided: false,
    accessibility: {
      wheelchairAccessible: true,
      visuallyImpairedFriendly: true,
      hearingImpairedFriendly: true,
      intellectualDisabilityFriendly: true,
      autismFriendly: true,
    },
    capacity,
    registered,
    isRegistered: !!activity.isSignedUp,
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

export default function VolunteerActivityModal({ activity, onClose, onToggleSignup }: Props) {
  if (typeof document === "undefined") return null;

  const participantActivity = convertToParticipantActivity(activity);

  // ✅ Portal + fixed overlay makes it pop out like participant modal
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white shadow-xl">
        <ActivityDetailModal
          activity={participantActivity}
          onClose={onClose}
          onToggleRegistration={() => onToggleSignup(activity.id)}
          hasClash={false}
        />
      </div>
    </div>,
    document.body
  );
}
