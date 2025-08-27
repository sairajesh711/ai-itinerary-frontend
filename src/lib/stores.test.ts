import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { itinerary, ui } from './stores';
import type { ItineraryResponse } from './types';

const mockItinerary: ItineraryResponse = {
  destination: 'Paris, France',
  start_date: '2024-06-01',
  end_date: '2024-06-05',
  total_days: 4,
  timezone: 'Europe/Paris',
  currency: 'EUR',
  travelers_count: 2,
  interests: ['food', 'art', 'history'],
  daily_plan: [
    {
      day_index: 1,
      date: '2024-06-01',
      summary: 'Explore central Paris',
      activities: [
        {
          title: 'Visit Louvre Museum',
          category: 'museum',
          start_time: '09:00:00',
          end_time: '12:00:00',
          place: {
            name: 'Louvre Museum',
            address: 'Rue de Rivoli, 75001 Paris, France'
          }
        }
      ],
      notes: []
    }
  ],
  meta: {
    schema_version: '1.0',
    generator: 'ai-itinerary-backend'
  }
};

describe('itinerary store', () => {
  beforeEach(() => {
    itinerary.set(null);
  });

  it('initializes with null value', () => {
    expect(get(itinerary)).toBeNull();
  });

  it('can set and get itinerary data', () => {
    itinerary.set(mockItinerary);
    expect(get(itinerary)).toEqual(mockItinerary);
  });

  it('can update itinerary data', () => {
    itinerary.set(mockItinerary);
    
    const updatedItinerary = {
      ...mockItinerary,
      destination: 'Rome, Italy'
    };
    
    itinerary.set(updatedItinerary);
    expect(get(itinerary)?.destination).toBe('Rome, Italy');
  });

  it('can clear itinerary data', () => {
    itinerary.set(mockItinerary);
    expect(get(itinerary)).not.toBeNull();
    
    itinerary.set(null);
    expect(get(itinerary)).toBeNull();
  });

  it('preserves complex nested data structures', () => {
    itinerary.set(mockItinerary);
    const retrieved = get(itinerary);
    
    expect(retrieved?.daily_plan[0].activities[0].place?.name).toBe('Louvre Museum');
    expect(retrieved?.meta.generator).toBe('ai-itinerary-backend');
  });
});

describe('ui store', () => {
  beforeEach(() => {
    ui.set({
      mode: 'timeline',
      selectedDay: 1,
      loading: false
    });
  });

  it('initializes with correct default values', () => {
    const state = get(ui);
    expect(state).toEqual({
      mode: 'timeline',
      selectedDay: 1,
      loading: false
    });
  });

  it('can toggle between timeline and map modes', () => {
    ui.update(state => ({ ...state, mode: 'map' }));
    expect(get(ui).mode).toBe('map');
    
    ui.update(state => ({ ...state, mode: 'timeline' }));
    expect(get(ui).mode).toBe('timeline');
  });

  it('can change selected day', () => {
    ui.update(state => ({ ...state, selectedDay: 3 }));
    expect(get(ui).selectedDay).toBe(3);
    
    ui.update(state => ({ ...state, selectedDay: 1 }));
    expect(get(ui).selectedDay).toBe(1);
  });

  it('can toggle loading state', () => {
    ui.update(state => ({ ...state, loading: true }));
    expect(get(ui).loading).toBe(true);
    
    ui.update(state => ({ ...state, loading: false }));
    expect(get(ui).loading).toBe(false);
  });

  it('can update multiple properties at once', () => {
    ui.update(state => ({
      ...state,
      mode: 'map',
      selectedDay: 5,
      loading: true
    }));
    
    const state = get(ui);
    expect(state).toEqual({
      mode: 'map',
      selectedDay: 5,
      loading: true
    });
  });

  it('maintains state consistency after multiple updates', () => {
    ui.update(state => ({ ...state, mode: 'map' }));
    ui.update(state => ({ ...state, selectedDay: 2 }));
    ui.update(state => ({ ...state, loading: true }));
    ui.update(state => ({ ...state, mode: 'timeline' }));
    
    const state = get(ui);
    expect(state).toEqual({
      mode: 'timeline',
      selectedDay: 2,
      loading: true
    });
  });
});