// Auto-generated types for Supabase tables.
// In a future step we can run `supabase gen types typescript` to get exact types.
// For now, these match schema.sql exactly.

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

export type HouseState =
  | 'unknocked'
  | 'cold'
  | 'working'
  | 'customer'
  | 'dead'
  | 'avoid'

export type LeadState =
  | 'new'
  | 'quoted'
  | 'won'
  | 'lost'
  | 'nurture'

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

export interface House {
  id: string
  street_number: string | null
  street_name: string | null
  unit: string | null
  city: string | null
  addr_state: string | null
  postal_code: string | null
  full_address: string | null
  geom: unknown // PostGIS geography — handled by server queries
  state: HouseState
  is_avoid: boolean
  avoid_reason: string | null
  dead_until: string | null
  dead_reason: KnockOutcome | null
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
  outcome: KnockOutcome
  note: string | null
  follow_up_at: string | null
  knocked_from: unknown | null
  created_at: string
  created_by: string
}

export interface Lead {
  id: string
  house_id: string
  full_name: string | null
  phone: string | null
  email: string | null
  state: LeadState
  window_count: number | null
  service_types: ServiceType[]
  base_price: number | null
  anchor_price: number | null
  discount_type: string | null
  discount_value: number | null
  discount_code: string | null
  final_price: number | null
  next_touch_at: string | null
  last_touch_at: string | null
  touch_count: number
  nurture_wake_at: string | null
  source_knock_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string
  assigned_to: string | null
}

export interface Customer {
  id: string
  house_id: string
  source_lead_id: string | null
  full_name: string
  phone: string | null
  email: string | null
  first_job_at: string | null
  last_job_at: string | null
  total_jobs: number
  lifetime_value: number
  reclean_due_at: string | null
  review_requested_at: string | null
  review_left_at: string | null
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  house_id: string
  lead_id: string | null
  customer_id: string | null
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

// Supabase client type helper
export interface Database {
  public: {
    Tables: {
      houses: { Row: House; Insert: Partial<House> & { geom: unknown }; Update: Partial<House> }
      knocks: { Row: Knock; Insert: Pick<Knock, 'house_id' | 'outcome'> & Partial<Knock>; Update: Partial<Knock> }
      leads: { Row: Lead; Insert: Partial<Lead> & { house_id: string }; Update: Partial<Lead> }
      customers: { Row: Customer; Insert: Partial<Customer> & { house_id: string; full_name: string }; Update: Partial<Customer> }
      jobs: { Row: Job; Insert: Partial<Job> & { house_id: string; scheduled_at: string; price: number }; Update: Partial<Job> }
    }
    Views: {
      v_followups_due: { Row: any }
      v_quotes_expiring: { Row: any }
      v_week_booked: { Row: any }
    }
    Functions: Record<string, never>
    Enums: {
      knock_outcome: KnockOutcome
      house_state: HouseState
      lead_state: LeadState
      service_type: ServiceType
      job_status: JobStatus
    }
  }
}
