import { useEffect, useState } from "react";
import { Plus, Trash2, MapPin, Calendar, Users, Edit2, Search, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";

// Extended Interface
interface Activity {
  id: number;
  title: string;
  date: string;
  location: string;
  spots: number;
  image: string;
  // New Fields
  category: string; // "General"
  activity_type: string; // "Physical", "Cultural", etc.
  disability_access: string; // "Wheelchair", "Sensory", etc.
  comments: string;
}

const TYPE_COLORS: Record<string, string> = {
  Physical: "bg-orange-100 text-orange-700",
  Cultural: "bg-purple-100 text-purple-700",
  Social: "bg-blue-100 text-blue-700",
  Educational: "bg-emerald-100 text-emerald-700",
  General: "bg-gray-100 text-gray-700",
};

export default function StaffActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    spots: "",
    activity_type: "Social",
    disability_access: "Universal",
    comments: "",
  });

  // --- 1. Load Data ---
  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('date', { ascending: true });

    if (!error && data) setActivities(data);
    setIsLoading(false);
  }

  // --- 2. Open Modal (Create vs Edit) ---
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "", date: "", location: "", spots: "",
      activity_type: "Social", disability_access: "Universal", comments: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingId(activity.id);
    setFormData({
      title: activity.title,
      date: activity.date,
      location: activity.location,
      spots: activity.spots.toString(),
      activity_type: activity.activity_type || "Social",
      disability_access: activity.disability_access || "Universal",
      comments: activity.comments || "",
    });
    setIsModalOpen(true);
  };

  // --- 3. Save (Insert or Update) ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      date: formData.date,
      location: formData.location,
      spots: parseInt(formData.spots),
      activity_type: formData.activity_type,
      disability_access: formData.disability_access,
      comments: formData.comments,
      category: "General", // Keeping for backward compatibility
      // Random Image based on type if creating new
      image: editingId 
        ? undefined // Don't change image on edit
        : `https://source.unsplash.com/800x600/?${formData.activity_type.toLowerCase()}`
    };

    let error;
    
    if (editingId) {
      // UPDATE existing
      const { error: updateError } = await supabase
        .from('activities')
        .update(payload)
        .eq('id', editingId);
      error = updateError;
    } else {
      // INSERT new
      const { error: insertError } = await supabase
        .from('activities')
        .insert([{ ...payload, image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=800" }]);
      error = insertError;
    }

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      fetchActivities(); // Refresh list
      setIsModalOpen(false);
    }
  };

  // --- 4. Delete ---
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event permanently?")) return;
    await supabase.from('activities').delete().eq('id', id);
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // --- Filter Logic ---
  const filteredActivities = activities.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.activity_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Manager</h1>
          <p className="text-gray-600">Oversee all volunteer opportunities.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search events..." 
              className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 shadow-md">
            <Plus className="mr-2 h-4 w-4" /> New Activity
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <p>Loading...</p> : filteredActivities.map((activity) => (
          <div key={activity.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
            
            {/* Image Header */}
            <div className="h-40 overflow-hidden relative bg-gray-100">
              <img
                src={activity.image || "/placeholder.jpg"}
                alt={activity.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                 <span className={`px-2 py-1 rounded-md text-xs font-bold shadow-sm ${TYPE_COLORS[activity.activity_type] || TYPE_COLORS.General}`}>
                  {activity.activity_type}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{activity.title}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                   <Accessibility className="w-3 h-3" />
                   Access: <span className="font-medium text-gray-700">{activity.disability_access}</span>
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="truncate">{activity.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span>{activity.spots} Spots</span>
                </div>
              </div>

              {/* Extra Comments Preview */}
              {activity.comments && (
                <div className="text-xs text-gray-500 italic border-l-2 border-blue-200 pl-2">
                  "{activity.comments}"
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex gap-2">
                <Button variant="outline" className="flex-1 hover:bg-gray-50" onClick={() => openEditModal(activity)}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                  onClick={() => handleDelete(activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CREATE / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Activity" : "Create New Activity"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {/* Title & Type */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="label">Event Title</label>
                  <input
                    required
                    className="input-field"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. Clay Making Workshop"
                  />
                </div>
                <div>
                   <label className="label">Type</label>
                   <select 
                      className="input-field"
                      value={formData.activity_type}
                      onChange={e => setFormData({...formData, activity_type: e.target.value})}
                   >
                     <option value="Social">Social</option>
                     <option value="Physical">Physical</option>
                     <option value="Cultural">Cultural</option>
                     <option value="Educational">Educational</option>
                   </select>
                </div>
              </div>

              {/* Date & Spots */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input
                    required
                    type="date"
                    className="input-field"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Total Spots</label>
                  <input
                    required
                    type="number"
                    className="input-field"
                    value={formData.spots}
                    onChange={e => setFormData({...formData, spots: e.target.value})}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="label">Location</label>
                <input
                  required
                  className="input-field"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g. MINDS Hub @ Yishun"
                />
              </div>

              {/* Disability Access */}
              <div>
                <label className="label">Disability Accessibility</label>
                <select 
                  className="input-field"
                  value={formData.disability_access}
                  onChange={e => setFormData({...formData, disability_access: e.target.value})}
                >
                  <option value="Universal">Universal (All Welcome)</option>
                  <option value="Wheelchair Friendly">Wheelchair Friendly</option>
                  <option value="Sensory Friendly">Sensory Friendly (Quiet)</option>
                  <option value="Ambulant">Ambulant Only</option>
                  <option value="High Support">High Support Available</option>
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="label">Extra Comments (Staff Tips)</label>
                <textarea
                  className="input-field h-24 resize-none"
                  value={formData.comments}
                  onChange={e => setFormData({...formData, comments: e.target.value})}
                  placeholder="e.g. Good for pairs. Bring extra water."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {editingId ? "Save Changes" : "Create Event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem; }
        .input-field { width: 100%; border: 1px solid #E5E7EB; border-radius: 0.5rem; padding: 0.5rem 0.75rem; outline: none; transition: all 0.2s; }
        .input-field:focus { border-color: #2563EB; ring: 2px; ring-color: #BFDBFE; }
      `}</style>
    </div>
  );
}