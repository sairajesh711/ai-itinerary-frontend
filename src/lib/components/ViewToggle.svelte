<script context="module" lang="ts">
  export type MapActivity = {
    title: string;
    start_time?: string | null;
    place?: {
      name?: string | null;
      coordinates?: { lat: number; lng: number } | null;
    } | null;
  };
</script>

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  export let activities: MapActivity[] = [];

  let mapEl: HTMLDivElement | null = null;
  let map: any = null;
  let L: any = null;
  let layer: any = null;
  let markers: any[] = [];

  // Build simple POIs from activities
  function toPoints() {
    return (activities || [])
      .map((a, i) => {
        const c = a.place?.coordinates;
        if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') return null;
        return {
          i: i + 1,
          title: a.title || 'Untitled',
          time: a.start_time || '',
          name: a.place?.name || '',
          lat: c.lat,
          lng: c.lng
        };
      })
      .filter(Boolean) as Array<{i:number; title:string; time:string; name:string; lat:number; lng:number}>;
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

<div bind:this={mapEl} class="map h-[60vh] w-full rounded-2xl border border-slate-200 shadow-sm overflow-hidden"></div>

<style>
  /* Desaturate tiles to “vintage” pencil vibe (markers remain crisp) */
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
