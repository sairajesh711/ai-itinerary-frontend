<script lang="ts">
  import type { ItineraryResponse, DayPlan } from '$lib/types'
  import DaySection from '$lib/components/DaySection.svelte'
  import MapView from '$lib/components/MapView.svelte'
  import ViewToggle from '$lib/components/ViewToggle.svelte'

  // TEMP: sample. Replace with a real fetch to your backend.
  const sample: ItineraryResponse = {
    destination: 'Lisbon',
    start_date: '2025-10-05',
    end_date: '2025-10-06',
    total_days: 2,
    timezone: 'Europe/Lisbon',
    currency: 'EUR',
    travelers_count: 1,
    interests: ['nightlife'],
    daily_plan: [
      {
        day_index: 1,
        date: '2025-10-05',
        summary: 'Exploring Lisbon’s neighborhoods and nightlife.',
        weather: null,
        activities: [
          {
            title: 'Belém Tower',
            category: 'landmark',
            start_time: '09:00:00',
            end_time: '10:30:00',
            place: {
              name: 'Belém Tower',
              coordinates: { lat: 38.6915, lng: -9.2159 },
            },
            estimated_cost: { currency:'EUR', amount_min:6, amount_max:10 },
            travel_from_prev: null,
            tags: ['historic']
          },
          {
            title: 'Pastéis de Belém (Lunch)',
            category: 'food',
            start_time: '11:00:00',
            end_time: '12:30:00',
            place: { name: 'Pastéis de Belém', coordinates: { lat: 38.6972, lng: -9.2035 } },
            estimated_cost: { currency:'EUR', amount_min:5, amount_max:15 },
            travel_from_prev: { mode:'walk', duration_minutes:15, distance_km:1 }
          },
          {
            title: 'Bairro Alto Nightlife',
            category: 'nightlife',
            start_time: '20:00:00',
            end_time: '23:00:00',
            place: { name: 'Bairro Alto', coordinates: { lat: 38.7139, lng: -9.1449 } },
            estimated_cost: { currency:'EUR', amount_min:20, amount_max:40 },
            travel_from_prev: { mode:'public_transit', duration_minutes:20, distance_km:3 }
          }
        ],
        notes: ['Budget summary: EUR 31–65 vs cap EUR 100 — UNDER.']
      }
    ],
    logistics: null,
    meta: { schema_version: '1.0.0', generator: 'ui-prototype' }
  }

  let mode: 'timeline' | 'map' = 'timeline'
  const day: DayPlan = sample.daily_plan[0]
  function setMode(m:'timeline'|'map'){ mode = m }
</script>

<div class="mx-auto max-w-3xl px-4 py-6 sm:py-10">
  <header class="mb-6 sm:mb-8">
    <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight">
      {sample.destination} • {sample.start_date} → {sample.end_date}
    </h1>
    <p class="text-sm text-[var(--muted)] mt-1">
      {sample.total_days} day itinerary • {sample.currency}
    </p>
  </header>

  <div class="mb-4">
    <ViewToggle {mode} {setMode} />
  </div>

  {#if mode === 'timeline'}
    <DaySection {day} />
  {:else}
    <MapView {day} />
  {/if}
</div>
