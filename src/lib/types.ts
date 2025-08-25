// src/lib/types.ts

// ---------- Shared atoms ----------
export type CurrencyCode = string; // e.g. "EUR" | "GBP"
export type BudgetLevel = 'shoestring' | 'moderate' | 'comfortable' | 'luxury';
export type Pace = 'relaxed' | 'balanced' | 'packed';
export type TransportPref = 'walk' | 'public_transit' | 'car' | 'train' | 'bike' | 'rideshare';

export interface MoneyEstimate {
  currency: CurrencyCode;
  amount_min?: number | null;
  amount_max?: number | null;
  notes?: string | null;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  name: string;
  address?: string | null;
  coordinates?: Coordinates | null;
  google_maps_url?: string | null;
  website?: string | null;
}

export interface BookingInfo {
  required: boolean;
  recommended_timeframe?: string | null;
  url?: string | null;
  cost?: MoneyEstimate | null;
  confirmation_ref?: string | null;
}

export type TravelMode =
  | 'walk'
  | 'public_transit'
  | 'train'
  | 'bus'
  | 'car'
  | 'bike'
  | 'rideshare'
  | 'flight'
  | 'ferry';

export interface TravelLeg {
  mode: TravelMode;
  distance_km?: number | null;
  duration_minutes?: number | null;
  from_place?: Place | null;
  to_place?: Place | null;
  notes?: string | null;
}

// ---------- Request model ----------
export interface ItineraryRequest {
  destination: string;
  start_date: string;      // ISO (YYYY-MM-DD)
  end_date?: string;       // ISO (YYYY-MM-DD)
  duration_days?: number;  // use if end_date not provided

  interests: string[];
  travelers_count?: number | null;
  budget_level: BudgetLevel;
  pace: Pace;
  language: 'en';
  preferred_transport: TransportPref[];

  // Optional budget hard-cap per day (itinerary currency)
  max_daily_budget?: number | null;
}

// ---------- Response model ----------
export interface WeatherSummary {
  summary?: string | null;
  high_c?: number | null;
  low_c?: number | null;
  precip_chance?: number | null;
}

export type ActivityCategory =
  | 'sightseeing' | 'museum' | 'landmark' | 'food' | 'coffee' | 'bar'
  | 'nightlife' | 'shopping' | 'nature' | 'beach' | 'hike' | 'experience'
  | 'transport' | 'hotel' | 'break';

export interface Activity {
  title: string;
  category: ActivityCategory;
  start_time?: string | null; // HH:MM:SS
  end_time?: string | null;   // HH:MM:SS
  place?: Place | null;
  description?: string | null;
  booking?: BookingInfo | null;

  // canonical field we expect from backend now
  estimated_cost?: MoneyEstimate | null; // (backend may also send "cost" -> we normalize)

  travel_from_prev?: TravelLeg | null;
  tags?: string[]; // normalize [] if null
  tips?: string[]; // normalize [] if null
}

export interface DayPlan {
  day_index: number;
  date: string; // ISO (YYYY-MM-DD)
  summary?: string | null;
  weather?: WeatherSummary | null;
  activities: Activity[]; // normalize [] if null
  notes: string[];        // normalize [] if null
}

export interface Logistics {
  arrival?: TravelLeg | null;
  departure?: TravelLeg | null;
  transit_tips: string[];      // normalize []
  safety_etiquette: string[];  // normalize []
  map_overview_url?: string | null;
}

export interface Meta {
  schema_version: string;
  generated_at_iso?: string | null;
  generator: string;
}

export interface ItineraryResponse {
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  timezone?: string | null;
  currency: CurrencyCode;

  travelers_count?: number | null;
  interests: string[];

  daily_plan: DayPlan[];
  logistics?: Logistics | null;
  meta: Meta;
}
