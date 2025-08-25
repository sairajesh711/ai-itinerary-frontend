export interface Coordinates { lat: number; lng: number }
export interface Place {
  name: string
  address?: string | null
  coordinates?: Coordinates | null
  google_maps_url?: string | null
  website?: string | null
}
export type TravelMode = 'walk' | 'public_transit' | 'train' | 'bus' | 'car' | 'bike' | 'rideshare' | 'flight' | 'ferry'
export interface TravelLeg {
  mode: TravelMode
  distance_km?: number | null
  duration_minutes?: number | null
  from_place?: Place | null
  to_place?: Place | null
  notes?: string | null
}
export interface MoneyEstimate {
  currency: string
  amount_min?: number | null
  amount_max?: number | null
  notes?: string | null
}
export type Category =
  | 'sightseeing' | 'museum' | 'landmark' | 'food' | 'coffee' | 'bar'
  | 'nightlife' | 'shopping' | 'nature' | 'beach' | 'hike' | 'experience'
  | 'transport' | 'hotel' | 'break' | 'view'

export interface Activity {
  title: string
  category?: Category
  start_time?: string | null
  end_time?: string | null
  place?: Place | null
  description?: string | null
  booking?: unknown | null
  estimated_cost?: MoneyEstimate | null
  travel_from_prev?: TravelLeg | null
  tags?: string[]
  tips?: string[]
}

export interface WeatherSummary {
  summary?: string | null
  high_c?: number | null
  low_c?: number | null
  precip_chance?: number | null
}
export interface DayPlan {
  day_index: number
  date: string
  summary?: string | null
  weather?: WeatherSummary | null
  activities: Activity[]
  notes: string[]
}
export interface Logistics {
  arrival?: TravelLeg | null
  departure?: TravelLeg | null
  transit_tips: string[]
  safety_etiquette: string[]
  map_overview_url?: string | null
}
export interface Meta {
  schema_version: string
  generated_at_iso?: string | null
  generator: string
}
export interface ItineraryResponse {
  destination: string
  start_date: string
  end_date: string
  total_days: number
  timezone?: string | null
  currency: string
  travelers_count?: number | null
  interests: string[]
  daily_plan: DayPlan[]
  logistics?: Logistics | null
  meta: Meta
}
