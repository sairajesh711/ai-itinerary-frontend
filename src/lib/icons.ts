import type { Category, TravelMode } from './types'

export function iconForCategory(cat?: Category) {
  switch (cat) {
    case 'food': return '🍽️'
    case 'coffee': return '☕'
    case 'bar': return '🍸'
    case 'nightlife': return '🎶'
    case 'museum': return '🏛️'
    case 'landmark': return '🏰'
    case 'shopping': return '🛍️'
    case 'nature': return '🌿'
    case 'beach': return '🏖️'
    case 'hike': return '🥾'
    case 'experience': return '⭐'
    case 'hotel': return '🏨'
    case 'transport': return '🧭'
    case 'view': return '🌇'
    default: return '📍'
  }
}

export function iconForMode(mode?: TravelMode) {
  switch (mode) {
    case 'walk': return '🚶'
    case 'public_transit': return '🚌'
    case 'bus': return '🚌'
    case 'train': return '🚆'
    case 'car': return '🚗'
    case 'bike': return '🚲'
    case 'rideshare': return '🚕'
    case 'flight': return '✈️'
    case 'ferry': return '⛴️'
    default: return '➡️'
  }
}
