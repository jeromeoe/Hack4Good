export type ActivityCreateInput = {
  title: string
  date: string
  location: string
  category: string
  image?: string
  comments?: string
  activity_type?: string
  disability_access?: string
  meeting_location?: string
  time_start?: string
  time_end?: string
  volunteer_slots?: number
  participant_slots?: number
}

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&q=80&w=800"
