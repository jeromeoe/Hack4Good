import * as React from "react";
import { supabase } from "../../../lib/supabase";
import type { Activity } from "../../../types/activity";
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
  activity: Activity;
  onUpdated: (activity: Activity) => void;
};

export default function EditActivityDialog({ activity, onUpdated }: Props) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<Activity>({
    ...activity,
    image: activity.image ?? DEFAULT_IMAGE,
  });

  React.useEffect(() => {
    if (open) setForm({ ...activity, image: activity.image ?? DEFAULT_IMAGE });
  }, [open, activity]);

  function setField<K extends keyof Activity>(key: K, value: Activity[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(null);
    setLoading(true);

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
    };

    const { data, error } = await supabase
      .from("activities")
      .update(payload)
      .eq("id", Number(activity.id))
      .select("*")
      .maybeSingle();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setError("update succeeded but no row was returned. check rls/policies.");
      setLoading(false);
      return;
    }

    onUpdated(data as Activity);
    setLoading(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>edit activity</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="grid gap-2">
            <Label htmlFor="title">title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">date *</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">category *</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">location *</Label>
            <Input
              id="location"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="time_start">time start</Label>
              <Input
                id="time_start"
                value={form.time_start ?? ""}
                onChange={(e) => setField("time_start", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time_end">time end</Label>
              <Input
                id="time_end"
                value={form.time_end ?? ""}
                onChange={(e) => setField("time_end", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="meeting_location">meeting location</Label>
            <Input
              id="meeting_location"
              value={form.meeting_location ?? ""}
              onChange={(e) => setField("meeting_location", e.target.value)}
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
                  setField("participant_slots", Number(e.target.value))
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
                onChange={(e) =>
                  setField("volunteer_slots", Number(e.target.value))
                }
                min={0}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">image url</Label>
            <Input
              id="image"
              value={form.image ?? ""}
              onChange={(e) => setField("image", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="comments">comments</Label>
            <Textarea
              id="comments"
              value={form.comments ?? ""}
              onChange={(e) => setField("comments", e.target.value)}
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
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "saving..." : "save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
