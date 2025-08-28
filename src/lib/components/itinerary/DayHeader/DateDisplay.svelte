<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { DateFormatter } from '$lib/utils/formatters';
	import { ANIMATIONS, TYPOGRAPHY } from '$lib/utils/constants';

	export let date: string;
	export let dayIndex: number;
	export let summary: string | null = null;
	export let animated = true;
	export let variant: 'full' | 'compact' = 'full';

	let mounted = false;

	onMount(() => {
		if (animated) {
			setTimeout(() => {
				mounted = true;
			}, 50);
		} else {
			mounted = true;
		}
	});

	$: formattedDate =
		variant === 'full' ? DateFormatter.formatDayHeader(date) : DateFormatter.formatDateShort(date);

	$: displayTitle = summary || `Day ${dayIndex}`;
</script>

{#if mounted}
	<div class="date-display {variant}">
		<div
			class="date-text"
			in:fade={{ duration: ANIMATIONS.DURATIONS.NORMAL, delay: animated ? 0 : 0 }}
		>
			{formattedDate}
		</div>

		<h2
			class="day-title"
			in:fly={{ y: 10, duration: ANIMATIONS.DURATIONS.NORMAL, delay: animated ? 100 : 0 }}
		>
			{displayTitle}
		</h2>
	</div>
{/if}

<style>
	.date-display {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.date-display.compact {
		gap: 2px;
	}

	.date-text {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: color 0.2s ease;
	}

	.date-display.compact .date-text {
		font-size: 0.7rem;
	}

	.day-title {
		font-family: var(--font-serif, 'Playfair Display', serif);
		font-size: 1.5rem;
		font-weight: 500;
		line-height: 1.2;
		color: #0f172a;
		margin: 0;
		transition: color 0.2s ease;
	}

	.date-display.compact .day-title {
		font-size: 1.25rem;
	}

	@media (min-width: 640px) {
		.day-title {
			font-size: 1.75rem;
		}

		.date-display.compact .day-title {
			font-size: 1.5rem;
		}
	}

	/* Add subtle text shadow for better readability */
	.day-title {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	/* Hover effect for interactivity */
	.date-display:hover .day-title {
		color: #1e293b;
	}

	.date-display:hover .date-text {
		color: #475569;
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.date-text {
			color: #000;
			font-weight: 600;
		}

		.day-title {
			color: #000;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.day-title,
		.date-text {
			transition: none;
		}
	}
</style>
