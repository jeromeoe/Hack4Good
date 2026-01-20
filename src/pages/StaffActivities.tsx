import { useEffect, useState } from "react";
import { Plus, Trash2, MapPin, Calendar, Users, Edit2, Search, Accessibility, Clock, Image as ImageIcon } from "lucide-react";
import { supabase } from "../lib/supabase";

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types and Colors
interface Activity {
  id: number;
  title: string;
  date: string;
  location: string;
  meeting_location?: string;
  time_start?: string;
  time_end?: string;
  volunteer_slots?: number;
  participant_slots?: number;
  image: string;
  category: string;
  activity_type: string;
  disability_access: string;
  comments: string;
}

const BADGE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Physical: "destructive", // Red-ish
  Cultural: "secondary",   // Gray-ish
  Social: "default",       // Dark/Black
  Educational: "outline",  // White with border
};

export default function StaffActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    meeting_location: "",
    time_start: "",
    time_end: "",
    volunteer_slots: "",
    participant_slots: "",
    activity_type: "Social",
    disability_access: "Universal",
    comments: "",
    image: "", // ✅ ADDED: Image URL field
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

  // --- 2. Modal Handlers ---
  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: "", 
      date: "", 
      location: "", 
      meeting_location: "",
      time_start: "",
      time_end: "",
      volunteer_slots: "",
      participant_slots: "",
      activity_type: "Social", 
      disability_access: "Universal", 
      comments: "",
      image: "", // Reset image
    });
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingId(activity.id);
    setFormData({
      title: activity.title,
      date: activity.date,
      location: activity.location,
      meeting_location: activity.meeting_location || "",
      time_start: activity.time_start || "",
      time_end: activity.time_end || "",
      volunteer_slots: activity.volunteer_slots?.toString() || "",
      participant_slots: activity.participant_slots?.toString() || "",
      activity_type: activity.activity_type || "Social",
      disability_access: activity.disability_access || "Universal",
      comments: activity.comments || "",
      image: activity.image || "", // ✅ Load existing image
    });
    setIsModalOpen(true);
  };

  // --- 3. Save Handler ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const volunteerSlots = parseInt(formData.volunteer_slots) || 0;
    const participantSlots = parseInt(formData.participant_slots) || 0;
    
    // Use user-provided image or fallback to placeholder if empty
    const imageToUse = formData.image.trim() !== "" 
      ? formData.image 
      : "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=800";

    const payload = {
      title: formData.title,
      date: formData.date,
      location: formData.location,
      meeting_location: formData.meeting_location || null,
      time_start: formData.time_start || null,
      time_end: formData.time_end || null,
      volunteer_slots: volunteerSlots,
      participant_slots: participantSlots,
      activity_type: formData.activity_type,
      disability_access: formData.disability_access,
      comments: formData.comments,
      category: "General",
      image: imageToUse, // ✅ Send image to DB
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('activities').update(payload).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('activities').insert([payload]);
      error = insertError;
    }

    if (error) alert("Error saving: " + error.message);
    else {
      fetchActivities();
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this event permanently?")) return;
    await supabase.from('activities').delete().eq('id', id);
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const filteredActivities = activities.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Activity Manager</h1>
          <p className="text-muted-foreground">Create and manage volunteer opportunities.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" /> New Activity
          </Button>
        </div>
      </div>

      {/* Shadcn Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <p>Loading events...</p> : filteredActivities.map((activity) => (
          <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="h-40 overflow-hidden relative">
              <img
                src={activity.image || "/placeholder.jpg"}
                alt={activity.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-2 right-2">
                <Badge variant={BADGE_VARIANTS[activity.activity_type] || "secondary"}>
                  {activity.activity_type}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="flex justify-between items-start text-lg">
                {activity.title}
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                 <Accessibility className="w-3 h-3" />
                 {activity.disability_access}
              </div>
            </CardHeader>

            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{new Date(activity.date).toLocaleDateString()}</span>
              </div>
              {activity.time_start && activity.time_end && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>{activity.time_start} - {activity.time_end} SGT</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="truncate">{activity.location}</span>
              </div>
              {activity.meeting_location && (
                <div className="flex items-center gap-2 ml-6">
                  <span className="text-xs">📍 Meet at: {activity.meeting_location}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <div className="flex flex-col">
                  <span>👥 Volunteers: {activity.volunteer_slots || 0}</span>
                  <span>🎯 Participants: {activity.participant_slots || 0}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex gap-2 border-t bg-slate-50/50">
              <Button variant="outline" className="flex-1 h-9" onClick={() => openEditModal(activity)}>
                <Edit2 className="w-3 h-3 mr-2" /> Edit
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDelete(activity.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Shadcn Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Activity" : "Create New Activity"}</DialogTitle>
            <DialogDescription>
              Fill in the details for the volunteer event here.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="grid gap-4 py-4">
            {/* ✅ NEW: Image URL Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right flex items-center justify-end gap-2">
                 <ImageIcon size={14} /> Image URL
              </Label>
              <Input 
                className="col-span-3"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
              />
            </div>
            {/* Show a preview if user entered a URL */}
            {formData.image && (
               <div className="grid grid-cols-4 items-center gap-4">
                 <div className="col-start-2 col-span-3">
                   <img src={formData.image} alt="Preview" className="h-24 w-full object-cover rounded-md border" />
                 </div>
               </div>
            )}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Title</Label>
              <Input 
                required 
                className="col-span-3" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <select 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.activity_type}
                onChange={e => setFormData({...formData, activity_type: e.target.value})}
              >
                <option value="Social">Social</option>
                <option value="Physical">Physical</option>
                <option value="Cultural">Cultural</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date</Label>
              <Input 
                type="date" 
                required 
                className="col-span-3"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Time (SGT)</Label>
              <div className="col-span-3 flex gap-2 items-center">
                <Input 
                  type="time" 
                  placeholder="Start"
                  className="flex-1"
                  value={formData.time_start}
                  onChange={e => setFormData({...formData, time_start: e.target.value})}
                />
                <span className="text-muted-foreground">to</span>
                <Input 
                  type="time" 
                  placeholder="End"
                  className="flex-1"
                  value={formData.time_end}
                  onChange={e => setFormData({...formData, time_end: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Location</Label>
              <Input 
                required 
                className="col-span-3"
                placeholder="e.g., Jurong Lake Gardens"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Meeting Venue</Label>
              <Input 
                className="col-span-3"
                placeholder="e.g., Main entrance carpark"
                value={formData.meeting_location}
                onChange={e => setFormData({...formData, meeting_location: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Volunteers</Label>
              <Input 
                type="number" 
                required 
                min="0"
                className="col-span-3"
                placeholder="Number of volunteers needed"
                value={formData.volunteer_slots}
                onChange={e => setFormData({...formData, volunteer_slots: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Participants</Label>
              <Input 
                type="number" 
                required 
                min="0"
                className="col-span-3"
                placeholder="Number of participants"
                value={formData.participant_slots}
                onChange={e => setFormData({...formData, participant_slots: e.target.value})}
              />
            </div>

             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Access</Label>
              <select 
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.disability_access}
                onChange={e => setFormData({...formData, disability_access: e.target.value})}
              >
                <option value="Universal">Universal (All Welcome)</option>
                <option value="Wheelchair Friendly">Wheelchair Friendly</option>
                <option value="Sensory Friendly">Sensory Friendly</option>
                <option value="Ambulant">Ambulant Only</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Notes</Label>
              <Textarea 
                className="col-span-3" 
                placeholder="Extra details..."
                value={formData.comments}
                onChange={e => setFormData({...formData, comments: e.target.value})}
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}