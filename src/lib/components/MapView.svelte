<script context="module" lang="ts">
  export type MapActivity = {
    title: string;
    start_time?: string | null;
    place?: {
      name?: string | null;
      coordinates?: { lat: number; lng: number } | null;
    } | null;
    category?: string;
    estimated_cost?: number;
  };
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { ui } from '$lib/stores';
  import { InteractionService } from '$lib/stores/interactions';
  import type { DayPlan } from '$lib/types';
  import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';
  import { DateFormatter, MoneyFormatter } from '$lib/utils/formatters';

  export let dayPlan: DayPlan;
  export let totalDays: number = 1;
  
  const dispatch = createEventDispatcher();
  
  $: activities = dayPlan?.activities || [];
  
  function previousDay() {
    if ($ui.selectedDay > 1) {
      ui.update(state => ({ ...state, selectedDay: state.selectedDay - 1 }));
    }
  }
  
  function nextDay() {
    if ($ui.selectedDay < totalDays) {
      ui.update(state => ({ ...state, selectedDay: state.selectedDay + 1 }));
    }
  }

  // Enhanced state management
  let mapEl: HTMLDivElement | null = null;
  let map: any = null;
  let L: any = null;
  let layer: any = null;
  let markers: any[] = [];
  let routePath: any = null;
  let hoveredActivity: number | null = null;
  let selectedActivity: number | null = null;

  // Enhanced POI building with more activity data
  function toPoints() {
    return (activities || [])
      .map((a, i) => {
        const c = a.place?.coordinates;
        if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') return null;
        
        const componentId = InteractionService.generateComponentId('activity', dayPlan.day_index, i);
        const mapPinId = InteractionService.generateComponentId('map-pin', dayPlan.day_index, i);
        
        return {
          activityIndex: i,
          componentId,
          mapPinId,
          title: a.title || 'Untitled',
          time: a.start_time || '',
          name: a.place?.name || '',
          category: a.category || 'general',
          cost: a.estimated_cost || null,
          lat: c.lat,
          lng: c.lng,
          activity: a
        };
      })
      .filter(Boolean);
  }

  function clearMarkers() {
    markers.forEach((m) => m.remove());
    markers = [];
  }

  function fitBounds(points: ReturnType<typeof toPoints>) {
    if (!map || !points.length) return;
    const bounds = (L as any).latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.25));
  }

  function renderMarkers() {
    if (!map || !L) return;
    clearMarkers();
    const points = toPoints();
    if (!points.length) {
      // Fallback view (Lisbon-ish) so the map never looks broken
      map.setView([38.72, -9.14], 12);
      return;
    }

    points.forEach((p) => {
      const html = `
        <div class="pin">
          <span class="num">${p.i}</span>
        </div>
      `;
      const icon = (L as any).divIcon({
        className: 'pin-wrap',
        html,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const m = (L as any)
        .marker([p.lat, p.lng], { icon })
        .addTo(map)
        .bindPopup(
          `<div class="popup">
            <div class="popup-title">${p.title}</div>
            ${p.time ? `<div class="popup-sub">${p.time}</div>` : ''}
            ${p.name ? `<div class="popup-sub">${p.name}</div>` : ''}
          </div>`
        );

      markers.push(m);
    });

    fitBounds(points);
  }

  function handleResize() {
    if (map) map.invalidateSize();
  }

  onMount(async () => {
    const leaflet = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    L = leaflet.default;

    map = L.map(mapEl!, {
      zoomControl: false,
      attributionControl: true
    });

    // Free, no-key OSM tiles (we desaturate via CSS below)
    layer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    layer.addTo(map);

    // Minimal zoom UI, styled monochrome in CSS
    L.control.zoom({ position: 'topright' }).addTo(map);

    renderMarkers();
    window.addEventListener('resize', handleResize);
  });

  // Re-render markers when activities change
  $: if (map) renderMarkers();

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
    if (map) map.remove();
  });
</script>

<div class="map-container">
  <div bind:this={mapEl} class="map h-[60vh] w-full rounded-2xl border border-slate-200 shadow-sm overflow-hidden"></div>
  
  <!-- Day Navigation Overlay -->
  <div class="day-nav" role="navigation" aria-label="Day navigation">
    <button 
      type="button"
      class="nav-btn prev" 
      disabled={$ui.selectedDay <= 1}
      on:click={previousDay}
      aria-label="Previous day"
    >
      <svg viewBox="0 0 16 16" class="nav-icon">
        <path d="M10 4l-4 4 4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div class="day-display">
      <div class="day-title">{dayPlan?.summary || `Day ${$ui.selectedDay}`}</div>
      <div class="day-meta">{$ui.selectedDay} of {totalDays}</div>
    </div>
    
    <button 
      type="button"
      class="nav-btn next" 
      disabled={$ui.selectedDay >= totalDays}
      on:click={nextDay}
      aria-label="Next day"
    >
      <svg viewBox="0 0 16 16" class="nav-icon">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</div>

<style>
  .map-container {
    position: relative;
  }
  
  .day-nav {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1.5px solid rgba(15, 23, 42, 0.12);
    border-radius: 20px;
    padding: 8px 16px;
    box-shadow: 
      0 4px 12px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    z-index: 1000;
  }
  
  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .nav-btn:hover:not(:disabled) {
    background: rgba(15, 23, 42, 0.06);
    color: #334155;
  }
  
  .nav-btn:focus-visible {
    outline: 2px solid #0f172a;
    outline-offset: 2px;
  }
  
  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  .nav-icon {
    width: 16px;
    height: 16px;
  }
  
  .day-display {
    text-align: center;
    min-width: 120px;
  }
  
  .day-title {
    font-family: inherit;
    font-weight: 600;
    font-size: 0.875rem;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 2px;
  }
  
  .day-meta {
    font-size: 0.75rem;
    color: #64748b;
    font-weight: 500;
  }
  
  /* Journal texture on navigation */
  .day-nav::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(15, 23, 42, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(15, 23, 42, 0.02) 1px, transparent 1px);
    background-size: 16px 16px, 20px 20px;
    opacity: 0.6;
  }
  
  /* Desaturate tiles to "vintage" pencil vibe (markers remain crisp) */
  .map :global(.leaflet-tile) {
    filter: grayscale(100%) contrast(90%) brightness(105%);
  }
  /* Zoom control monochrome */
  .map :global(.leaflet-control-zoom a) {
    background: #0f172a; /* slate-900 */
    color: #fff;
    border: 1px solid #0f172a;
    box-shadow: none;
  }
  .map :global(.leaflet-control-zoom a:hover) {
    background: #111827;
  }
  /* Popup styling */
  .map :global(.leaflet-popup-content-wrapper) {
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.16);
    box-shadow: 0 10px 22px rgba(15,23,42,.08);
  }
  .map :global(.leaflet-popup-tip) {
    background: #fff;
    border: 1px solid rgba(15,23,42,.16);
  }
  .popup { font-family: Inter, system-ui, sans-serif; color: #0f172a; }
  .popup-title { font-weight: 600; font-size: 0.95rem; line-height: 1.2; }
  .popup-sub { font-size: 0.8rem; color: #64748b; margin-top: 2px; }

  /* Monochrome “pushpin” marker (divIcon) */
  .pin-wrap { filter: drop-shadow(0 2px 4px rgba(15,23,42,.22)); }
  .pin {
    width: 28px; height: 28px;
    border-radius: 999px;
    background: #0f172a; /* ink */
    position: relative;
    outline: 1.5px solid rgba(255,255,255,.85);
    box-shadow:
      inset 0 0 0 1px rgba(255,255,255,.2),
      0 10px 14px rgba(15,23,42,.12);
  }
  .pin::after {
    /* needle shadow */
    content: '';
    position: absolute;
    left: 13px; bottom: -8px;
    width: 2px; height: 10px;
    background: linear-gradient(#0f172a,#0f172a);
    opacity: .85;
  }
  .num {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    color: white;
    font-family: Roboto, Inter, sans-serif;
    font-weight: 600; font-size: .8rem;
  }
</style>
