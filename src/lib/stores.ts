// src/lib/stores.ts
import { writable } from 'svelte/store';
import type { ItineraryResponse } from './types';

export type UIMode = 'timeline' | 'map';

export const itinerary = writable<ItineraryResponse | null>(null);

export const ui = writable<{
  loading: boolean;
  mode: UIMode;
  selectedDay: number;
  error: string | null;
}>({
  loading: false,
  mode: 'timeline',
  selectedDay: 1,
  error: null
});
