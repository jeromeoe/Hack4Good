import * as React from "react";
import { supabase } from "../../../lib/supabase";

import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

import UserDetailSheet from "./UserDetailSheet";

type Role = "staff" | "volunteer" | "participant" | "admin";

type Profile = {
  id: string;
  email: string | null;
  role: Role | null;
  full_name: string | null;
  phone: string | null;
  age: number | null;
  disability: string | null;
  caregiver_info: any | null;
};

function roleBadgeVariant(role: Role | null) {
  if (!role) return "outline";
  if (role === "admin") return "default";
  return "secondary";
}

export default function UsersOverviewPage() {
  const [rows, setRows] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [q, setQ] = React.useState("");

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role,full_name,phone,age,disability,caregiver_info")
      .order("role", { ascending: true })
      .order("full_name", { ascending: true });

    if (!error) setRows((data ?? []) as Profile[]);
    setLoading(false);
  }

  function matchesSearch(p: Profile) {
    const hay = `${p.full_name ?? ""} ${p.email ?? ""} ${p.role ?? ""} ${
      p.disability ?? ""
    }`.toLowerCase();
    return hay.includes(q.toLowerCase());
  }

  // tabs:
  // - staff tab: staff + admin (admins are effectively staff-like here)
  // - volunteers tab: volunteers only
  // - participants tab: participants only
  const staffRows = rows.filter(
    (p) => (p.role === "staff" || p.role === "admin") && matchesSearch(p),
  );
  const volunteerRows = rows.filter(
    (p) => p.role === "volunteer" && matchesSearch(p),
  );
  const participantRows = rows.filter(
    (p) => p.role === "participant" && matchesSearch(p),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">users</h1>
        <p className="text-muted-foreground">
          view staff, volunteers, and participants — plus activity
          participation.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="search name/email/role/disability..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button variant="outline" onClick={load} disabled={loading}>
          refresh
        </Button>
      </div>

      <Tabs defaultValue="staff" className="space-y-3">
        <TabsList>
          <TabsTrigger value="staff">staff</TabsTrigger>
          <TabsTrigger value="volunteers">volunteers</TabsTrigger>
          <TabsTrigger value="participants">participants</TabsTrigger>
        </TabsList>

        <TabsContent value="staff">
          <UsersTable
            title="staff"
            description="staff details + created activities + participation"
            loading={loading}
            rows={staffRows}
            onView={(p) => {
              setActive(p);
              setOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="volunteers">
          <UsersTable
            title="volunteers"
            description="volunteer details + created activities (if any) + participation"
            loading={loading}
            rows={volunteerRows}
            onView={(p) => {
              setActive(p);
              setOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="participants">
          <UsersTable
            title="participants"
            description="participant details + disability needs + participation"
            loading={loading}
            rows={participantRows}
            onView={(p) => {
              setActive(p);
              setOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <UserDetailSheet
        open={open}
        onOpenChange={setOpen}
        profile={active}
        // show created activities for staff + admin + volunteers
        showCreated={
          active?.role === "staff" ||
          active?.role === "admin" ||
          active?.role === "volunteer"
        }
      />
    </div>
  );
}

function UsersTable({
  title,
  description,
  loading,
  rows,
  onView,
}: {
  title: string;
  description: string;
  loading: boolean;
  rows: Profile[];
  onView: (p: Profile) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="p-3 text-left">name</th>
              <th className="p-3 text-left">role</th>
              <th className="p-3 text-left">email</th>
              <th className="p-3 text-left">disability</th>
              <th className="p-3 text-left">action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={5}>
                  loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={5}>
                  no users.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3 font-medium">{p.full_name ?? "-"}</td>
                  <td className="p-3">
                    {p.role ? (
                      <Badge variant={roleBadgeVariant(p.role)}>{p.role}</Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">{p.email ?? "-"}</td>
                  <td className="p-3">{p.disability ?? "-"}</td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(p)}
                    >
                      view
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
