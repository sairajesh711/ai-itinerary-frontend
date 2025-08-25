// src/lib/types.ts

export type MoneyEstimate = {
  currency: string;
  amount_min?: number | null;
  amount_max?: number | null;
  notes?: string | null;
};

export type Coordinates = { lat: number; lng: number };

export type Place = {
  name: string;
  address?: string | null;
  coordinates?: Coordinates | null;
  google_maps_url?: string | null;
  website?: string | null;
};

export type BookingInfo = {
  required?: boolean;
  recommended_timeframe?: string | null;
  url?: string | null;
  cost?: MoneyEstimate | null;
  confirmation_ref?: string | null;
};

export type TravelLeg = {
  mode:
    | 'walk'
    | 'public_transit'
    | 'train'
    | 'bus'
    | 'car'
    | 'bike'
    | 'rideshare'
    | 'flight'
    | 'ferry';
  distance_km?: number | null;
  duration_minutes?: number | null;
  from_place?: Place | null;
  to_place?: Place | null;
  notes?: string | null;
};

export type Activity = {
  title: string;
  category:
    | 'sightseeing' | 'museum' | 'landmark' | 'food' | 'coffee' | 'bar'
    | 'nightlife' | 'shopping' | 'nature' | 'beach' | 'hike' | 'experience'
    | 'transport' | 'hotel' | 'break';
  start_time?: string | null; // "HH:MM:SS"
  end_time?: string | null;
  place?: Place | null;
  description?: string | null;
  booking?: BookingInfo | null;
  estimated_cost?: MoneyEstimate | null;
  travel_from_prev?: TravelLeg | null;
  tags?: string[];
  tips?: string[];
};

export type WeatherSummary = {
  summary?: string | null;
  high_c?: number | null;
  low_c?: number | null;
  precip_chance?: number | null; // 0..1
};

export type DayPlan = {
  day_index: number;
  date: string; // YYYY-MM-DD
  summary?: string | null;
  weather?: WeatherSummary | null;
  activities: Activity[];
  notes: string[];
};

export type Logistics = {
  arrival?: TravelLeg | null;
  departure?: TravelLeg | null;
  transit_tips: string[];
  safety_etiquette: string[];
  map_overview_url?: string | null;
};

export type Meta = {
  schema_version: string;
  generated_at_iso?: string | null;
  generator: string;
};

export type ItineraryResponse = {
  destination: string;
  start_date: string;
  end_date: string;
  total_days: number;
  timezone?: string | null;
  currency: string;
  travelers_count?: number | null;
  interests: string[];
  daily_plan: DayPlan[];
  logistics?: Logistics | null;
  meta: Meta;
};

// What your form will submit. Keep minimal for now.
export type ItineraryRequest = {
  destination: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  interests?: string[];
  travelers_count?: number;
  budget_level?: 'shoestring' | 'moderate' | 'comfortable' | 'luxury';
  pace?: 'relaxed' | 'balanced' | 'packed';
  language?: 'en';
  preferred_transport?: Array<'walk' | 'public_transit' | 'car' | 'train' | 'bike' | 'rideshare'>;
  max_daily_budget?: number | null;
};
