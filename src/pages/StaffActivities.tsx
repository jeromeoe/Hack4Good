import { useState } from "react";
import { Plus, Trash2, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button"; //

// 1. Mock Data (Starting State)
const INITIAL_ACTIVITIES = [
  {
    id: 1,
    title: "Weekend Art Therapy",
    date: "2024-03-15",
    location: "MINDS Woodlands",
    category: "Arts & Crafts",
    spots: 15,
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "Community Garden Help",
    date: "2024-03-20",
    location: "Jurong West Center",
    category: "Outdoor",
    spots: 8,
    image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=800",
  },
];

export default function StaffActivities() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newActivity, setNewActivity] = useState({
    title: "",
    date: "",
    location: "",
    spots: "",
  });

  // --- Handlers ---

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      setActivities(activities.filter((a) => a.id !== id));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    const title = newActivity.title.trim();
    const date = newActivity.date.trim();
    const location = newActivity.location.trim();
    const spotsNum = parseInt(newActivity.spots, 10);

    if (!title || !date || !location || Number.isNaN(spotsNum)) {
      alert("Please fill in title, date, location, and a valid number of spots.");
      return;
    }

    if (spotsNum <= 0) {
      alert("Spots must be greater than 0.");
      return;
    }

    // Create new object
    const activity = {
      id: Date.now(), // Random ID
      title,
      date,
      location,
      category: "General", // Default for now
      spots: spotsNum,
      image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=800", // Default Placeholder
    };

    // Add to list
    setActivities([activity, ...activities]);
    
    // Reset & Close
    setNewActivity({ title: "", date: "", location: "", spots: "" });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Activities</h1>
          <p className="text-gray-600">Create, edit, and oversee volunteer events.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Create New Activity
        </Button>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
            {/* Image */}
            <div className="h-48 overflow-hidden relative">
              <img
                src={activity.image}
                alt={activity.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                {activity.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{activity.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{activity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{activity.spots} Spots Available</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-gray-100 flex gap-2">
                <Button variant="outline" className="flex-1">
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => handleDelete(activity.id)}
                  title="Delete Activity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CREATE MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Activity</h2>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Beach Cleanup"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newActivity.title}
                  onChange={e => setNewActivity({...newActivity, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  required
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newActivity.date}
                  onChange={e => setNewActivity({...newActivity, date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Pasir Ris Park"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newActivity.location}
                  onChange={e => setNewActivity({...newActivity, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Spots</label>
                <input
                  required
                  type="number"
                  placeholder="20"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newActivity.spots}
                  onChange={e => setNewActivity({...newActivity, spots: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Create Event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}