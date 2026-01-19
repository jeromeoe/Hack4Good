import { Button } from "@/components/ui/button";
import type { Activity } from "../types/activity";

// Mock Data before API integration
const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: "Pottery Workshop",
    startTime: "2026-02-15T14:00:00",
    endTime: "2026-02-15T16:00:00",
    location: "Minds Hub (Jurong)",
    volunteerSlotsTotal: 5,
    volunteerSlotsFilled: 3,
    participantCapacity: 20,
    participantRegistered: 20,
    waitlistCount: 4,
    tags: ["Wheelchair Friendly", "Art"],
  },
  {
    id: 2,
    title: "Zoo Outing",
    startTime: "2026-03-10T09:00:00",
    endTime: "2026-03-10T13:00:00",
    location: "Mandai Zoo",
    volunteerSlotsTotal: 10,
    volunteerSlotsFilled: 10,
    participantCapacity: 30,
    participantRegistered: 25,
    waitlistCount: 0,
    tags: ["Outdoor", "Payment Required"],
  },
];

export default function StaffActivities() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Management</h1>
          <p className="text-gray-500">Manage schedules, capacity, and tags.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Export CSV</Button>
          <Button>Create Activity</Button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Activity Name</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Participants</th>
              <th className="px-6 py-3">Volunteers</th>
              <th className="px-6 py-3">Tags</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {MOCK_ACTIVITIES.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {activity.title}
                  <div className="text-xs text-gray-400 font-normal">{activity.location}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(activity.startTime).toLocaleDateString()}
                  <br />
                  {new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </td>
                
                {/* Participant Capacity & Waitlist Logic */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${activity.participantRegistered >= activity.participantCapacity ? 'bg-red-500' : 'bg-green-500'}`} 
                        style={{ width: `${(activity.participantRegistered / activity.participantCapacity) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {activity.participantRegistered}/{activity.participantCapacity}
                    </span>
                  </div>
                  {activity.waitlistCount > 0 && (
                    <span className="text-xs text-red-600 font-medium mt-1 block">
                      Waitlist: {activity.waitlistCount}
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {activity.volunteerSlotsFilled}/{activity.volunteerSlotsTotal} Filled
                </td>
                
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {activity.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md border">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}