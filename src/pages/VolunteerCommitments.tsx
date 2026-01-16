import type { Activity } from "../types/activity";
import ActivityCard from "../components/ActivityCard";

export default function VolunteerCommitments() {
  const commitments: Activity[] = [
    {
      id: 1,
      title: "Art Jamming",
      startTime: "Tue 20 Jan, 10:00",
      endTime: "12:00",
      location: "MINDS HQ",
      volunteerSlotsTotal: 5,
      volunteerSlotsFilled: 2,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>My Commitments</h1>

      {commitments.length === 0 && <p>You have not signed up for any activities.</p>}

      {commitments.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} signedUp={true} onToggle={() => {}} />
      ))}
    </div>
  );
}
