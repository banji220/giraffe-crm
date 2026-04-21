// Auto-generated types for Supabase tables.
// Updated for schema 007: houses absorb leads + customers.

export type KnockOutcome =
  | 'not_home'
  | 'not_interested'
  | 'hard_no'
  | 'have_a_guy'
  | 'tenant'
  | 'come_back'
  | 'quoted'
  | 'appointment_set'
  | 'closed_on_spot'

/** House status — TEXT column with CHECK constraint (not an enum) */
export type HouseStatus =
  | 'lead'
  | 'quoted'
  | 'customer'
  | 'dead'
  | 'avoid'

/** Knock type — broadened from door-only to multi-channel */
export type KnockType = 'door' | 'call' | 'text' | 'quote'

export type ServiceType =
  | 'exterior'
  | 'interior_exterior'
  | 'screens'
  | 'tracks'

export type JobStatus =
  | 'scheduled'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

// ── Core entities ─────────────────────────────────────────────────────

export interface House {
  id: string
  // Address
  street_number: string | null
  street_name: string | null
  unit: string | null
  city: string | null
  addr_state: string | null
  postal_code: string | null
  full_address: string | null
  geom: unknown // PostGIS geography — handled by server queries
  // Status (null = no interaction yet)
  status: HouseStatus | null
  dead_until: string | null
  dead_reason: KnockOutcome | null
  // Contact (absorbed from leads/customers)
  contact_name: string | null
  contact_phone: string | null
  contact_email: string | null
  // Tracking
  last_knock_at: string | null
  next_follow_up_at: string | null
  knock_count: number
  // Pricing
  quoted_price: number | null
  anchor_price: number | null
  window_count: number | null
  service_types: ServiceType[]
  // Lifetime (absorbed from customers)
  lifetime_value: number
  total_jobs: number
  reclean_due_at: string | null
  // Meta
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
  created_by: string
  assigned_to: string | null
}

export interface Knock {
  id: string
  house_id: string
  type: KnockType
  outcome: KnockOutcome
  note: string | null
  follow_up_at: string | null
  knocked_from: unknown | null
  created_at: string
  created_by: string
}

export interface Job {
  id: string
  house_id: string
  scheduled_at: string
  completed_at: string | null
  status: JobStatus
  price: number
  paid_amount: number | null
  payment_method: string | null
  service_types: ServiceType[]
  window_count: number | null
  notes: string | null
  created_at: string
  updated_at: string
  assigned_to: string | null
}

// ── Knock tracker types (ported from contribution-heatmap) ────────────

export interface DailyStats {
  id: string
  user_id: string
  date: string
  doors: number
  conversations: number
  leads: number
  appointments: number
  wins: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  daily_target: number
  weekly_target: number
  created_at: string
  updated_at: string
}

export interface AllowedPhone {
  id: string
  phone: string | null
  email: string | null
  label: string | null
  invited_by: string | null
  created_at: string
}

// ── Return type for get_houses_in_bbox RPC ────────────────────────────

export interface HouseBbox {
  id: string
  full_address: string | null
  street_number: string | null
  street_name: string | null
  city: string | null
  status: HouseStatus | null
  dead_until: string | null
  dead_reason: KnockOutcome | null
  notes: string | null
  lat: number
  lng: number
  contact_name: string | null
  contact_phone: string | null
  quoted_price: number | null
  last_knock_outcome: KnockOutcome | null
  last_knock_at: string | null
  next_follow_up_at: string | null
  knock_count: number
}

// ── Supabase client type helper ───────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      houses: {
        Row: House
        Insert: Partial<House> & { geom: unknown }
        Update: Partial<House>
      }
      knocks: {
        Row: Knock
        Insert: Pick<Knock, 'house_id' | 'outcome'> & Partial<Knock>
        Update: Partial<Knock>
      }
      jobs: {
        Row: Job
        Insert: Partial<Job> & { house_id: string; scheduled_at: string; price: number }
        Update: Partial<Job>
      }
      daily_stats: {
        Row: DailyStats
        Insert: Partial<DailyStats> & { user_id: string; date: string }
        Update: Partial<DailyStats>
      }
      user_settings: {
        Row: UserSettings
        Insert: Partial<UserSettings> & { user_id: string }
        Update: Partial<UserSettings>
      }
      allowed_phones: {
        Row: AllowedPhone
        Insert: Partial<AllowedPhone>
        Update: Partial<AllowedPhone>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_houses_in_bbox: {
        Args: {
          min_lng: number
          min_lat: number
          max_lng: number
          max_lat: number
          max_rows?: number
        }
        Returns: HouseBbox[]
      }
    }
    Enums: {
      knock_outcome: KnockOutcome
      service_type: ServiceType
      job_status: JobStatus
    }
  }
}
