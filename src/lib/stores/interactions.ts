import { writable, derived } from 'svelte/store';
import type { CrossComponentInteraction } from '../types/ui';

// Store for managing cross-component interactions
export const interactions = writable<CrossComponentInteraction[]>([]);

// Store for component hover states
export const hoverStates = writable<Record<string, boolean>>({});

// Store for component expand states
export const expandStates = writable<Record<string, boolean>>({});

// Store for active/focused component
export const activeComponent = writable<string | null>(null);

// Derived store for getting interactions by component
export const interactionsByComponent = derived(interactions, ($interactions) => {
	const byComponent: Record<string, CrossComponentInteraction[]> = {};

	$interactions.forEach((interaction) => {
		if (!byComponent[interaction.targetComponent]) {
			byComponent[interaction.targetComponent] = [];
		}
		byComponent[interaction.targetComponent].push(interaction);
	});

	return byComponent;
});

// Interaction service functions
export class InteractionService {
	static triggerInteraction(
		sourceComponent: string,
		targetComponent: string,
		interactionType: 'hover' | 'click' | 'focus',
		data?: any
	) {
		interactions.update((current) => [
			...current.filter(
				(i) => !(i.sourceComponent === sourceComponent && i.targetComponent === targetComponent)
			),
			{
				sourceComponent,
				targetComponent,
				interactionType,
				data
			}
		]);

		// Auto-cleanup after animation duration
		setTimeout(() => {
			interactions.update((current) =>
				current.filter(
					(i) => !(i.sourceComponent === sourceComponent && i.targetComponent === targetComponent)
				)
			);
		}, 300);
	}

	static setHoverState(componentId: string, isHovered: boolean) {
		hoverStates.update((current) => ({
			...current,
			[componentId]: isHovered
		}));
	}

	static setExpandState(componentId: string, isExpanded: boolean) {
		expandStates.update((current) => ({
			...current,
			[componentId]: isExpanded
		}));
	}

	static setActiveComponent(componentId: string | null) {
		activeComponent.set(componentId);
	}

	// Helper to generate unique component IDs
	static generateComponentId(type: string, dayIndex: number, activityIndex?: number): string {
		if (activityIndex !== undefined) {
			return `${type}-day${dayIndex}-activity${activityIndex}`;
		}
		return `${type}-day${dayIndex}`;
	}
}
