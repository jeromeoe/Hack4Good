import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useVolunteerActivities, type Activity } from "../lib/VolunteerActivitiesContext"; //
import { Calendar, MapPin, CheckCircle } from "lucide-react";

// Helper to safely get the start date string
function getStartISO(a: Activity) {
  return a.startISO;
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
  const { activities, commitments } = useVolunteerActivities(); 
  const now = new Date();
  const myActivities = commitments;

  const upcomingMyActivities = useMemo(() => {
    return myActivities
      .filter((a) => new Date(getStartISO(a)) > now)
      .sort((a, b) => new Date(getStartISO(a)).getTime() - new Date(getStartISO(b)).getTime())
      .slice(0, 3);
  }, [myActivities, now]);

  const recommended = useMemo(() => {
    return activities
      .filter((a) => {
        const start = new Date(getStartISO(a));
        const already = myActivities.some((m) => m.id === a.id);
        return start > now && !already;
      })
      .sort((a, b) => new Date(getStartISO(a)).getTime() - new Date(getStartISO(b)).getTime())
      .slice(0, 3);
  }, [activities, myActivities, now]);

  const upcomingCount = activities.filter((a) => new Date(getStartISO(a)) > now).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Welcome Card - CLEANED UP */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-blue-600">Welcome back, Volunteer!</h1>
        <p className="mt-2 text-gray-600">
          Here’s a quick overview of your volunteering impact.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="text-sm font-medium text-gray-600">My Sign-ups</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{myActivities.length}</div>
          <Link to="/volunteer/activities" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            View activities →
          </Link>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="text-sm font-medium text-gray-600">Upcoming Opportunities</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{upcomingCount}</div>
          <div className="mt-3 text-sm text-gray-500">Events available to join</div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="text-sm font-medium text-gray-600">Recommended</div>
          <div className="mt-2 text-3xl font-bold text-purple-600">{recommended.length}</div>
          <Link to="/volunteer/activities" className="mt-3 inline-block text-sm text-purple-600 hover:underline">
            Browse activities →
          </Link>
        </div>
      </div>

      {/* My Upcoming Section */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Upcoming Activities</h2>
          <Link to="/volunteer/activities" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {upcomingMyActivities.length === 0 ? (
          <div className="text-gray-500 italic py-4">
            You haven’t signed up for any upcoming activities yet.
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingMyActivities.map((a) => {
              const { date, time, start } = formatStart(getStartISO(a));
              const days = Math.max(0, Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

              return (
                <div key={a.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-4 hover:shadow-sm transition-shadow">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {a.title}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> {date} at {time}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> {a.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-medium text-gray-500">{days} days left</span>
                    <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {a.myRole}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}