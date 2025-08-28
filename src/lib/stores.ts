// src/lib/stores.ts
import { writable } from 'svelte/store';
import type { ItineraryResponse } from './types';

export const itinerary = writable<ItineraryResponse | null>(null);

export const ui = writable({
	mode: 'timeline' as 'timeline' | 'map',
	selectedDay: 1,
	loading: false
});
