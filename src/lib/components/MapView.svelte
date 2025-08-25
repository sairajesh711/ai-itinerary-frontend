<script lang="ts">
  import { onMount } from 'svelte'
  import type { DayPlan } from '$lib/types'
  export let day: DayPlan

  let mapDiv: HTMLDivElement

  onMount(async () => {
    const L = await import('leaflet')
    // @ts-ignore
    await import('leaflet/dist/leaflet.css')

    const coords = day.activities
      .map(a => a.place?.coordinates)
      .filter(Boolean) as {lat:number,lng:number}[]

    const center = coords[0] ?? { lat: 38.7223, lng: -9.1393 } // default Lisbon-ish
    const map = L.map(mapDiv, { zoomControl: true }).setView([center.lat, center.lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map)

    const markers: any[] = []
    coords.forEach((c, idx) => {
      const m = L.marker([c.lat, c.lng]).addTo(map)
      m.bindTooltip(String(idx + 1), { permanent: true, direction: 'top' })
      markers.push(m)
    })

    if (coords.length > 1) {
      const latlngs = coords.map(c => [c.lat, c.lng]) as [number,number][]
      L.polyline(latlngs, { weight: 3 }).addTo(map)
      const b = L.latLngBounds(latlngs)
      map.fitBounds(b, { padding: [30, 30] })
    }
  })
</script>

<div class="card p-0 overflow-hidden">
  <div bind:this={mapDiv} class="h-[420px] w-full"></div>
</div>
