import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import type { Activity } from "../../../types/activity";
import type { Registration } from "../../../types/registration";

import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

import EditActivityDialog from "./EditActivityDialog";
import DeleteActivityButton from "./DeleteActivityButton";

function statusVariant(status: Registration["status"]) {
  if (status === "confirmed") return "default";
  if (status === "waitlist") return "secondary";
  return "outline";
}

function downloadCsv(filename: string, rows: Record<string, any>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const escape = (v: any) => `"${String(v ?? "").replaceAll(`"`, `""`)}"`;
  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ActivityDetailPage() {
  const { id } = useParams();
  const activityId = Number(id);

  const [activity, setActivity] = React.useState<Activity | null>(null);
  const [regs, setRegs] = React.useState<Registration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading] = React.useState(false);

  React.useEffect(() => {
    if (!activityId || Number.isNaN(activityId)) return;
    load();
  }, [activityId]);

  async function load() {
    setLoading(true);
    setError(null);
    setSelectedIds(new Set());

    // fetch activity
    const { data: aData, error: aErr } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .single();

    if (aErr) {
      setError(aErr.message);
      setLoading(false);
      return;
    }

    setActivity(aData as Activity);

    // fetch registrations for this activity
    const { data: rData, error: rErr } = await supabase
      .from("registrations")
      .select("id,created_at,activity_id,user_id,user_type,status")
      .eq("activity_id", activityId)
      .order("created_at", { ascending: false });

    if (rErr) {
      setError(rErr.message);
      setRegs([]);
      setLoading(false);
      return;
    }

    setRegs((rData ?? []) as Registration[]);
    setLoading(false);
  }

  function toggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: number[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((x) => next.has(x));
      if (allSelected) ids.forEach((x) => next.delete(x));
      else ids.forEach((x) => next.add(x));
      return next;
    });
  }

  async function bulkUpdate(status: Registration["status"]) {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBulkLoading(true);

    const { error } = await supabase
      .from("registrations")
      .update({ status })
      .in("id", ids);

    setBulkLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setRegs((prev) =>
      prev.map((r) => (selectedIds.has(r.id) ? { ...r, status } : r))
    );
    setSelectedIds(new Set());
  }

  const participants = regs.filter((r) => r.user_type === "participant");
  const volunteers = regs.filter((r) => r.user_type === "volunteer");

  const participantsConfirmed = participants.filter(
    (r) => r.status === "confirmed"
  ).length;
  const volunteersConfirmed = volunteers.filter(
    (r) => r.status === "confirmed"
  ).length;

  const participantSlots = activity?.participant_slots ?? 0;
  const volunteerSlots = activity?.volunteer_slots ?? 0;

  const participantsLeft = Math.max(
    participantSlots - participantsConfirmed,
    0
  );
  const volunteersLeft = Math.max(volunteerSlots - volunteersConfirmed, 0);

  function exportTab(which: "all" | "participants" | "volunteers") {
    const list =
      which === "participants"
        ? participants
        : which === "volunteers"
        ? volunteers
        : regs;

    downloadCsv(
      `activity_${activityId}_${which}.csv`,
      list.map((r) => ({
        registration_id: r.id,
        created_at: r.created_at,
        user_id: r.user_id,
        user_type: r.user_type,
        status: r.status,
        activity_id: r.activity_id,
        activity_title: activity?.title ?? "",
        activity_date: activity?.date ?? "",
        activity_location: activity?.location ?? "",
      }))
    );
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-red-600">error: {error}</div>
        <Button variant="outline" asChild>
          <Link to="/admin/activities">back to activities</Link>
        </Button>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-sm text-muted-foreground">activity not found.</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/activities">back</Link>
            </Button>
            <h1 className="text-2xl font-bold">{activity.title}</h1>
          </div>

          <div className="text-sm text-muted-foreground">
            {activity.date} • {activity.location} • {activity.category}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary">
              participants: {participantsLeft}/{participantSlots} left
            </Badge>
            <Badge variant="secondary">
              volunteers: {volunteersLeft}/{volunteerSlots} left
            </Badge>
            <Badge variant="outline">
              {activity.activity_type ?? "General"}
            </Badge>
            <Badge variant="outline">
              {activity.disability_access ?? "Universal"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <EditActivityDialog
            activity={activity}
            onUpdated={(updated) => setActivity(updated)}
          />
          <DeleteActivityButton
            activity={activity}
            onDeleted={() => {
              // simple redirect after delete
              window.location.href = "/admin/activities";
            }}
          />
          <Button variant="outline" onClick={load}>
            refresh
          </Button>
        </div>
      </div>

      {/* bulk actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => bulkUpdate("confirmed")}
          disabled={bulkLoading || selectedIds.size === 0}
        >
          confirm selected
        </Button>
        <Button
          variant="secondary"
          onClick={() => bulkUpdate("waitlist")}
          disabled={bulkLoading || selectedIds.size === 0}
        >
          waitlist selected
        </Button>
        <Button
          variant="outline"
          onClick={() => bulkUpdate("cancelled")}
          disabled={bulkLoading || selectedIds.size === 0}
        >
          cancel selected
        </Button>

        <div className="ml-auto text-xs text-muted-foreground">
          {selectedIds.size} selected
        </div>
      </div>

      {/* tabs */}
      <Tabs defaultValue="all" className="space-y-3">
        <TabsList>
          <TabsTrigger value="all">all ({regs.length})</TabsTrigger>
          <TabsTrigger value="participants">
            participants ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="volunteers">
            volunteers ({volunteers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-2">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => exportTab("all")}>
              export csv
            </Button>
          </div>

          <RegTable
            rows={regs}
            selectedIds={selectedIds}
            toggle={toggle}
            toggleAll={toggleAll}
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-2">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => exportTab("participants")}>
              export csv
            </Button>
          </div>

          <RegTable
            rows={participants}
            selectedIds={selectedIds}
            toggle={toggle}
            toggleAll={toggleAll}
          />
        </TabsContent>

        <TabsContent value="volunteers" className="space-y-2">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => exportTab("volunteers")}>
              export csv
            </Button>
          </div>

          <RegTable
            rows={volunteers}
            selectedIds={selectedIds}
            toggle={toggle}
            toggleAll={toggleAll}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RegTable({
  rows,
  selectedIds,
  toggle,
  toggleAll,
}: {
  rows: Registration[];
  selectedIds: Set<number>;
  toggle: (id: number) => void;
  toggleAll: (ids: number[]) => void;
}) {
  const allIds = rows.map((r) => r.id);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.has(id));

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="p-3 w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => toggleAll(allIds)}
              />
            </th>
            <th className="p-3 text-left">user id</th>
            <th className="p-3 text-left">type</th>
            <th className="p-3 text-left">status</th>
            <th className="p-3 text-left">created</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="p-3 text-muted-foreground" colSpan={5}>
                no registrations.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">
                  <Checkbox
                    checked={selectedIds.has(r.id)}
                    onCheckedChange={() => toggle(r.id)}
                  />
                </td>
                <td className="p-3 max-w-[280px] truncate">{r.user_id}</td>
                <td className="p-3">{r.user_type}</td>
                <td className="p-3">
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </td>
                <td className="p-3">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
