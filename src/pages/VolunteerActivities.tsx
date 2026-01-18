import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";
import VolunteerFilters from "../components/VolunteerFilters";

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

export default function VolunteerActivities() {
  const { filteredActivities, toast, toggleSignup } = useVolunteerActivities();

  function getStatus(a: any) {
    if (a.isSignedUp) return "cancel";
    if (a.signedUp >= a.capacity) return "full";
    return "signup";
  }

  return (
    <div className="space-y-6">
      {toast?.message ? (
        <div className="rounded-lg border bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
          {toast.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-blue-600">Volunteer Activities</h1>
        <p className="text-gray-600">Sign up for activities that need volunteers.</p>
      </div>

      <VolunteerFilters />

      {filteredActivities.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-gray-700 shadow-sm">
          <div className="text-lg font-semibold text-gray-900">No activities match your filters</div>
          <div className="mt-1 text-sm text-gray-600">Try resetting filters or changing the date/location.</div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredActivities.map((a) => {
            const status = getStatus(a);

            const badge =
              status === "full"
                ? "bg-gray-100 text-gray-700 border"
                : status === "cancel"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-green-50 text-green-700 border border-green-200";

            const buttonText =
              status === "full" ? "Full" : status === "cancel" ? "Cancel" : "Sign up";

            const buttonClass =
              status === "full"
                ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                : status === "cancel"
                ? "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                : "bg-black text-white hover:bg-gray-900";

            const disable = status === "full";

            return (
              <div key={a.id} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-gray-900">{a.title}</h2>
                    <div className="text-sm text-gray-700">{formatWhen(a.startISO, a.endISO)}</div>
                    <div className="text-sm text-gray-700">{a.location}</div>
                  </div>

                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${badge}`}>
                    {a.signedUp}/{a.capacity}
                  </span>
                </div>

                {a.role ? (
                  <div className="mt-3 text-xs text-gray-500">
                    Role: <span className="font-medium text-gray-700">{a.role}</span>
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Volunteers: <span className="font-medium text-gray-900">{a.signedUp}</span> /{" "}
                    <span className="font-medium text-gray-900">{a.capacity}</span>
                  </div>

                  <button
                    type="button"
                    disabled={disable}
                    onClick={() => toggleSignup(a.id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${buttonClass}`}
                  >
                    {buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
