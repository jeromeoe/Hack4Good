export type Registration = {
  id: number
  created_at: string
  activity_id: number
  user_id: string
  user_type: "participant" | "volunteer"
  status: "confirmed" | "waitlist" | "cancelled"

  // joined fields (frontend only)
  activity_title?: string
  activity_date?: string
  activity_location?: string
}
