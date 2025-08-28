// UI-specific type definitions
export interface WeatherDisplayConfig {
	showIcon: boolean;
	showTemperature: boolean;
	showDescription: boolean;
	iconStyle: 'emoji' | 'svg' | 'text';
	temperatureUnit: 'celsius' | 'fahrenheit';
}

export interface AnimationConfig {
	duration: number;
	easing: string;
	delay?: number;
	staggerDelay?: number;
}

export interface ComponentState {
	isExpanded: boolean;
	isHovered: boolean;
	isVisible: boolean;
	animationState: 'idle' | 'animating' | 'complete';
}

export interface CrossComponentInteraction {
	sourceComponent: string;
	targetComponent: string;
	interactionType: 'hover' | 'click' | 'focus';
	data?: any;
}
