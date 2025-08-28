<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import InteractiveActivityCard from './ActivityCard/InteractiveActivityCard.svelte';
  import ModeIcon from '$lib/components/icons/ModeIcon.svelte';
  import type { Activity, TravelLeg } from '$lib/types';

  export let activity: Activity;
  export let leg: TravelLeg | null = null;
  export let dayIndex: number;
  export let activityIndex: number;
  export let animated = true;

  const dispatch = createEventDispatcher();

  // Forward events from InteractiveActivityCard
  function handleExpand(event: CustomEvent) {
    dispatch('expand', event.detail);
  }

  function handleHover(event: CustomEvent) {
    dispatch('hover', event.detail);
  }

  function handleClick(event: CustomEvent) {
    dispatch('click', event.detail);
  }

  function handleTravelProgress(event: CustomEvent) {
    dispatch('travelProgress', event.detail);
  }

  function handleTravelComplete(event: CustomEvent) {
    dispatch('travelComplete', event.detail);
  }

  // Expose scrolling method
  let interactiveCard: InteractiveActivityCard;
  export function scrollIntoView() {
    if (interactiveCard?.scrollIntoView) {
      interactiveCard.scrollIntoView();
    }
  }
</script>


<InteractiveActivityCard 
  bind:this={interactiveCard}
  {activity}
  {leg}
  {dayIndex}
  {activityIndex}
  {animated}
  on:expand={handleExpand}
  on:hover={handleHover}
  on:click={handleClick}
  on:travelProgress={handleTravelProgress}
  on:travelComplete={handleTravelComplete}
/>
