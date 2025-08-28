<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import ActivityCard from './ActivityCard.svelte';
	import DayHeader from './DayHeader/DayHeader.svelte';
	import { ui } from '$lib/stores';
	import { InteractionService } from '$lib/stores/interactions';
	import type { DayPlan } from '$lib/types';
	import { ANIMATIONS, TYPOGRAPHY } from '$lib/utils/constants';

	export let day: DayPlan;

	let dayElement: HTMLElement;

	// pull the 1–2 "crucial" notes (budget lines first)
	$: budgetNotes = (day.notes || []).filter((n) => /Budget/i.test(n)).slice(0, 2);
	$: otherNotes = (day.notes || []).filter((n) => !/Budget/i.test(n)).slice(0, 1);

	// Check if this day is selected
	$: isSelected = $ui.selectedDay === day.day_index;

	function handleDaySelect(event: CustomEvent) {
		ui.update((state) => ({ ...state, selectedDay: event.detail.dayIndex }));
	}

	function handleActivityExpand(event: CustomEvent) {
		// Forward to parent if needed
		console.log('Activity expanded:', event.detail);
	}

	function handleActivityHover(event: CustomEvent) {
		// Forward to parent if needed for cross-view sync
		console.log('Activity hovered:', event.detail);
	}

	function handleActivityClick(event: CustomEvent) {
		// Forward to parent if needed for cross-view sync
		console.log('Activity clicked:', event.detail);
	}

	function handleTravelProgress(event: CustomEvent) {
		// Could be used for story progression tracking
		console.log('Travel animation progress:', event.detail);
	}

	function handleTravelComplete(event: CustomEvent) {
		// Travel segment finished animating
		console.log('Travel animation complete:', event.detail);
	}

	// Expose element for external scrolling
	export function scrollIntoView() {
		if (dayElement) {
			dayElement.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'nearest'
			});
		}
	}
</script>

<section
	bind:this={dayElement}
	class="timeline-day {isSelected ? 'selected' : ''}"
	in:fade={{ duration: 200 }}
	id="day-{day.day_index}"
>
	<DayHeader {day} {isSelected} animated={true} interactive={true} on:select={handleDaySelect} />

	{#if budgetNotes.length || otherNotes.length}
		<div class="ai-insights" in:fade={{ duration: ANIMATIONS.DURATIONS.NORMAL, delay: 200 }}>
			<div class="insights-content">
				{#each budgetNotes as note}
					<div class="insight-note budget-note">{note}</div>
				{/each}
				{#each otherNotes as note}
					<div class="insight-note general-note">{note}</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- vertical spine -->
	<div class="timeline-spine"></div>

	<div class="activities-container">
		{#each day.activities as activity, i}
			<div class="activity-wrapper">
				<ActivityCard
					{activity}
					leg={activity.travel_from_prev ?? null}
					dayIndex={day.day_index}
					activityIndex={i}
					animated={true}
					on:expand={handleActivityExpand}
					on:hover={handleActivityHover}
					on:click={handleActivityClick}
					on:travelProgress={handleTravelProgress}
					on:travelComplete={handleTravelComplete}
				/>
			</div>
		{/each}
	</div>

	<!-- Chapter Conclusion -->
	{#if day.day_index < (day.total_days || 5)}
		<div class="day-conclusion">
			<div class="conclusion-line"></div>
			<div class="conclusion-text">End of Day {day.day_index}</div>
			<div class="conclusion-line"></div>
		</div>
	{/if}
</section>

<style>
	.timeline-day {
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		scroll-margin-top: 100px;
	}

	.timeline-day.selected {
		background: rgba(15, 23, 42, 0.02);
		border-radius: 16px;
		padding: 16px;
		box-shadow:
			0 0 0 1px rgba(15, 23, 42, 0.08),
			0 2px 8px rgba(15, 23, 42, 0.04);
	}

	/* AI Insights Styling - Handwritten journal notes */
	.ai-insights {
		margin: 16px 0 8px 0;
		position: relative;
	}

	.insights-content {
		background: rgba(251, 191, 36, 0.05);
		border: 1px dashed rgba(251, 191, 36, 0.3);
		border-radius: 12px;
		padding: 12px 16px;
		position: relative;
	}

	.insights-content::before {
		content: '✏️';
		position: absolute;
		top: -8px;
		right: 12px;
		background: white;
		padding: 0 4px;
		font-size: 0.8em;
	}

	.insight-note {
		font-family: var(--font-handwriting, 'Caveat', cursive);
		font-size: 0.95rem;
		line-height: 1.4;
		margin: 4px 0;
		color: #92400e;
		font-weight: 500;
	}

	.insight-note.budget-note {
		color: #059669;
		font-weight: 600;
	}

	.insight-note.general-note {
		color: #7c3aed;
		font-style: italic;
	}

	/* Activity Container - Better spacing and flow */
	.activities-container {
		position: relative;
		margin: 16px 0;
	}

	.activity-wrapper {
		margin-bottom: 12px;
		position: relative;
	}

	.activity-wrapper:last-child {
		margin-bottom: 0;
	}

	/* Timeline Spine - Connecting line between activities */
	.timeline-spine {
		position: absolute;
		left: 0;
		top: 80px;
		bottom: 60px;
		width: 2px;
		background: linear-gradient(
			to bottom,
			transparent 0%,
			rgba(203, 213, 225, 0.6) 10%,
			rgba(203, 213, 225, 0.8) 50%,
			rgba(203, 213, 225, 0.6) 90%,
			transparent 100%
		);
		z-index: 1;
	}

	/* Day Conclusion - Chapter separator */
	.day-conclusion {
		display: flex;
		align-items: center;
		gap: 16px;
		margin: 32px 0 48px 0;
		padding: 16px 0;
		position: relative;
	}

	.conclusion-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(to right, transparent, rgba(148, 163, 184, 0.4), transparent);
	}

	.conclusion-text {
		font-family: var(--font-handwriting, 'Caveat', cursive);
		font-size: 0.9rem;
		color: #64748b;
		font-weight: 500;
		white-space: nowrap;
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 12px;
		border: 1px dashed rgba(148, 163, 184, 0.3);
	}

	/* Journal-like selection indicator */
	.timeline-day.selected::before {
		content: '';
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

	@media (prefers-reduced-motion: reduce) {
		.timeline-day {
			transition: none;
		}
	}
</style>
