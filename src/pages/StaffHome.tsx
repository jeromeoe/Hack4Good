import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Calendar, AlertCircle, TrendingUp, Activity, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase"; //

export default function StaffHome() {
  const [stats, setStats] = useState({
    volunteers: 0,
    participants: 0,
    activeActivities: 0,
    pending: 0,
  });
  
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Get Counts
        const { count: volCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "volunteer"); //

        const { count: partCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "participant");

        const { count: actCount } = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true })
          .gte("date", new Date().toISOString()); // Only future activities

        // 2. Get Recent Registrations (Joined with Profile & Activity info)
        const { data: recent } = await supabase
          .from("registrations")
          .select(`
            created_at,
            status,
            user_type,
            profiles (full_name, email),
            activities (title)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          volunteers: volCount || 0,
          participants: partCount || 0,
          activeActivities: actCount || 0,
          pending: 0, // Placeholder if you don't have a 'pending' status yet
        });

        if (recent) setRecentSignups(recent);

      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Total Volunteers", value: stats.volunteers, icon: Users, color: "text-blue-600" },
    { label: "Total Participants", value: stats.participants, icon: Activity, color: "text-indigo-600" },
    { label: "Upcoming Activities", value: stats.activeActivities, icon: Calendar, color: "text-green-600" },
    { label: "New Signups (7d)", value: recentSignups.length, icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of platform activity and volunteer engagement.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
             <Link to="/staff/activities">View Calendar</Link>
          </Button>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/staff/activities">
              <Plus className="mr-2 h-4 w-4" /> Create Activity
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "-" : stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time data from database
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Recent Activity Section */}
        <Card className="md:col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {loading ? (
                <div className="text-sm text-gray-500">Loading activity...</div>
              ) : recentSignups.length === 0 ? (
                <div className="text-sm text-gray-500">No recent signups found.</div>
              ) : (
                recentSignups.map((item, i) => {
                  // Safety checks for joined data
                  const name = item.profiles?.full_name || "Unknown User";
                  const email = item.profiles?.email || "No Email";
                  const activityTitle = item.activities?.title || "Unknown Activity";
                  
                  return (
                    <div key={i} className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {name} <span className="text-gray-400 font-normal">registered for</span> {activityTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {email} • Role: {item.user_type || "General"}
                        </p>
                      </div>
                      <div className="ml-auto font-medium text-xs text-gray-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips / Status Card */}
        <Card className="md:col-span-3 lg:col-span-2">
           <CardHeader>
             <CardTitle>System Status</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
               <Activity className="h-4 w-4" />
               <span>All systems operational</span>
             </div>
             
             <div className="rounded-lg border p-3">
               <div className="text-sm font-medium mb-1">Next Scheduled Event</div>
               {/* Logic to find next event could go here, for now static placeholder */}
               <div className="text-xs text-gray-500">Check the calendar for upcoming activities.</div>
               <Button asChild variant="link" className="px-0 text-xs h-auto mt-2">
                 <Link to="/staff/activities" className="flex items-center">
                   Go to Calendar <ArrowRight className="ml-1 h-3 w-3" />
                 </Link>
               </Button>
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}