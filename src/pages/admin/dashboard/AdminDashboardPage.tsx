import * as React from "react";
import { supabase } from "../../../lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

type Counts = {
  usersTotal: number;
  staffCount: number;
  volunteerCount: number;
  participantCount: number;

  activitiesTotal: number;
  upcomingActivities: number;

  regsTotal: number;
  regsConfirmed: number;
  regsWaitlist: number;
  regsCancelled: number;
};

type NextActivity = {
  id: number;
  title: string;
  date: string;
  participant_slots: number;
  volunteer_slots: number;
  participants_confirmed: number;
  volunteers_confirmed: number;
};

const initialCounts: Counts = {
  usersTotal: 0,
  staffCount: 0,
  volunteerCount: 0,
  participantCount: 0,

  activitiesTotal: 0,
  upcomingActivities: 0,

  regsTotal: 0,
  regsConfirmed: 0,
  regsWaitlist: 0,
  regsCancelled: 0,
};

export default function AdminDashboardPage() {
  const [counts, setCounts] = React.useState<Counts>(initialCounts);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [nextActivity, setNextActivity] = React.useState<NextActivity | null>(
    null,
  );

  React.useEffect(() => {
    load();
  }, []);

  async function count(table: string, filter?: (q: any) => any) {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = filter(q);
    const { count, error } = await q;
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  function pct(n: number, d: number) {
    if (!d || d <= 0) return 0;
    return Math.round((n / d) * 100);
  }

  async function load() {
    setLoading(true);
    setError(null);

    try {
      // keeps it simple: just counts. fast and demo-friendly.
      const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

      // next upcoming activity (nearest by date)
      const { data: next, error: nextErr } = await supabase
        .from("activities")
        .select("id,title,date,participant_slots,volunteer_slots")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextErr) throw new Error(nextErr.message);

      if (!next) {
        setNextActivity(null);
      } else {
        // count confirmed registrations for this activity (participants + volunteers)
        const { data: regRows, error: regErr } = await supabase
          .from("registrations")
          .select("user_type,status")
          .eq("activity_id", next.id)
          .eq("status", "confirmed");

        if (regErr) throw new Error(regErr.message);

        let p = 0;
        let v = 0;
        for (const r of regRows ?? []) {
          if (r.user_type === "participant") p += 1;
          if (r.user_type === "volunteer") v += 1;
        }

        setNextActivity({
          id: next.id,
          title: next.title,
          date: next.date,
          participant_slots: next.participant_slots ?? 0,
          volunteer_slots: next.volunteer_slots ?? 0,
          participants_confirmed: p,
          volunteers_confirmed: v,
        });
      }

      const [
        usersTotal,
        staffCount,
        volunteerCount,
        participantCount,

        activitiesTotal,
        upcomingActivities,

        regsTotal,
        regsConfirmed,
        regsWaitlist,
        regsCancelled,
      ] = await Promise.all([
        count("profiles"),
        count("profiles", (q) => q.eq("role", "staff")),
        count("profiles", (q) => q.eq("role", "volunteer")),
        count("profiles", (q) => q.eq("role", "participant")),

        count("activities"),
        count("activities", (q) => q.gte("date", today)),

        count("registrations"),
        count("registrations", (q) => q.eq("status", "confirmed")),
        count("registrations", (q) => q.eq("status", "waitlist")),
        count("registrations", (q) => q.eq("status", "cancelled")),
      ]);

      setCounts({
        usersTotal,
        staffCount,
        volunteerCount,
        participantCount,
        activitiesTotal,
        upcomingActivities,
        regsTotal,
        regsConfirmed,
        regsWaitlist,
        regsCancelled,
      });
    } catch (e: any) {
      setError(e?.message ?? "failed to load dashboard stats");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            quick overview of users, activities, and registrations.
          </p>
        </div>

        <Button variant="outline" onClick={load} disabled={loading}>
          refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="total users"
          value={counts.usersTotal}
          loading={loading}
          footer={
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">staff: {counts.staffCount}</Badge>
              <Badge variant="secondary">
                volunteers: {counts.volunteerCount}
              </Badge>
              <Badge variant="secondary">
                participants: {counts.participantCount}
              </Badge>
            </div>
          }
        />

        <StatCard
          title="activities"
          value={counts.activitiesTotal}
          loading={loading}
          footer={
            <div className="text-sm text-muted-foreground">
              upcoming:{" "}
              <span className="font-medium text-foreground">
                {counts.upcomingActivities}
              </span>
            </div>
          }
        />

        <StatCard
          title="registrations"
          value={counts.regsTotal}
          loading={loading}
          footer={
            <div className="text-sm text-muted-foreground">
              confirmed:{" "}
              <span className="font-medium text-foreground">
                {counts.regsConfirmed}
              </span>
            </div>
          }
        />

        <StatCard
          title="queue health"
          value={counts.regsWaitlist}
          loading={loading}
          footer={
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">waitlist: {counts.regsWaitlist}</Badge>
              <Badge variant="outline">cancelled: {counts.regsCancelled}</Badge>
            </div>
          }
        />

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">next activity fill rate</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {loading ? (
              <div className="text-sm text-muted-foreground">loading...</div>
            ) : !nextActivity ? (
              <div className="text-sm text-muted-foreground">
                no upcoming activities.
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{nextActivity.title}</div>
                  <Badge variant="outline">{nextActivity.date}</Badge>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      participants
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {nextActivity.participants_confirmed}/
                      {nextActivity.participant_slots}{" "}
                      <span className="text-sm text-muted-foreground">
                        (
                        {pct(
                          nextActivity.participants_confirmed,
                          nextActivity.participant_slots,
                        )}
                        %)
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">
                      volunteers
                    </div>
                    <div className="mt-1 text-lg font-bold">
                      {nextActivity.volunteers_confirmed}/
                      {nextActivity.volunteer_slots}{" "}
                      <span className="text-sm text-muted-foreground">
                        (
                        {pct(
                          nextActivity.volunteers_confirmed,
                          nextActivity.volunteer_slots,
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  this helps staff instantly see capacity + volunteer coverage
                  without manual consolidation.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* optional: a tiny "what to do next" block so the dashboard feels alive */}
      <div className="rounded-md border p-4">
        <div className="font-medium">today’s admin checklist</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>review waitlisted users and confirm slots when capacity opens</li>
          <li>check upcoming activities and ensure volunteer coverage</li>
          <li>
            spot users with access needs and ensure accommodations are prepared
          </li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  loading,
  footer,
}: {
  title: string;
  value: number;
  loading: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold">{loading ? "…" : value}</div>
        {footer}
      </CardContent>
    </Card>
  );
}
