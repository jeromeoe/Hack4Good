import * as React from "react";
import { Link } from "react-router-dom";
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

export default function UserDetailSheet({
  open,
  onOpenChange,
  profile,
  showCreated,
}: Props) {
  const [signedUp, setSignedUp] = React.useState<ActivityLite[]>([]);
  const [created, setCreated] = React.useState<ActivityLite[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || !profile) return;

    async function load() {
      setLoading(true);

      // signed up activities via registrations
      const { data: regData } = await supabase
        .from("registrations")
        .select("activity_id, activities(id,title,date,location)")
        .eq("user_id", profile.id);

      const signed =
        (regData ?? [])
          .map((r: any) => r.activities)
          .filter(Boolean)
          .map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.date,
            location: a.location,
          })) ?? [];

      setSignedUp(signed);

      // created activities (only if you added activities.created_by)
      if (showCreated) {
        const { data: createdData, error } = await supabase
          .from("activities")
          .select("id,title,date,location")
          .eq("created_by", profile.id)
          .order("date", { ascending: true });

        // if created_by column doesn't exist yet, just show none
        if (!error) {
          setCreated(
            (createdData ?? []).map((a: any) => ({
              id: a.id,
              title: a.title,
              date: a.date,
              location: a.location,
            })),
          );
        } else {
          setCreated([]);
        }
      } else {
        setCreated([]);
      }

      setLoading(false);
    }

    load();
  }, [open, profile?.id]);

  if (!profile) return null;

  const name = profile.full_name ?? "(no name)";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{name}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            {profile.role && <Badge variant="secondary">{profile.role}</Badge>}
            {profile.email && <Badge variant="outline">{profile.email}</Badge>}
          </div>

          <div className="space-y-1">
            <div>
              <span className="text-muted-foreground">phone:</span>{" "}
              {profile.phone ?? "-"}
            </div>
            <div>
              <span className="text-muted-foreground">age:</span>{" "}
              {profile.age ?? "-"}
            </div>
            <div>
              <span className="text-muted-foreground">disability:</span>{" "}
              {profile.disability ?? "-"}
            </div>
          </div>

          {profile.caregiver_info && (
            <>
              <Separator />
              <div className="space-y-1">
                <div className="font-medium">caregiver info</div>
                <pre className="text-xs whitespace-pre-wrap rounded-md border p-2">
                  {JSON.stringify(profile.caregiver_info, null, 2)}
                </pre>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">signed up activities</div>
              {loading && (
                <span className="text-muted-foreground">loading...</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {signedUp.length === 0 ? (
                <span className="text-muted-foreground">none</span>
              ) : (
                signedUp.map((a) => (
                  <Button key={a.id} variant="outline" size="sm" asChild>
                    <Link to={`/admin/activities/${a.id}`}>{a.title}</Link>
                  </Button>
                ))
              )}
            </div>
          </div>

          {showCreated && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="font-medium">activities created</div>
                <div className="flex flex-wrap gap-2">
                  {created.length === 0 ? (
                    <span className="text-muted-foreground">none</span>
                  ) : (
                    created.map((a) => (
                      <Button key={a.id} variant="outline" size="sm" asChild>
                        <Link to={`/admin/activities/${a.id}`}>{a.title}</Link>
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
