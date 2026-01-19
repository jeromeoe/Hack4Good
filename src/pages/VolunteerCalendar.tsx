// VolunteerCalendar.tsx
import { useMemo, useState } from "react";
import { useVolunteerActivities } from "../lib/VolunteerActivitiesContext";
import VolunteerFilters from "../components/VolunteerFilters";
import VolunteerRoleSelect from "../components/VolunteerRoleSelect";
import VolunteerActivityModal from "../components/VolunteerActivityModal";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtMonthYear(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}
function fmtTimeRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const st = s.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const et = e.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${st}–${et}`;
}
function isSameMonth(a: Date, monthAnchor: Date) {
  return a.getFullYear() === monthAnchor.getFullYear() && a.getMonth() === monthAnchor.getMonth();
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function VolunteerCalendar() {
  const { filteredActivities, toast, toggleSignup, setMyRole } = useVolunteerActivities();

  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());

  // ✅ NEW: store clicked activity id for modal
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const selectedActivity = useMemo(() => {
    if (!selectedActivityId) return null;
    return filteredActivities.find((a) => a.id === selectedActivityId) ?? null;
  }, [filteredActivities, selectedActivityId]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthAnchor));
    const end = endOfMonth(monthAnchor);
    const endGrid = addDays(startOfWeek(addDays(end, 7)), 6);
    const out: Date[] = [];
    let cur = start;
    while (cur <= endGrid) {
      out.push(new Date(cur));
      cur = addDays(cur, 1);
    }
    return out;
  }, [monthAnchor]);

  const byDay = useMemo(() => {
    const map = new Map<string, typeof filteredActivities>();
    for (const a of filteredActivities) {
      const d = new Date(a.startISO);
      const key = dayKey(d);
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((x, y) => new Date(x.startISO).getTime() - new Date(y.startISO).getTime());
      map.set(k, arr);
    }
    return map;
  }, [filteredActivities]);

  const selectedList = useMemo(() => {
    return byDay.get(dayKey(selectedDay)) ?? [];
  }, [byDay, selectedDay]);

  function prevMonth() {
    setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  function goToday() {
    const t = new Date();
    setMonthAnchor(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDay(t);
  }

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {toast?.message ? (
        <div className="rounded-lg border bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
          {toast.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-blue-600">Calendar</h1>
          <p className="text-gray-600">A shared schedule of volunteer activities.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Today
          </button>
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            ←
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      <VolunteerFilters />

      {/* Month grid */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900">{fmtMonthYear(monthAnchor)}</div>
          <div className="text-xs text-gray-500">Click a day to view activities</div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekdayLabels.map((w) => (
            <div key={w} className="px-2 pb-1 text-xs font-semibold text-gray-500">
              {w}
            </div>
          ))}

          {days.map((d) => {
            const key = dayKey(d);
            const items = byDay.get(key) ?? [];
            const isSelected = sameDay(d, selectedDay);
            const inMonth = isSameMonth(d, monthAnchor);
            const isToday = sameDay(d, new Date());

            const base = "min-h-[92px] rounded-lg border p-2 transition cursor-pointer";
            const bg = isSelected
              ? "border-blue-300 bg-blue-50"
              : "border-gray-200 bg-white hover:bg-gray-50";
            const dim = inMonth ? "" : "opacity-50";
            const ring = isToday ? "ring-1 ring-blue-200" : "";

            return (
              <div
                key={key}
                className={`${base} ${bg} ${dim} ${ring}`}
                onClick={() => setSelectedDay(d)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="text-xs font-semibold text-gray-800">{d.getDate()}</div>
                  {items.length ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                      {items.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 space-y-1">
                  {items.slice(0, 2).map((a) => {
                    const full = a.signedUp >= a.capacity && !a.isSignedUp;
                    const tag = full
                      ? "bg-gray-100 text-gray-700"
                      : a.isSignedUp
                      ? "bg-blue-50 text-blue-700"
                      : "bg-green-50 text-green-700";

                    // ✅ NEW: make event pill clickable (and stop day click)
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className={`truncate rounded-md px-2 py-1 text-left text-[11px] font-medium ${tag} hover:opacity-90`}
                        title={`${a.title} • ${fmtTimeRange(a.startISO, a.endISO)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay(d);
                          setSelectedActivityId(a.id);
                        }}
                      >
                        {a.title}
                      </button>
                    );
                  })}

                  {items.length > 2 ? (
                    <div className="text-[11px] text-gray-500">+{items.length - 2} more</div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day details */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {selectedDay.toLocaleDateString(undefined, {
                weekday: "long",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="text-sm text-gray-600">
              {selectedList.length
                ? "Activities on this day"
                : "No activities on this day (with current filters)"}
            </div>
          </div>

          <div className="text-xs text-gray-500">Tip: Blue = you signed up • Green = available • Gray = full</div>
        </div>

        <div className="mt-4 space-y-3">
          {selectedList.map((a) => {
            const full = a.signedUp >= a.capacity && !a.isSignedUp;

            const badge = full
              ? "bg-gray-100 text-gray-700 border"
              : a.isSignedUp
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-green-50 text-green-700 border border-green-200";

            const btnText = a.isSignedUp ? "Cancel" : full ? "Full" : "Sign up";
            const btnClass = full
              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
              : a.isSignedUp
              ? "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
              : "bg-black text-white hover:bg-gray-900";

            return (
              // ✅ Optional: click the whole card to open modal
              <div
                key={a.id}
                className="rounded-xl border bg-white p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedActivityId(a.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-gray-900">{a.title}</div>
                    <div className="text-sm text-gray-700">{fmtTimeRange(a.startISO, a.endISO)}</div>
                    <div className="text-sm text-gray-700">{a.location}</div>
                  </div>

                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${badge}`}>
                    {a.signedUp}/{a.capacity}
                  </span>
                </div>

                {/* Roles UI */}
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {!a.isSignedUp ? (
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()} // ✅ so clicking dropdown doesn't open modal
                    >
                      <span className="text-sm text-gray-600">Role:</span>
                      <VolunteerRoleSelect
                        value={a.myRole}
                        onChange={(role) =>
                          setMyRole(a.id, role as "General support" | "Wheelchair assistance")
                        }
                      />
                    </div>
                  ) : (
                    <span className="w-fit rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      Role: {a.myRole ?? "General support"}
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={full}
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ button shouldn’t open modal
                      toggleSignup(a.id);
                    }}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${btnClass}`}
                  >
                    {btnText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Modal popup */}
      {selectedActivity && (
        <VolunteerActivityModal
          activity={{
            ...selectedActivity,
            id: Number(selectedActivity.id),
            startTime: new Date(selectedActivity.startISO).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
            endTime: new Date(selectedActivity.endISO).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
            volunteerSlotsTotal: selectedActivity.capacity,
            volunteerSlotsFilled: selectedActivity.signedUp,
            participantCapacity: selectedActivity.capacity,
            participantRegistered: selectedActivity.signedUp,
            waitlistCount: 0,
            tags: [],
          }}
          signedUp={selectedActivity.isSignedUp}
          onToggle={() => toggleSignup(selectedActivity.id)}
          onClose={() => setSelectedActivityId(null)}
        />
      )}
    </div>
  );
}
