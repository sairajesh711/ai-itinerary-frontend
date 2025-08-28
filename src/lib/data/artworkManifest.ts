export type ArtRecord = {
	file: string;
	tags: string[];
	region?:
		| 'europe'
		| 'africa'
		| 'asia'
		| 'north-america'
		| 'south-america'
		| 'oceania'
		| 'middle-east';
	weight?: number;
};

export const ART_MANIFEST: ArtRecord[] = [
	// Europe
	{
		file: 'paris.webp',
		tags: ['paris', 'france', 'eiffel', 'ile-de-france'],
		region: 'europe',
		weight: 2
	},
	{
		file: 'london.webp',
		tags: ['london', 'uk', 'united kingdom', 'england', 'gb'],
		region: 'europe',
		weight: 2
	},
	{
		file: 'italy.webp',
		tags: ['italy', 'rome', 'milano', 'milan', 'venice', 'florence', 'italia'],
		region: 'europe'
	},
	{
		file: 'spain.webp',
		tags: [
			'spain',
			'madrid',
			'barcelona',
			'sevilla',
			'seville',
			'valencia',
			'iberia',
			'portugal',
			'lisbon',
			'lisboa'
		],
		region: 'europe'
	},
	{ file: 'greece.webp', tags: ['greece', 'athens', 'santorini', 'crete'], region: 'europe' },
	{
		file: 'eastern-europe-kazakh.webp',
		tags: ['eastern europe', 'kazakh', 'kazakhstan', 'almaty', 'astana'],
		region: 'asia'
	},

	// Africa & Middle East
	{
		file: 'africa.webp',
		tags: [
			'africa',
			'south africa',
			'sa',
			'durban',
			'cape town',
			'johannesburg',
			'joburg',
			'nairobi',
			'kenya'
		],
		region: 'africa',
		weight: 2
	},
	{ file: 'ethiopia.webp', tags: ['ethiopia', 'addis ababa', 'lalibela'], region: 'africa' },
	{
		file: 'middle-east.webp',
		tags: ['middle east', 'uae', 'dubai', 'abu dhabi', 'qatar', 'doha', 'oman', 'saudi', 'riyadh'],
		region: 'middle-east'
	},
	{ file: 'taj.webp', tags: ['taj', 'taj mahal', 'agra', 'india', 'delhi'], region: 'asia' },

	// Asia
	{ file: 'china.webp', tags: ['china', 'beijing', 'shanghai', 'great wall'], region: 'asia' },
	{
		file: 'japan.webp',
		tags: ['japan', 'tokyo', 'kyoto', 'osaka', 'jp'],
		region: 'asia',
		weight: 2
	},
	{
		file: 'southeast.webp',
		tags: [
			'southeast',
			'southeast asia',
			'thailand',
			'bangkok',
			'vietnam',
			'hanoi',
			'saigon',
			'hochiminh',
			'singapore',
			'bali',
			'indonesia',
			'phuket'
		],
		region: 'asia'
	},
	{
		file: 'india.webp',
		tags: ['india', 'delhi', 'mumbai', 'jaipur', 'varanasi', 'goa'],
		region: 'asia'
	},

	// Oceania
	{
		file: 'australia.webp',
		tags: ['australia', 'sydney', 'melbourne', 'brisbane', 'au'],
		region: 'oceania'
	},

	// Americas
	{
		file: 'nyc.webp',
		tags: ['nyc', 'new york', 'new york city', 'manhattan', 'usa', 'us'],
		region: 'north-america',
		weight: 2
	},
	{
		file: 'mexico.webp',
		tags: ['mexico', 'mexico city', 'cdmx', 'cancun', 'tulum'],
		region: 'north-america'
	},
	{
		file: 'brazil.webp',
		tags: ['brazil', 'rio', 'rio de janeiro', 'sao paulo'],
		region: 'south-america'
	},
	{
		file: 'peru-chile-argentina.webp',
		tags: ['peru', 'chile', 'argentina', 'patagonia', 'cusco', 'santiago', 'buenos aires'],
		region: 'south-america'
	},

	// Default
	{ file: 'default.webp', tags: ['default', 'world', 'travel', 'globe'] }
];
