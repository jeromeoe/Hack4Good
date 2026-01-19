import { Users, Calendar, AlertCircle, TrendingUp } from "lucide-react";

export default function StaffHome() {
  const stats = [
    { label: "Total Participants", value: "1,240", icon: Users, color: "bg-blue-500" },
    { label: "Active Activities", value: "12", icon: Calendar, color: "bg-green-500" },
    { label: "Pending Approvals", value: "5", icon: AlertCircle, color: "bg-amber-500" },
    { label: "Monthly Growth", value: "+18%", icon: TrendingUp, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, Jerome. Here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Signups</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                    U{i}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New Volunteer Signed Up</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}