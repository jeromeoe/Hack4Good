import { Users, Calendar, AlertCircle, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffHome() {
  const stats = [
    { label: "Total Participants", value: "1,240", icon: Users, color: "text-blue-600" },
    { label: "Active Activities", value: "12", icon: Calendar, color: "text-green-600" },
    { label: "Pending Approvals", value: "5", icon: AlertCircle, color: "text-amber-600" },
    { label: "Monthly Growth", value: "+18%", icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, Jerome. Here is the executive summary.
        </p>
      </div>

      {/* Stats Grid using Shadcn Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Section */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border">
                  <Activity className="h-4 w-4 text-slate-500" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New Volunteer Registration</p>
                  <p className="text-sm text-muted-foreground">
                    user_{i}@example.com
                  </p>
                </div>
                <div className="ml-auto font-medium text-sm text-green-600">
                  + Verified
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}