import type { ItineraryResponse } from './types'
const BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export async function generateItinerary(payload: any): Promise<ItineraryResponse> {
  const r = await fetch(`${BASE}/generate_itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!r.ok) throw new Error(`Backend error: ${r.status}`)
  return await r.json()
}
