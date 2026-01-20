import { useState } from "react";
import { useParticipantActivities } from "../lib/ParticipantActivitiesContext";
import ActivityDetailModal from "../components/ActivityDetailModal";
import type { ParticipantActivity } from "../types/participant";

function formatWhen(startISO: string, endISO: string) {
  const start = new Date(startISO);
  const end = new Date(endISO);

  const day = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const startTime = start.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day}, ${startTime} – ${endTime}`;
}

export default function ParticipantMyActivities() {
  const { myActivities, toast, toggleRegistration, checkClash } = useParticipantActivities();
  const [selectedActivity, setSelectedActivity] = useState<ParticipantActivity | null>(null);

  // Separate upcoming and past activities
  const now = new Date();
  const upcomingActivities = myActivities
    .filter((a) => new Date(a.startISO) > now)
    .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime());

  const pastActivities = myActivities
    .filter((a) => new Date(a.startISO) <= now)
    .sort((a, b) => new Date(b.startISO).getTime() - new Date(a.startISO).getTime());

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast?.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-blue-600">My Activities</h1>
        <p className="text-gray-600">
          View and manage all your registered activities.
        </p>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm text-gray-600">Total Registered</div>
            <div className="text-2xl font-bold text-blue-600">{myActivities.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Upcoming</div>
            <div className="text-2xl font-bold text-green-600">{upcomingActivities.length}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Past</div>
            <div className="text-2xl font-bold text-gray-600">{pastActivities.length}</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {myActivities.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="text-6xl mb-4">📅</div>
          <div className="text-lg font-semibold text-gray-900 mb-2">No activities yet</div>
          <div className="text-gray-600 mb-4">
            You haven't registered for any activities. Browse the calendar to find activities you'd like to join.
          </div>
          <a
            href="/participant/calendar"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Browse Activities
          </a>
        </div>
      )}

      {/* Upcoming Activities */}
      {upcomingActivities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Upcoming Activities</h2>
            <span className="text-sm text-gray-600">{upcomingActivities.length} activities</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {upcomingActivities.map((activity) => {
              const start = new Date(activity.startISO);
              const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div
                  key={activity.id}
                  className="rounded-xl border bg-white p-5 shadow-sm hover:border-blue-300 transition cursor-pointer"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                        <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">
                          ✓ Registered
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        {formatWhen(activity.startISO, activity.endISO)}
                      </div>
                      <div className="text-sm text-gray-700">{activity.location}</div>
                    </div>
                  </div>

                  {/* Time until */}
                  <div className="mt-3 text-sm text-blue-600 font-medium">
                    {daysUntil === 0
                      ? "Today"
                      : daysUntil === 1
                      ? "Tomorrow"
                      : `In ${daysUntil} days`}
                  </div>

                  {/* Meeting Point */}
                  <div className="mt-3 text-xs text-gray-600">
                    📍 Meeting point: {activity.meetingPoint}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivity(activity);
                      }}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRegistration(activity.id);
                      }}
                      className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 transition"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Activities */}
      {pastActivities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Past Activities</h2>
            <span className="text-sm text-gray-600">{pastActivities.length} activities</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pastActivities.map((activity) => {
              return (
                <div
                  key={activity.id}
                  className="rounded-xl border bg-gray-50 p-5 shadow-sm opacity-75 cursor-pointer hover:opacity-100 transition"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{activity.title}</h3>
                        <span className="rounded-full bg-gray-200 text-gray-700 px-2 py-0.5 text-xs font-medium">
                          Completed
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatWhen(activity.startISO, activity.endISO)}
                      </div>
                      <div className="text-sm text-gray-600">{activity.location}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-500">
                    Click to view details
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onToggleRegistration={toggleRegistration}
          hasClash={checkClash(selectedActivity.id)}
        />
      )}
    </div>
  );
}
