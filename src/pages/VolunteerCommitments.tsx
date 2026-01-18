import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";
import VolunteerRoleSelect from "../components/VolunteerRoleSelect";

function formatDateTimeRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);

  const day = s.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const st = s.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const et = e.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return `${day} • ${st}–${et}`;
}

export default function VolunteerCommitments() {
  const { commitments, toast, toggleSignup, setMyRole } = useVolunteerActivities();

  return (
    <div className="space-y-6">
      {toast?.message ? (
        <div className="rounded-lg border bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
          {toast.message}
        </div>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-blue-600">My Commitments</h1>
        <p className="text-gray-600">Your signed-up volunteer activities, sorted by date.</p>
      </div>

      {commitments.length === 0 ? (
        <div className="rounded-xl border bg-white p-6 text-gray-700 shadow-sm">
          <div className="text-lg font-semibold text-gray-900">No commitments yet</div>
          <div className="mt-1 text-sm text-gray-600">
            Go to Activities or Calendar to sign up for something.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {commitments.map((a) => (
            <div key={a.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-gray-900">{a.title}</div>
                  <div className="text-sm text-gray-700">{formatDateTimeRange(a.startISO, a.endISO)}</div>
                  <div className="text-sm text-gray-700">{a.location}</div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Role:</span>
                    <VolunteerRoleSelect
                      value={a.myRole}
                      onChange={(role) => setMyRole(a.id, role as "General support" | "Wheelchair assistance")}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    Signed up
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleSignup(a.id)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Volunteer coverage:{" "}
                  <span className="font-medium text-gray-900">{a.signedUp}</span> /{" "}
                  <span className="font-medium text-gray-900">{a.capacity}</span>
                </div>

                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                  {a.signedUp}/{a.capacity} volunteers
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
