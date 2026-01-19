import { useMemo, useState } from "react";
import { useParticipantActivities } from "../lib/ParticipantActivitiesContext";
import ParticipantFilters from "../components/ParticipantFilters";
import ActivityDetailModal from "../components/ActivityDetailModal";
import type { ParticipantActivity } from "../types/participant";

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

export default function ParticipantCalendar() {
  const { filteredActivities, toast, toggleRegistration, checkClash, getWeeklyCount } =
    useParticipantActivities();

  const [monthAnchor, setMonthAnchor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [selectedActivity, setSelectedActivity] = useState<ParticipantActivity | null>(null);

  const weeklyCount = getWeeklyCount();

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
      {/* Toast */}
      {toast?.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${
            toast.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-blue-600">Activity Calendar</h1>
          <p className="text-gray-600">Browse and register for upcoming activities.</p>
          {weeklyCount > 0 && (
            <p className="text-sm text-gray-500">
              You have registered for {weeklyCount} {weeklyCount === 1 ? "activity" : "activities"} this week
              {weeklyCount >= 3 && " (weekly limit reached)"}.
            </p>
          )}
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

      {/* Filters */}
      <ParticipantFilters />

      {/* Calendar Grid */}
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
                    const isFull = a.registered >= a.capacity && !a.isRegistered;
                    const tag = isFull
                      ? "bg-gray-100 text-gray-700"
                      : a.isRegistered
                      ? "bg-green-50 text-green-700"
                      : a.waitlisted
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-blue-50 text-blue-700";

                    return (
                      <div
                        key={a.id}
                        className={`truncate rounded-md px-2 py-1 text-[11px] font-medium ${tag} hover:opacity-80`}
                        title={`${a.title} • ${fmtTimeRange(a.startISO, a.endISO)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivity(a);
                        }}
                      >
                        {a.title}
                      </div>
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

      {/* Selected Day Activities List */}
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
            <div className="text-xs text-gray-500"> 
              Tip: Green = registered • Blue = available • Gray = full • Yellow = waitlisted
             </div>
          
        </div>

        <div className="mt-4 space-y-3">
          {selectedList.map((activity) => {
            const isFull = activity.registered >= activity.capacity;
            const hasClash = checkClash(activity.id);

            const badge = activity.isRegistered
              ? "bg-green-100 text-green-700 border border-green-200"
              : activity.waitlisted
              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
              : isFull
              ? "bg-gray-100 text-gray-700 border"
              : "bg-blue-50 text-blue-700 border border-blue-200";

            const statusText = activity.isRegistered
              ? "Registered"
              : activity.waitlisted
              ? "Waitlisted"
              : isFull
              ? "Full"
              : "Available";

            return (
              <div
                key={activity.id}
                className="rounded-xl border bg-white p-4 hover:border-blue-300 transition cursor-pointer"
                onClick={() => setSelectedActivity(activity)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="text-base font-semibold text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-700">
                      {fmtTimeRange(activity.startISO, activity.endISO)}
                    </div>
                    <div className="text-sm text-gray-700">{activity.location}</div>
                  </div>

                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${badge}`}>
                    {statusText}
                  </span>
                </div>

                {/* Quick Info */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {activity.mealsProvided && (
                    <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1">
                      🍽️ Meals provided
                    </span>
                  )}
                  {activity.accessibility.wheelchairAccessible && (
                    <span className="rounded-full bg-gray-100 text-gray-700 px-2 py-1">
                      ♿ Wheelchair accessible
                    </span>
                  )}
                  {hasClash && !activity.isRegistered && (
                    <span className="rounded-full bg-yellow-100 text-yellow-700 px-2 py-1">
                      ⚠️ Clash detected
                    </span>
                  )}
                </div>

                {/* Capacity */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{activity.registered}</span> /{" "}
                    <span className="font-medium text-gray-900">{activity.capacity}</span> registered
                  </div>

                  <div className="text-sm text-blue-600 font-medium">
                    Click for details →
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onToggleRegistration={toggleRegistration}
          hasClash={checkClash(selectedActivity.id)}
        />
      )}
    </div>
  );
}
