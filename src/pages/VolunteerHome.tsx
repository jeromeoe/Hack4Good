import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";

function getStartISO(a: any) {
  return a.startISO ?? a.startTime ?? a.start_date ?? a.start;
}

function formatStart(startISO: string) {
  const start = new Date(startISO);
  return {
    date: start.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: start.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }),
    start,
  };
}

export default function VolunteerHome() {
  // ✅ only take what your current context likely has
  const ctx = useVolunteerActivities() as any;

  const activities = (ctx.activities ?? []) as any[];
  const myActivitiesRaw = (ctx.myActivities ?? null) as any[] | null;

  // If you don't have myActivities, fallback to activities where isRegistered is true
  const myActivities = useMemo(() => {
    if (Array.isArray(myActivitiesRaw)) return myActivitiesRaw;
    return activities.filter((a) => a.isRegistered === true || a.isSignedUp === true);
  }, [activities, myActivitiesRaw]);

  const now = new Date();

  const upcomingMyActivities = useMemo(() => {
    return myActivities
      .filter((a) => new Date(getStartISO(a)) > now)
      .sort((a, b) => new Date(getStartISO(a)).getTime() - new Date(getStartISO(b)).getTime())
      .slice(0, 3);
  }, [myActivities]);

  const recommended = useMemo(() => {
    return activities
      .filter((a) => {
        const start = new Date(getStartISO(a));
        const already = myActivities.some((m) => m.id === a.id);
        return start > now && !already;
      })
      .sort((a, b) => new Date(getStartISO(a)).getTime() - new Date(getStartISO(b)).getTime())
      .slice(0, 3);
  }, [activities, myActivities]);

  const upcomingCount = activities.filter((a) => new Date(getStartISO(a)) > now).length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-600">Welcome back, Volunteer!</h1>
        <p className="mt-2 text-gray-600">
          Here’s a quick overview of your volunteering.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">My Sign-ups</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{myActivities.length}</div>
          <Link to="/volunteer/activities" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            View activities →
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Upcoming</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{upcomingCount}</div>
          <div className="mt-3 text-sm text-gray-500">Activities coming up</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Recommended</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">{recommended.length}</div>
          <Link to="/volunteer/activities" className="mt-3 inline-block text-sm text-purple-600 hover:underline">
            Browse activities →
          </Link>
        </div>
      </div>

      {/* My Upcoming */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">My Upcoming Activities</h2>
          <Link to="/volunteer/activities" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {upcomingMyActivities.length === 0 ? (
          <div className="mt-4 text-gray-500">
            You haven’t signed up for any upcoming activities yet.{" "}
            <Link to="/volunteer/activities" className="text-blue-600 hover:underline">
              Browse activities
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {upcomingMyActivities.map((a) => {
              const { date, time, start } = formatStart(getStartISO(a));
              const days = Math.max(
                0,
                Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              );

              return (
                <div key={a.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                  <div>
                    <div className="font-semibold text-gray-900">{a.title}</div>
                    <div className="text-sm text-gray-600">
                      {date} at {time}
                    </div>
                    <div className="text-sm text-gray-600">{a.location}</div>
                  </div>
                  <div className="text-sm text-gray-500">{days} days</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommended */}
      {recommended.length > 0 && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
            <Link to="/volunteer/activities" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {recommended.map((a) => {
              const start = new Date(getStartISO(a));
              return (
                <div key={a.id} className="rounded-lg border bg-gray-50 p-4 hover:border-blue-300 transition">
                  <div className="font-semibold text-gray-900">{a.title}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">{a.location}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
