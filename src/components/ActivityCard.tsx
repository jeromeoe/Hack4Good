import type { Activity } from "../types/activity";

type Props = {
  activity: Activity;
  signedUp: boolean;
  onToggle: () => void;
};

export default function ActivityCard({ activity, signedUp, onToggle }: Props) {
  const isFull = activity.volunteerSlotsFilled >= activity.volunteerSlotsTotal;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        maxWidth: 420,
      }}
    >
      <h3>{activity.title}</h3>
      <div>
        {activity.startTime} – {activity.endTime}
      </div>
      <div>{activity.location}</div>
      <div style={{ marginTop: 6 }}>
        Volunteers: {activity.volunteerSlotsFilled} / {activity.volunteerSlotsTotal}
      </div>

      <button style={{ marginTop: 12 }} disabled={isFull && !signedUp} onClick={onToggle}>
        {signedUp ? "Cancel" : isFull ? "Full" : "Sign up"}
      </button>

      {signedUp && <p style={{ marginTop: 8 }}>✅ You are signed up</p>}
    </div>
  );
}
