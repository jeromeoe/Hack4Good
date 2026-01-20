import type { ColumnDef } from "@tanstack/react-table";
import type { Registration } from "../../../types/registration";

import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";

function statusVariant(status: Registration["status"]) {
  if (status === "confirmed") return "default";
  if (status === "waitlist") return "secondary";
  return "outline";
}

export const columns: ColumnDef<Registration>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 32,
  },
  {
    accessorKey: "activity_title",
    header: "activity",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.activity_title ?? "-"}</div>
    ),
  },
  {
    accessorKey: "activity_date",
    header: "date",
    cell: ({ row }) => row.original.activity_date ?? "-",
  },
  {
    accessorKey: "user_type",
    header: "type",
  },
  {
    accessorKey: "status",
    header: "status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "user_id",
    header: "user id",
    cell: ({ row }) => (
      <div className="max-w-[240px] truncate">{row.original.user_id}</div>
    ),
  },
  {
    accessorKey: "activity_location",
    header: "location",
    cell: ({ row }) => row.original.activity_location ?? "-",
  },
];
