import * as React from "react";
import { supabase } from "../../../lib/supabase";
import { Button } from "../../../components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog";
import type { Activity } from "../../../types/activity";

type Props = {
  activity: Activity;
  onDeleted: (id: number) => void;
};

export default function DeleteActivityButton({ activity, onDeleted }: Props) {
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    setLoading(true);

    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", activity.id);

    setLoading(false);

    if (!error) onDeleted(activity.id);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>delete activity?</AlertDialogTitle>
          <AlertDialogDescription>
            this will permanently delete “{activity.title}”.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? "deleting..." : "delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
