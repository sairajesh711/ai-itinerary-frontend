<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import DateDisplay from './DateDisplay.svelte';
	import WeatherDisplay from './WeatherDisplay.svelte';
	import { InteractionService } from '$lib/stores/interactions';
	import type { DayPlan } from '$lib/types';
	import { ANIMATIONS } from '$lib/utils/constants';

	export let day: DayPlan;
	export let isSelected = false;
	export let animated = true;
	export let interactive = true;

	const dispatch = createEventDispatcher();

	// Generate unique component ID for cross-component interactions
	$: componentId = InteractionService.generateComponentId('day-header', day.day_index);

	function handleClick() {
		if (interactive) {
			dispatch('select', { dayIndex: day.day_index });
			InteractionService.setActiveComponent(componentId);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (interactive && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			handleClick();
		}
	}

	function handleMouseEnter() {
		if (interactive) {
			InteractionService.setHoverState(componentId, true);
			// Trigger cross-component interaction for map sync
			InteractionService.triggerInteraction(componentId, `map-pin-day${day.day_index}`, 'hover', {
				dayIndex: day.day_index
			});
		}
	}

	function handleMouseLeave() {
		if (interactive) {
			InteractionService.setHoverState(componentId, false);
		}
	}
</script>

<header
	class="day-header {isSelected ? 'selected' : ''} {interactive ? 'interactive' : ''}"
	class:animated
	on:click={handleClick}
	on:keydown={handleKeydown}
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	tabindex={interactive ? 0 : undefined}
	role={interactive ? 'button' : undefined}
	aria-label={interactive ? `Select day ${day.day_index}` : undefined}
	aria-pressed={interactive ? isSelected : undefined}
	in:fade={{ duration: ANIMATIONS.DURATIONS.NORMAL }}
>
	<div class="header-content">
		<div class="main-info">
			<DateDisplay date={day.date} dayIndex={day.day_index} summary={day.summary} {animated} />
		</div>

		{#if day.weather}
			<div class="weather-section">
				<WeatherDisplay weather={day.weather} {animated} compact={false} />
			</div>
		{/if}
	</div>

	<!-- Selection indicator -->
	{#if isSelected}
		<div class="selection-indicator" in:fade={{ duration: ANIMATIONS.DURATIONS.FAST }}></div>
	{/if}

	<!-- Interaction ripple effect -->
	<div class="ripple-effect"></div>
</header>

<style>
	.day-header {
		position: relative;
		padding: 16px;
		margin: -8px;
		border-radius: 16px;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.day-header.interactive {
		cursor: pointer;
	}

	.day-header.interactive:hover {
		background: rgba(15, 23, 42, 0.04);
		transform: translateY(-1px);
	}

	.day-header.interactive:focus-visible {
		outline: 2px solid #0f172a;
		outline-offset: 2px;
	}

	.day-header.interactive:active {
		transform: translateY(0);
	}

	.day-header.selected {
		background: rgba(15, 23, 42, 0.06);
		box-shadow:
			0 0 0 1px rgba(15, 23, 42, 0.1),
			0 2px 8px rgba(15, 23, 42, 0.08);
	}

	.day-header.selected.interactive:hover {
		background: rgba(15, 23, 42, 0.08);
	}

	.header-content {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 16px;
	}

	.main-info {
		flex: 1;
		min-width: 0;
	}

	.weather-section {
		flex-shrink: 0;
		align-self: center;
	}

	.selection-indicator {
		position: absolute;
		left: -8px;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 40px;
		background: #0f172a;
		border-radius: 2px;
		box-shadow: 0 2px 4px rgba(15, 23, 42, 0.2);
	}

	.ripple-effect {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background:
			radial-gradient(circle at 25% 25%, rgba(15, 23, 42, 0.01) 1px, transparent 1px),
			radial-gradient(circle at 75% 75%, rgba(15, 23, 42, 0.01) 1px, transparent 1px);
		background-size:
			20px 20px,
			24px 24px;
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	.day-header.interactive:hover .ripple-effect {
		opacity: 1;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.weather-section {
			align-self: flex-start;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.day-header {
			transition: background-color 0.1s ease;
		}

		.day-header.interactive:hover {
			transform: none;
		}

		.day-header.interactive:active {
			transform: none;
		}

		.ripple-effect {
			transition: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.day-header.selected {
			background: #f1f5f9;
			box-shadow: 0 0 0 2px #0f172a;
		}

		.day-header.interactive:hover {
			background: #e2e8f0;
		}

		.selection-indicator {
			background: #0f172a;
			width: 6px;
		}
	}
</style>
