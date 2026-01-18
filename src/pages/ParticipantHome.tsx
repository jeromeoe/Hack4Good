import { useParticipantActivities } from "../lib/ParticipantActivitiesContext";
import { Link } from "react-router-dom";

export default function ParticipantHome() {
  const { profile, myActivities, activities, getWeeklyCount } = useParticipantActivities();

  const weeklyCount = getWeeklyCount();
  const upcomingActivities = myActivities
    .filter((a) => new Date(a.startISO) > new Date())
    .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime())
    .slice(0, 3);

  const availableActivities = activities
    .filter((a) => !a.isRegistered && a.registered < a.capacity)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome back, {profile?.name || "Participant"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's a quick overview of your activities and recommendations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Registered Activities</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{myActivities.length}</div>
          <Link
            to="/participant/my-activities"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">This Week</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{weeklyCount}</div>
          <div className="mt-3 text-sm text-gray-500">
            {weeklyCount >= 3 ? "Weekly limit reached" : `${3 - weeklyCount} slots remaining`}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Available Activities</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">{availableActivities.length}</div>
          <Link
            to="/participant/calendar"
            className="mt-3 inline-block text-sm text-purple-600 hover:underline"
          >
            Browse activities →
          </Link>
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Activities</h2>
          <Link
            to="/participant/my-activities"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {upcomingActivities.length === 0 ? (
          <div className="mt-4 text-gray-500">
            You haven't registered for any upcoming activities yet.{" "}
            <Link to="/participant/calendar" className="text-blue-600 hover:underline">
              Browse available activities
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {upcomingActivities.map((activity) => {
              const start = new Date(activity.startISO);
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-600">
                      {start.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {start.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-sm text-gray-600">{activity.location}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended Activities */}
      {availableActivities.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
            <Link
              to="/participant/calendar"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {availableActivities.map((activity) => {
              const start = new Date(activity.startISO);
              return (
                <div
                  key={activity.id}
                  className="rounded-lg border bg-gray-50 p-4 hover:border-blue-300 transition"
                >
                  <div className="font-semibold text-gray-900">{activity.title}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {start.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">{activity.location}</div>
                  <div className="mt-3 text-xs text-gray-500">
                    {activity.registered}/{activity.capacity} registered
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
