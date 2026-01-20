import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

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

type ActivityLite = {
  id: number;
  title: string;
  date: string;
  location: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: Profile | null;
  showCreated?: boolean;
};

function badgeVariantForRole(role: Role | null) {
  if (!role) return "outline";
  if (role === "admin") return "default";
  return "secondary";
}

function caregiverSummary(caregiver: any) {
  // tries to show something human-friendly instead of raw json
  if (!caregiver || typeof caregiver !== "object") return null;
  const name = caregiver.name ?? caregiver.full_name ?? null;
  const phone = caregiver.phone ?? caregiver.contact ?? null;
  const relationship = caregiver.relationship ?? caregiver.relation ?? null;
  return { name, phone, relationship };
}

export default function UserDetailSheet({
  open,
  onOpenChange,
  profile,
  showCreated,
}: Props) {
  const navigate = useNavigate();

  const [signedUp, setSignedUp] = React.useState<ActivityLite[]>([]);
  const [created, setCreated] = React.useState<ActivityLite[]>([]);
  const [loadingSignedUp, setLoadingSignedUp] = React.useState(false);
  const [loadingCreated, setLoadingCreated] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !profile) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, profile?.id]);

  async function load() {
    if (!profile) return;
    setError(null);

    // signed up activities
    setLoadingSignedUp(true);
    const { data: regData, error: regErr } = await supabase
      .from("registrations")
      .select("activity_id, activities(id,title,date,location)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });

    if (regErr) {
      setError(regErr.message);
      setSignedUp([]);
    } else {
      setSignedUp(
        (regData ?? [])
          .map((r: any) => r.activities)
          .filter(Boolean)
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.date,
            location: a.location,
          })),
      );
    }
    setLoadingSignedUp(false);

    // created activities
    if (showCreated) {
      setLoadingCreated(true);
      const { data: createdData, error: createdErr } = await supabase
        .from("activities")
        .select("id,title,date,location")
        .eq("created_by", profile.id)
        .order("date", { ascending: true });

      if (createdErr) {
        setCreated([]);
        setError((prev) => prev ?? createdErr.message);
      } else {
        setCreated(
          (createdData ?? []).map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.date,
            location: a.location,
          })),
        );
      }
      setLoadingCreated(false);
    } else {
      setCreated([]);
    }
  }

  if (!profile) return null;

  const name = profile.full_name ?? "(no name)";
  const caregiver = caregiverSummary(profile.caregiver_info);

  function goToActivity(activityId: number) {
    // go to admin activity detail page
    onOpenChange(false);
    navigate(`/admin/activities/${activityId}`);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <SheetTitle className="text-xl">{name}</SheetTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant={badgeVariantForRole(profile.role)}>
                  {profile.role ?? "unknown"}
                </Badge>
                {profile.email && (
                  <Badge variant="outline">{profile.email}</Badge>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={load}>
              refresh
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* quick info cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">contact</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">phone</span>
                  <span className="font-medium">{profile.phone ?? "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">email</span>
                  <span className="font-medium truncate max-w-[220px]">
                    {profile.email ?? "-"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">access needs</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">age</span>
                  <span className="font-medium">{profile.age ?? "-"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">disability</span>
                  <span className="font-medium">
                    {profile.disability ?? "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* caregiver */}
          {profile.caregiver_info && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">caregiver</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {caregiver?.name ||
                caregiver?.phone ||
                caregiver?.relationship ? (
                  <div className="grid grid-cols-1 gap-1">
                    {caregiver?.name && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">name</span>
                        <span className="font-medium">{caregiver.name}</span>
                      </div>
                    )}
                    {caregiver?.relationship && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">
                          relationship
                        </span>
                        <span className="font-medium">
                          {caregiver.relationship}
                        </span>
                      </div>
                    )}
                    {caregiver?.phone && (
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">phone</span>
                        <span className="font-medium">{caregiver.phone}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    caregiver info saved (raw json)
                  </div>
                )}

                <details className="rounded-md border p-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground">
                    view raw caregiver json
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap">
                    {JSON.stringify(profile.caregiver_info, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* activity tabs */}
          <Tabs defaultValue="participation" className="space-y-3">
            <TabsList>
              <TabsTrigger value="participation">
                participation{loadingSignedUp ? "" : ` (${signedUp.length})`}
              </TabsTrigger>
              {showCreated && (
                <TabsTrigger value="created">
                  created{loadingCreated ? "" : ` (${created.length})`}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="participation" className="space-y-2">
              <div className="text-sm text-muted-foreground">
                activities this user signed up for
              </div>

              {loadingSignedUp ? (
                <div className="text-sm text-muted-foreground">loading...</div>
              ) : (
                <ActivityChips
                  rows={signedUp}
                  emptyText="no signups yet."
                  onClick={goToActivity}
                />
              )}
            </TabsContent>

            {showCreated && (
              <TabsContent value="created" className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  activities created by this user
                </div>

                {loadingCreated ? (
                  <div className="text-sm text-muted-foreground">
                    loading...
                  </div>
                ) : (
                  <ActivityChips
                    rows={created}
                    emptyText="no created activities."
                    onClick={goToActivity}
                  />
                )}
              </TabsContent>
            )}
          </Tabs>

          <div className="text-xs text-muted-foreground">
            tip: click an activity chip to open the admin activity detail page
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ActivityChips({
  rows,
  emptyText,
  onClick,
}: {
  rows: ActivityLite[];
  emptyText: string;
  onClick: (id: number) => void;
}) {
  if (rows.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyText}</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((a) => (
        <button
          key={a.id}
          onClick={() => onClick(a.id)}
          className="rounded-md border px-3 py-1 text-sm hover:bg-muted transition max-w-full"
          title={`${a.title} • ${a.date} • ${a.location}`}
          type="button"
        >
          <span className="inline-block max-w-[280px] truncate align-bottom">
            {a.title}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">{a.date}</span>
        </button>
      ))}
    </div>
  );
}
