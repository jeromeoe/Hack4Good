import type { ParticipantActivity } from "../types/participant";

interface Props {
  activity: ParticipantActivity;
  onClose: () => void;
  onToggleRegistration: (id: string) => void;
  hasClash: boolean;
}

function formatWhen(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const day = start.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { day, startTime, endTime };
}

export default function ActivityDetailModal({ activity, onClose, onToggleRegistration, hasClash }: Props) {
  const { day, startTime, endTime } = formatWhen(activity.startISO, activity.endISO);
  const isFull = activity.registered >= activity.capacity;
  const canRegister = !activity.isRegistered && !isFull;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Activity Image */}
        {activity.image && (
          <div className="w-full">
            <img
              src={activity.image}
              alt={activity.title}
              className="w-full h-64 object-cover rounded-t-xl"
              onError={(e) => {
                // Hide image if it fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{activity.title}</h2>
              <div className="mt-2 flex items-center gap-2">
                {activity.isRegistered && (
                  <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium">
                    ✓ Registered
                  </span>
                )}
                {activity.waitlisted && (
                  <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-medium">
                    Waitlisted
                  </span>
                )}
                {isFull && !activity.isRegistered && (
                  <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-medium">
                    Full
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date & Time */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">📅 When</h3>
            <div className="text-gray-700">
              {day}
              <br />
              {startTime} – {endTime}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">📍 Where</h3>
            <div className="text-gray-700">{activity.location}</div>
            <div className="text-sm text-gray-600 mt-1">Meeting point: {activity.meetingPoint}</div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">ℹ️ Description</h3>
            <div className="text-gray-700">{activity.description}</div>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-medium text-gray-900">
                  {activity.registered}/{activity.capacity} registered
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Meals provided:</span>
                <span className="font-medium text-gray-900">
                  {activity.mealsProvided ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">♿ Accessibility</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm">
                <span className={activity.accessibility.wheelchairAccessible ? "text-green-600" : "text-gray-400"}>
                  {activity.accessibility.wheelchairAccessible ? "✓" : "✗"}
                </span>
                <span className="text-gray-700">Wheelchair accessible</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={activity.accessibility.visuallyImpairedFriendly ? "text-green-600" : "text-gray-400"}>
                  {activity.accessibility.visuallyImpairedFriendly ? "✓" : "✗"}
                </span>
                <span className="text-gray-700">Visually impaired friendly</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={activity.accessibility.hearingImpairedFriendly ? "text-green-600" : "text-gray-400"}>
                  {activity.accessibility.hearingImpairedFriendly ? "✓" : "✗"}
                </span>
                <span className="text-gray-700">Hearing impaired friendly</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={activity.accessibility.intellectualDisabilityFriendly ? "text-green-600" : "text-gray-400"}>
                  {activity.accessibility.intellectualDisabilityFriendly ? "✓" : "✗"}
                </span>
                <span className="text-gray-700">Intellectual disability friendly</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={activity.accessibility.autismFriendly ? "text-green-600" : "text-gray-400"}>
                  {activity.accessibility.autismFriendly ? "✓" : "✗"}
                </span>
                <span className="text-gray-700">Autism friendly</span>
              </div>
            </div>
          </div>

          {/* Suitable For */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Suitable for</h3>
            <div className="flex flex-wrap gap-2">
              {activity.suitableFor.map((disability) => (
                <span
                  key={disability}
                  className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-medium"
                >
                  {disability}
                </span>
              ))}
            </div>
          </div>

          {/* Clash Warning */}
          {hasClash && !activity.isRegistered && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <strong>Clash detected:</strong> This activity overlaps with another activity you've registered for.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onToggleRegistration(activity.id);
              onClose();
            }}
            disabled={isFull && !activity.isRegistered}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activity.isRegistered
                ? "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                : isFull
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {activity.isRegistered ? "Withdraw" : isFull ? "Full" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
