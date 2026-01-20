import type { ColumnDef } from "@tanstack/react-table";
import type { Activity } from "../../../types/activity";
import { Link } from "react-router-dom";

import EditActivityDialog from "./EditActivityDialog";
import DeleteActivityButton from "./DeleteActivityButton";
import { Button } from "../../../components/ui/button";

export function makeColumns(opts: {
  onUpdated: (a: Activity) => void;
  onDeleted: (id: number) => void;
}): ColumnDef<Activity>[] {
  return [
    {
      accessorKey: "title",
      header: "title",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.title}</div>
      ),
    },
    { accessorKey: "date", header: "date" },
    {
      accessorKey: "time_start",
      header: "start",
      cell: ({ row }) => row.original.time_start ?? "-",
    },
    {
      accessorKey: "time_end",
      header: "end",
      cell: ({ row }) => row.original.time_end ?? "-",
    },
    { accessorKey: "location", header: "location" },
    { accessorKey: "category", header: "category" },
    {
      accessorKey: "participants_remaining",
      header: "participants left",
      cell: ({ row }) => {
        const left = row.original.participants_remaining ?? 0;
        const total = row.original.participant_slots ?? 0;
        return (
          <div>
            {left} / {total}
          </div>
        );
      },
    },
    {
      accessorKey: "volunteers_remaining",
      header: "volunteers left",
      cell: ({ row }) => {
        const left = row.original.volunteers_remaining ?? 0;
        const total = row.original.volunteer_slots ?? 0;
        return (
          <div>
            {left} / {total}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to={`/admin/activities/${row.original.id}`}>manage</Link>
          </Button>

          <EditActivityDialog
            activity={row.original}
            onUpdated={opts.onUpdated}
          />
          <DeleteActivityButton
            activity={row.original}
            onDeleted={opts.onDeleted}
          />
        </div>
      ),
    },
  ];
}
