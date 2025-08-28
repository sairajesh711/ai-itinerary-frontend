// src/lib/artwork.ts
export type ArtMeta = {
	src: string; // public path (static/)
	nudgeVw?: number; // shift image horizontally; negative pushes a bit off-screen right
	opacity?: number; // default opacity
};

const ART: Record<string, ArtMeta> = {
	default: { src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 },
	africa: { src: '/art/africa.webp', opacity: 0.14, nudgeVw: -4 },
	australia: { src: '/art/australia.webp', opacity: 0.14, nudgeVw: -4 },
	brazil: { src: '/art/brazil.webp', opacity: 0.14, nudgeVw: -6 },
	'central-asia': { src: '/art/central-asia.webp', opacity: 0.14, nudgeVw: -3 },
	china: { src: '/art/china.webp', opacity: 0.14, nudgeVw: -3 },
	'eastern-europe': { src: '/art/eastern-europe.webp', opacity: 0.14, nudgeVw: -3 },
	greece: { src: '/art/greece.webp', opacity: 0.14, nudgeVw: -2 },
	india: { src: '/art/india.webp', opacity: 0.14, nudgeVw: -5 },
	italy: { src: '/art/italy.webp', opacity: 0.14, nudgeVw: -3 },
	japan: { src: '/art/japan.webp', opacity: 0.14, nudgeVw: -2 },
	london: { src: '/art/london.webp', opacity: 0.14, nudgeVw: -2 },
	'uk-london': { src: '/art/uk_london.webp', opacity: 0.14, nudgeVw: -2 },
	mexico: { src: '/art/mexico.webp', opacity: 0.14, nudgeVw: -3 },
	'middle-east': { src: '/art/middle-east.webp', opacity: 0.14, nudgeVw: -4 },
	nyc: { src: '/art/nyc.webp', opacity: 0.14, nudgeVw: -2 },
	paris: { src: '/art/paris.webp', opacity: 0.14, nudgeVw: 0 },
	'peru-chile-argentina': { src: '/art/peru-chile-argentina.webp', opacity: 0.14, nudgeVw: -3 },
	southeast: { src: '/art/southeast.webp', opacity: 0.14, nudgeVw: -3 },
	spain: { src: '/art/spain.webp', opacity: 0.14, nudgeVw: -2 },
	taj: { src: '/art/taj.webp', opacity: 0.14, nudgeVw: -5 }
};

const ALIAS: Record<string, keyof typeof ART> = {
	// Western Europe
	paris: 'paris',
	france: 'paris',
	lyon: 'paris',
	nice: 'paris',
	london: 'london',
	uk: 'uk-london',
	'united kingdom': 'uk-london',
	england: 'uk-london',
	madrid: 'spain',
	barcelona: 'spain',
	sevilla: 'spain',
	spain: 'spain',
	rome: 'italy',
	milan: 'italy',
	venice: 'italy',
	florence: 'italy',
	italy: 'italy',
	lisbon: 'spain',
	portugal: 'spain',
	porto: 'spain',

	// Eastern Europe
	prague: 'eastern-europe',
	czech: 'eastern-europe',
	'czech republic': 'eastern-europe',
	budapest: 'eastern-europe',
	hungary: 'eastern-europe',
	warsaw: 'eastern-europe',
	krakow: 'eastern-europe',
	poland: 'eastern-europe',

	// Americas
	rio: 'brazil',
	brazil: 'brazil',
	'rio de janeiro': 'brazil',
	nyc: 'nyc',
	'new york': 'nyc',
	'new york city': 'nyc',
	mexico: 'mexico',
	cancun: 'mexico',
	cdmx: 'mexico',
	peru: 'peru-chile-argentina',
	chile: 'peru-chile-argentina',
	argentina: 'peru-chile-argentina',
	lima: 'peru-chile-argentina',
	santiago: 'peru-chile-argentina',
	buenos: 'peru-chile-argentina',

	// Africa
	africa: 'africa',
	durban: 'africa',
	'cape town': 'africa',
	nairobi: 'africa',

	// Middle East
	dubai: 'middle-east',
	uae: 'middle-east',
	israel: 'middle-east',
	jordan: 'middle-east',
	'saudi arabia': 'middle-east',

	// Asia
	japan: 'japan',
	tokyo: 'japan',
	kyoto: 'japan',
	osaka: 'japan',
	china: 'china',
	beijing: 'china',
	shanghai: 'china',
	india: 'india',
	delhi: 'india',
	mumbai: 'india',
	agra: 'taj',
	taj: 'taj',
	'central asia': 'central-asia',
	kazakhstan: 'central-asia',
	uzbekistan: 'central-asia',
	'south east': 'southeast',
	'southeast asia': 'southeast',
	thailand: 'southeast',
	vietnam: 'southeast',
	singapore: 'southeast',
	indonesia: 'southeast',

	// Oceania
	australia: 'australia',
	sydney: 'australia',
	melbourne: 'australia'
};

export function resolveArtwork(query: string | undefined | null): ArtMeta {
	const key = (query || '').trim().toLowerCase();
	if (!key) return ART.default;

	for (const k in ALIAS) {
		if (key.includes(k)) return ART[ALIAS[k]];
	}
	if (key.includes('europe')) return ART['eastern-europe'];
	if (key.includes('america') || key.includes('usa')) return ART.nyc;
	if (key.includes('middle east') || key.includes('gulf') || key.includes('arab'))
		return ART['middle-east'];
	return ART.default;
}
