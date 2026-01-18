import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";
import VolunteerRoleSelect from "../components/VolunteerRoleSelect";

export default function VolunteerActivities() {
  const {
    filteredActivities,
    toggleSignup,
    setMyRole,
  } = useVolunteerActivities();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-blue-600">Activities</h1>
        <p className="text-gray-600">
          Browse and sign up for volunteer activities.
        </p>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-gray-600">
          No activities match your filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredActivities.map((a) => {
            const isFull = a.signedUp >= a.capacity && !a.isSignedUp;

            return (
              <div
                key={a.id}
                className="rounded-xl border bg-white p-5 shadow-sm"
              >
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {a.title}
                  </h2>
                  <div className="text-sm text-gray-700">
                    {new Date(a.startISO).toLocaleString()} –{" "}
                    {new Date(a.endISO).toLocaleTimeString()}
                  </div>
                  <div className="text-sm text-gray-700">{a.location}</div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  Volunteers:{" "}
                  <span className="font-medium text-gray-900">
                    {a.signedUp}
                  </span>{" "}
                  / {a.capacity}
                </div>

                {/* Role + Action */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  {!a.isSignedUp ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Role:</span>
                      <VolunteerRoleSelect
                        value={a.myRole}
                        onChange={(role) => setMyRole(a.id, role as "General support" | "Wheelchair assistance")}
                      />
                    </div>
                  ) : (
                    <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Role: {a.myRole ?? "General support"}
                    </span>
                  )}

                  <button
                    disabled={isFull}
                    onClick={() => toggleSignup(a.id)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                      isFull
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : a.isSignedUp
                        ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                        : "bg-black text-white hover:bg-gray-900"
                    }`}
                  >
                    {isFull
                      ? "Full"
                      : a.isSignedUp
                      ? "Cancel"
                      : "Sign up"}
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
