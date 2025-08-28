// Animation constants
export const ANIMATIONS = {
	DURATIONS: {
		FAST: 150,
		NORMAL: 200,
		SLOW: 300,
		VERY_SLOW: 500
	},
	EASINGS: {
		SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
		BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
		EASE_OUT: 'ease-out',
		EASE_IN_OUT: 'ease-in-out'
	},
	STAGGER_DELAY: 50
} as const;

// Component styling constants
export const STYLES = {
	BORDER_RADIUS: {
		SMALL: '8px',
		MEDIUM: '12px',
		LARGE: '16px',
		XLARGE: '20px'
	},
	SHADOWS: {
		SUBTLE: '0 1px 3px rgba(0, 0, 0, 0.1)',
		MEDIUM: '0 4px 6px rgba(0, 0, 0, 0.1)',
		LARGE: '0 10px 15px rgba(0, 0, 0, 0.1)'
	},
	COLORS: {
		PRIMARY: '#0f172a',
		SECONDARY: '#64748b',
		ACCENT: '#334155',
		BACKGROUND: 'rgba(255, 255, 255, 0.9)',
		BORDER: 'rgba(15, 23, 42, 0.12)'
	}
} as const;

// Interaction constants
export const INTERACTIONS = {
	HOVER_SCALE: 1.02,
	CLICK_SCALE: 0.98,
	FOCUS_OUTLINE_WIDTH: '2px',
	DEBOUNCE_DELAY: 150
} as const;

// Typography constants
export const TYPOGRAPHY = {
	FONTS: {
		SERIF: '"Playfair Display", serif',
		HANDWRITING: '"Caveat", cursive',
		SANS: 'Inter, system-ui, sans-serif'
	},
	WEIGHTS: {
		NORMAL: 400,
		MEDIUM: 500,
		SEMIBOLD: 600
	}
} as const;
