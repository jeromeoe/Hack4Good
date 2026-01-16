import { useState } from "react";
import type { Activity } from "../types/activity";
import ActivityCard from "../components/ActivityCard";


export default function VolunteerHome() {
  const [signedUpIds, setSignedUpIds] = useState<number[]>([]);

  const activities: Activity[] = [
    {
      id: 1,
      title: "Art Jamming",
      startTime: "Tue 20 Jan, 10:00",
      endTime: "12:00",
      location: "MINDS HQ",
      volunteerSlotsTotal: 5,
      volunteerSlotsFilled: 2,
    },
    {
      id: 2,
      title: "Music Therapy",
      startTime: "Wed 21 Jan, 14:00",
      endTime: "16:00",
      location: "MINDS West",
      volunteerSlotsTotal: 3,
      volunteerSlotsFilled: 3,
    },
  ];

  function toggleSignup(id: number) {
    setSignedUpIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl p-6">
        {/* Tailwind test: big, bold, blue */}
        <h1 className="text-4xl font-bold text-blue-600">
          Volunteer Activities
        </h1>

        <p className="mt-2 text-gray-600">
          Sign up for activities that need volunteers.
        </p>

        <div className="mt-6 space-y-4">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              signedUp={signedUpIds.includes(activity.id)}
              onToggle={() => toggleSignup(activity.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
