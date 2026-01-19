// Supabase Database Types - YOUR EXACT SCHEMA
// activities.id = bigint
// profiles.id = uuid

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string  // UUID
          email: string
          full_name: string
          role: string  // 'participant' | 'volunteer' | 'staff'
          phone: string | null
          age: number | null
          disability: string | null
          caregiver_info: Json | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string  // UUID from auth
          email: string
          full_name: string
          role: string
          phone?: string | null
          age?: number | null
          disability?: string | null
          caregiver_info?: Json | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          phone?: string | null
          age?: number | null
          disability?: string | null
          caregiver_info?: Json | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: number  // BIGINT
          created_at: string
          title: string
          date: string
          location: string
          category: string
          spots: number
          image: string
          comments: string
          activity_type: string
          disability_access: string
          // New columns added by migration
          description: string
          start_time: string
          end_time: string
          meeting_point: string
          meals_provided: boolean
          capacity: number
          wheelchair_accessible: boolean
          visually_impaired_friendly: boolean
          hearing_impaired_friendly: boolean
          intellectual_disability_friendly: boolean
          autism_friendly: boolean
          suitable_disabilities: string[]
          updated_at: string
          created_by: string | null  // UUID
        }
        Insert: {
          id?: number  // Auto-generated
          created_at?: string
          title: string
          date: string
          location: string
          category: string
          spots: number
          image?: string
          comments?: string
          activity_type?: string
          disability_access?: string
          description?: string
          start_time?: string
          end_time?: string
          meeting_point?: string
          meals_provided?: boolean
          capacity?: number
          wheelchair_accessible?: boolean
          visually_impaired_friendly?: boolean
          hearing_impaired_friendly?: boolean
          intellectual_disability_friendly?: boolean
          autism_friendly?: boolean
          suitable_disabilities?: string[]
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          date?: string
          location?: string
          category?: string
          spots?: number
          image?: string
          comments?: string
          activity_type?: string
          disability_access?: string
          description?: string
          start_time?: string
          end_time?: string
          meeting_point?: string
          meals_provided?: boolean
          capacity?: number
          wheelchair_accessible?: boolean
          visually_impaired_friendly?: boolean
          hearing_impaired_friendly?: boolean
          intellectual_disability_friendly?: boolean
          autism_friendly?: boolean
          suitable_disabilities?: string[]
          updated_at?: string
          created_by?: string | null
        }
      }
      activity_registrations: {
        Row: {
          id: number  // BIGINT
          activity_id: number  // BIGINT -> activities
          participant_id: string  // UUID -> profiles
          status: 'registered' | 'waitlisted' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number  // Auto-generated
          activity_id: number
          participant_id: string  // UUID
          status?: 'registered' | 'waitlisted' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          activity_id?: number
          participant_id?: string
          status?: 'registered' | 'waitlisted' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for caregiver info
export interface CaregiverInfo {
  name: string
  email?: string
  phone?: string
}
