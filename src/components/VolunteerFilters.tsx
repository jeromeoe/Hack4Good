import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";

function pill(active: boolean) {
  const base =
    "rounded-md border px-3 py-2 text-sm font-medium transition";
  return active
    ? `${base} bg-black text-white border-black`
    : `${base} bg-white text-gray-900 border-gray-300 hover:bg-gray-50`;
}

export default function VolunteerFilters() {
  const { filters, setFilters, locations } = useVolunteerActivities();

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={pill(filters.date === "all")}
            onClick={() => setFilters({ date: "all" })}
          >
            All
          </button>
          <button
            type="button"
            className={pill(filters.date === "today")}
            onClick={() => setFilters({ date: "today" })}
          >
            Today
          </button>
          <button
            type="button"
            className={pill(filters.date === "week")}
            onClick={() => setFilters({ date: "week" })}
          >
            This week
          </button>

          <label className="ml-2 inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={filters.onlyNeeding}
              onChange={(e) => setFilters({ onlyNeeding: e.target.checked })}
            />
            Only show activities needing volunteers
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Location:</span>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={filters.location}
            onChange={(e) => setFilters({ location: e.target.value })}
          >
            <option value="all">All</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => setFilters({ date: "all", location: "all", onlyNeeding: false })}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
