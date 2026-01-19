// components/VolunteerActivityModal.tsx
import type { Activity } from "../types/activity";
import ActivityCard from "./ActivityCard";

type Props = {
  activity: Activity;
  signedUp: boolean;
  onToggle: () => void;
  onClose: () => void;
};

export default function VolunteerActivityModal({ activity, signedUp, onToggle, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Reuse your existing ActivityCard */}
        <ActivityCard activity={activity} signedUp={signedUp} onToggle={onToggle} />
      </div>
    </div>
  );
}
