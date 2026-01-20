import * as React from "react";
import { supabase } from "../../../lib/supabase";
import type { Activity } from "../../../types/activity";

import DataTable from "../../../components/admin/DataTable";
import CreateActivityDialog from "./CreateActivityDialog";
import { makeColumns } from "./columns";

export default function ActivitiesPage() {
  const [rows, setRows] = React.useState<Activity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // create the columns once; pass handlers to columns factory
  const columns = React.useMemo(
    () =>
      makeColumns({
        onUpdated: (updated) => {
          setRows((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
        },
        onDeleted: (id) => {
          setRows((prev) => prev.filter((r) => r.id !== id));
        },
      }),
    []
  );

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    // 1) fetch activities
    const { data: activitiesData, error: activitiesErr } = await supabase
      .from("activities")
      .select("*")
      .order("date", { ascending: true })
      .order("time_start", { ascending: true });

    if (activitiesErr) {
      setError(activitiesErr.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const activities = (activitiesData ?? []) as Activity[];

    // 2) fetch confirmed registrations for counts
    const { data: regsData, error: regsErr } = await supabase
      .from("registrations")
      .select("activity_id,user_type,status")
      .eq("status", "confirmed");

    // if registrations fails, still show activities list
    if (regsErr) {
      setRows(activities);
      setLoading(false);
      return;
    }

    // 3) count confirmed participants + volunteers per activity
    const counts = new Map<number, { p: number; v: number }>();

    for (const r of regsData ?? []) {
      const activityId = r.activity_id as number;
      const userType = r.user_type as string;

      const prev = counts.get(activityId) ?? { p: 0, v: 0 };
      if (userType === "participant") prev.p += 1;
      if (userType === "volunteer") prev.v += 1;
      counts.set(activityId, prev);
    }

    // 4) merge counts into activities + compute remaining
    const merged: Activity[] = activities.map((a) => {
      const c = counts.get(a.id) ?? { p: 0, v: 0 };

      const participantSlots = a.participant_slots ?? 0;
      const volunteerSlots = a.volunteer_slots ?? 0;

      return {
        ...a,
        participants_confirmed: c.p,
        volunteers_confirmed: c.v,
        participants_remaining: Math.max(participantSlots - c.p, 0),
        volunteers_remaining: Math.max(volunteerSlots - c.v, 0),
      };
    });

    setRows(merged);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">activities</h1>
          <p className="text-muted-foreground">
            create, update, and manage activities and capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CreateActivityDialog
            onCreated={(created) => setRows((prev) => [created, ...prev])}
          />
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">
          loading activities...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          failed to load activities: {error}
        </div>
      )}

      {!loading && !error && <DataTable columns={columns} data={rows} />}
    </div>
  );
}
