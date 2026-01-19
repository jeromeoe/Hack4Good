import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";
import type { Activity } from "../types/activity";

function formatDateTime(startISO: string) {
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
  const { activities, signedUpActivityIds } = useVolunteerActivities();

  const now = new Date();

  const myActivities = useMemo(() => {
    return activities.filter((a) => signedUpActivityIds?.has(a.id));
  }, [activities, signedUpActivityIds]);

  const upcomingMyActivities = useMemo(() => {
    return myActivities
      .filter((a) => new Date(a.startISO) > now)
      .sort(
        (a, b) =>
          new Date(a.startISO).getTime() - new Date(b.startISO).getTime()
      )
      .slice(0, 3);
  }, [myActivities]);

  const availableActivities = useMemo(() => {
    return activities
      .filter((a) => {
        const filled =
          (a as any).volunteerSlotsFilled ?? (a as any).registered ?? 0;
        const total =
          (a as any).volunteerSlotsTotal ?? (a as any).capacity ?? 0;

        const isFull = total > 0 ? filled >= total : false;
        const isUpcoming = new Date(a.startISO) > now;
        const notSignedUp = !(signedUpActivityIds?.has(a.id) ?? false);

        return isUpcoming && notSignedUp && !isFull;
      })
      .sort(
        (a, b) =>
          new Date(a.startISO).getTime() - new Date(b.startISO).getTime()
      )
      .slice(0, 3);
  }, [activities, signedUpActivityIds]);

  const upcomingCount = useMemo(() => {
    return activities.filter((a) => new Date(a.startISO) > now).length;
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome back, {profile?.name || "Volunteer"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here&apos;s a quick overview of your volunteer activities and
          recommendations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            My Sign-ups
          </div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {signedUpActivityIds?.size ?? 0}
          </div>
          <Link
            to="/volunteer/activities"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline"
          >
            View activities →
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Upcoming</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {upcomingCount}
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Activities coming up
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            Recommended
          </div>
          <div className="mt-2 text-3xl font-bold text-purple-600">
            {availableActivities.length}
          </div>
          <Link
            to="/volunteer/activities"
            className="mt-3 inline-block text-sm text-purple-600 hover:underline"
          >
            Browse activities →
          </Link>
        </div>
      </div>

      {/* Upcoming My Activities */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            My Upcoming Activities
          </h2>
          <Link
            to="/volunteer/activities"
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {upcomingMyActivities.length === 0 ? (
          <div className="mt-4 text-gray-500">
            You haven&apos;t signed up for any upcoming activities yet.{" "}
            <Link
              to="/volunteer/activities"
              className="text-blue-600 hover:underline"
            >
              Browse available activities
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {upcomingMyActivities.map((activity: Activity) => {
              const { date, time, start } = formatDateTime(activity.startISO);

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {activity.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {date} at {time}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.location}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    {Math.max(
                      0,
                      Math.ceil(
                        (start.getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}{" "}
                    days
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
            <h2 className="text-xl font-semibold text-gray-900">
              Recommended for You
            </h2>
            <Link
              to="/volunteer/activities"
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {availableActivities.map((activity: Activity) => {
              const start = new Date(activity.startISO);

              const filled =
                (activity as any).volunteerSlotsFilled ??
                (activity as any).registered ??
                0;
              const total =
                (activity as any).volunteerSlotsTotal ??
                (activity as any).capacity ??
                0;

              return (
                <div
                  key={activity.id}
                  className="rounded-lg border bg-gray-50 p-4 hover:border-blue-300 transition"
                >
                  <div className="font-semibold text-gray-900">
                    {activity.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {start.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {activity.location}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    {filled}/{total || "?"} volunteers
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
