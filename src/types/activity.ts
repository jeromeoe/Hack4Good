export type Activity = {
  id: number
  created_at: string
  title: string
  date: string
  location: string
  category: string
  image: string | null
  comments: string | null
  activity_type: string | null
  disability_access: string | null
  meeting_location: string | null
  time_start: string | null
  time_end: string | null
  volunteer_slots: number | null
  participant_slots: number | null

  // computed fields (not stored in db)
  participants_confirmed?: number
  volunteers_confirmed?: number
  participants_remaining?: number
  volunteers_remaining?: number
}
