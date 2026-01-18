import { useParticipantActivities } from "../lib/ParticipantActivitiesContext";

export default function ParticipantFilters() {
  const { filters, setFilters, locations, profile } = useParticipantActivities();

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Date:</label>
          <select
            value={filters.date}
            onChange={(e) => setFilters({ date: e.target.value as any })}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="week">Next 7 days</option>
            <option value="month">Next 30 days</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Location:</label>
          <select
            value={filters.location}
            onChange={(e) => setFilters({ location: e.target.value })}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Suitability Filter */}
        {profile && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Show:</label>
            <select
              value={filters.suitability}
              onChange={(e) => setFilters({ suitability: e.target.value as any })}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All activities</option>
              <option value="suitable">Suitable for me</option>
            </select>
          </div>
        )}

        {/* Only Available Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => setFilters({ onlyAvailable: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Only show available</span>
        </label>

        {/* Reset Button */}
        <button
          onClick={() =>
            setFilters({
              date: "all",
              location: "all",
              suitability: "all",
              onlyAvailable: false,
            })
          }
          className="ml-auto text-sm text-blue-600 hover:underline"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
