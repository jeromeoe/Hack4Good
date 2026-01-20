import * as React from "react";
import { supabase } from "../../../lib/supabase";
import type { Activity } from "../../../types/activity";
import type { ActivityCreateInput } from "./activitySchema";
import { DEFAULT_IMAGE } from "./activitySchema";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";

type Props = {
  onCreated: (activity: Activity) => void;
};

export default function CreateActivityDialog({ onCreated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<ActivityCreateInput>({
    title: "",
    date: "",
    location: "",
    category: "",
    image: DEFAULT_IMAGE,
    activity_type: "General",
    disability_access: "Universal",
    volunteer_slots: 0,
    participant_slots: 0,
  });

  function set<K extends keyof ActivityCreateInput>(
    key: K,
    value: ActivityCreateInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate() {
    setError(null);

    // basic required checks (db will enforce too)
    if (!form.title || !form.date || !form.location || !form.category) {
      setError("please fill in title, date, location, and category.");
      return;
    }

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      title: form.title,
      date: form.date,
      location: form.location,
      category: form.category,
      image: form.image || DEFAULT_IMAGE,
      comments: form.comments ?? null,
      activity_type: form.activity_type ?? "General",
      disability_access: form.disability_access ?? "Universal",
      meeting_location: form.meeting_location ?? null,
      time_start: form.time_start ?? null,
      time_end: form.time_end ?? null,
      volunteer_slots: form.volunteer_slots ?? 0,
      participant_slots: form.participant_slots ?? 0,
      created_by: user?.id ?? null,
    };

    const { data, error } = await supabase
      .from("activities")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    onCreated(data as Activity);
    setLoading(false);
    setOpen(false);

    // reset for next create
    setForm({
      title: "",
      date: "",
      location: "",
      category: "",
      image: DEFAULT_IMAGE,
      activity_type: "General",
      disability_access: "Universal",
      volunteer_slots: 0,
      participant_slots: 0,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>create activity</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>create activity</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="grid gap-2">
            <Label htmlFor="title">title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="painting workshop"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">date *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">category *</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="arts"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">location *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="minds hub"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="time_start">time start</Label>
              <Input
                id="time_start"
                value={form.time_start ?? ""}
                onChange={(e) => set("time_start", e.target.value)}
                placeholder="10:00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time_end">time end</Label>
              <Input
                id="time_end"
                value={form.time_end ?? ""}
                onChange={(e) => set("time_end", e.target.value)}
                placeholder="12:00"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting_location">meeting location</Label>
            <Input
              id="meeting_location"
              value={form.meeting_location ?? ""}
              onChange={(e) => set("meeting_location", e.target.value)}
              placeholder="lobby entrance"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="participant_slots">participant slots</Label>
              <Input
                id="participant_slots"
                type="number"
                value={String(form.participant_slots ?? 0)}
                onChange={(e) =>
                  set("participant_slots", Number(e.target.value))
                }
                min={0}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="volunteer_slots">volunteer slots</Label>
              <Input
                id="volunteer_slots"
                type="number"
                value={String(form.volunteer_slots ?? 0)}
                onChange={(e) => set("volunteer_slots", Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="activity_type">activity type</Label>
              <Input
                id="activity_type"
                value={form.activity_type ?? ""}
                onChange={(e) => set("activity_type", e.target.value)}
                placeholder="General"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="disability_access">disability access</Label>
              <Input
                id="disability_access"
                value={form.disability_access ?? ""}
                onChange={(e) => set("disability_access", e.target.value)}
                placeholder="Universal"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">image url</Label>
            <Input
              id="image"
              value={form.image ?? ""}
              onChange={(e) => set("image", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="comments">comments</Label>
            <Textarea
              id="comments"
              value={form.comments ?? ""}
              onChange={(e) => set("comments", e.target.value)}
              placeholder="any notes for staff/caregivers"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? "creating..." : "create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
