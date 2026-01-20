import * as React from "react";
import { supabase } from "../../../lib/supabase";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

import UserDetailSheet from "./UserDetailSheet";

type Profile = {
  id: string;
  email: string | null;
  role: "staff" | "volunteer" | "participant" | "admin" | null;
  full_name: string | null;
  phone: string | null;
  age: number | null;
  disability: string | null;
  caregiver_info: any | null;
};

export default function StaffUsersPage() {
  const [rows, setRows] = React.useState<Profile[]>([]);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id,email,role,full_name,phone,age,disability,caregiver_info")
      .eq("role", "staff")
      .order("full_name", { ascending: true });

    setRows((data ?? []) as Profile[]);
    setLoading(false);
  }

  const filtered = rows.filter((p) => {
    const hay = `${p.full_name ?? ""} ${p.email ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">staff management</h1>
        <p className="text-muted-foreground">
          view staff users and the activities they created.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="search staff name/email..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button variant="outline" onClick={load} disabled={loading}>
          refresh
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="p-3 text-left">name</th>
              <th className="p-3 text-left">email</th>
              <th className="p-3 text-left">role</th>
              <th className="p-3 text-left">action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={4}>
                  loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="p-3 text-muted-foreground" colSpan={4}>
                  no staff.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3 font-medium">{p.full_name ?? "-"}</td>
                  <td className="p-3">{p.email ?? "-"}</td>
                  <td className="p-3">
                    <Badge variant="secondary">staff</Badge>
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActive(p);
                        setOpen(true);
                      }}
                    >
                      view staff
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserDetailSheet
        open={open}
        onOpenChange={setOpen}
        profile={active}
        showCreated
      />
    </div>
  );
}
