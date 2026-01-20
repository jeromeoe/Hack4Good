import * as React from "react";
import { supabase } from "../../../lib/supabase";
import DataTable from "../../../components/admin/DataTable";
import { Button } from "../../../components/ui/button";
import type { Registration } from "../../../types/registration";
import { columns } from "./columns";

export default function RegistrationsPage() {
  const [rows, setRows] = React.useState<Registration[]>([]);
  const [selected, setSelected] = React.useState<Registration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = React.useState(false);

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    // pull registrations + join activities (title/date/location)
    const { data, error } = await supabase
      .from("registrations")
      .select(
        "id,created_at,activity_id,user_id,user_type,status, activities(title,date,location)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const mapped: Registration[] =
      (data ?? []).map((r: any) => ({
        id: r.id,
        created_at: r.created_at,
        activity_id: r.activity_id,
        user_id: r.user_id,
        user_type: r.user_type,
        status: r.status,
        activity_title: r.activities?.title ?? "-",
        activity_date: r.activities?.date ?? "-",
        activity_location: r.activities?.location ?? "-",
      })) ?? [];

    setRows(mapped);
    setLoading(false);
  }

  async function bulkUpdate(status: Registration["status"]) {
    if (selected.length === 0) return;
    setBulkLoading(true);

    const ids = selected.map((s) => s.id);

    const { error } = await supabase
      .from("registrations")
      .update({ status })
      .in("id", ids);

    setBulkLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // update local rows
    setRows((prev) =>
      prev.map((r) => (ids.includes(r.id) ? { ...r, status } : r))
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">registrations</h1>
        <p className="text-muted-foreground">
          manage participants & volunteers and reduce manual consolidation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => bulkUpdate("confirmed")}
          disabled={bulkLoading || selected.length === 0}
        >
          confirm selected
        </Button>
        <Button
          variant="secondary"
          onClick={() => bulkUpdate("waitlist")}
          disabled={bulkLoading || selected.length === 0}
        >
          waitlist selected
        </Button>
        <Button
          variant="outline"
          onClick={() => bulkUpdate("cancelled")}
          disabled={bulkLoading || selected.length === 0}
        >
          cancel selected
        </Button>

        <Button
          variant="ghost"
          onClick={load}
          disabled={loading}
          className="ml-auto"
        >
          refresh
        </Button>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">loading...</div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <DataTable
          columns={columns}
          data={rows}
          onSelectionChange={setSelected}
        />
      )}
    </div>
  );
}
