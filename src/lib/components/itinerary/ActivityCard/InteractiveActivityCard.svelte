<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import ActivitySummary from './ActivitySummary.svelte';
  import ActivityDetails from './ActivityDetails.svelte';
  import TravelConnector from '../TravelConnector/TravelConnector.svelte';
  import { InteractionService, hoverStates, expandStates } from '$lib/stores/interactions';
  import type { Activity, TravelLeg } from '$lib/types';
  import { ANIMATIONS, INTERACTIONS } from '$lib/utils/constants';

  export let activity: Activity;
  export let leg: TravelLeg | null = null;
  export let dayIndex: number;
  export let activityIndex: number;
  export let animated = true;

  const dispatch = createEventDispatcher();

  // Generate unique component ID for cross-view synchronization
  $: componentId = InteractionService.generateComponentId('activity', dayIndex, activityIndex);
  $: mapPinId = InteractionService.generateComponentId('map-pin', dayIndex, activityIndex);
  
  // Get states from stores
  $: isHovered = $hoverStates[componentId] || false;
  $: isExpanded = $expandStates[componentId] || false;

  let cardElement: HTMLElement;
  let mounted = false;

  onMount(() => {
    mounted = true;
  });

  function handleToggleExpansion(event: CustomEvent) {
    const newExpandedState = event.detail.expanded;
    InteractionService.setExpandState(componentId, newExpandedState);
    
    // Dispatch event for external listeners
    dispatch('expand', { 
      expanded: newExpandedState, 
      activityIndex, 
      activity 
    });
  }

  function handleMouseEnter() {
    InteractionService.setHoverState(componentId, true);
    
    // Trigger cross-view interaction with map pin
    InteractionService.triggerInteraction(
      componentId,
      mapPinId,
      'hover',
      { dayIndex, activityIndex, activity }
    );

    dispatch('hover', { 
      hovered: true, 
      activityIndex, 
      activity 
    });
  }

  function handleMouseLeave() {
    InteractionService.setHoverState(componentId, false);
    
    dispatch('hover', { 
      hovered: false, 
      activityIndex, 
      activity 
    });
  }

  function handleClick() {
    InteractionService.setActiveComponent(componentId);
    
    // Trigger cross-view interaction with map pin
    InteractionService.triggerInteraction(
      componentId,
      mapPinId,
      'click',
      { dayIndex, activityIndex, activity }
    );

    dispatch('click', { 
      activityIndex, 
      activity 
    });
  }

  function handleTravelProgress(event: CustomEvent) {
    dispatch('travelProgress', {
      ...event.detail,
      activityIndex,
      dayIndex
    });
  }

  function handleTravelComplete(event: CustomEvent) {
    dispatch('travelComplete', {
      ...event.detail,
      activityIndex,
      dayIndex
    });
  }

  // Expose method for external scrolling
  export function scrollIntoView() {
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }
</script>

{#if mounted}
  <!-- Animated Travel Connector (if exists) -->
  {#if leg}
    <TravelConnector 
      {leg} 
      {dayIndex} 
      {activityIndex}
      {animated}
      style="curved"
      on:progress={handleTravelProgress}
      on:complete={handleTravelComplete}
    />
  {/if}

  <div 
    bind:this={cardElement}
    class="interactive-activity-card {isExpanded ? 'expanded' : ''} {isHovered ? 'hovered' : ''}"
    class:animated
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
    on:click={handleClick}
    on:keydown={(e) => e.key === 'Enter' && handleClick()}
    tabindex="0"
    role="button"
    aria-label="Activity: {activity.title}"
    in:fade={{ duration: animated ? ANIMATIONS.DURATIONS.NORMAL : 0 }}
    id={componentId}
    data-activity-index={activityIndex}
    data-day-index={dayIndex}
  >
    <!-- Timeline dot indicator -->
    <div class="timeline-indicator">
      <div class="timeline-dot {isHovered ? 'pulsing' : ''}"></div>
    </div>

    <!-- Card content -->
    <div class="card-content">
      <ActivitySummary
        {activity}
        {isExpanded}
        {isHovered}
        {componentId}
        on:toggle={handleToggleExpansion}
      />

      <ActivityDetails
        {activity}
        {isExpanded}
      />
    </div>

    <!-- Hover glow effect -->
    <div class="hover-glow {isHovered ? 'visible' : ''}"></div>
    
    <!-- Selection indicator -->
    {#if isExpanded}
      <div 
        class="selection-indicator"
        in:fade={{ duration: ANIMATIONS.DURATIONS.FAST }}
      ></div>
    {/if}
  </div>
{/if}

<style>

  .interactive-activity-card {
    position: relative;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 16px;
    margin-left: 24px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .interactive-activity-card.hovered {
    border-color: rgba(15, 23, 42, 0.15);
    box-shadow: 
      0 4px 12px rgba(15, 23, 42, 0.08),
      0 2px 4px rgba(15, 23, 42, 0.04);
  }

  .interactive-activity-card.expanded {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 
      0 0 0 1px rgba(15, 23, 42, 0.1),
      0 8px 24px rgba(15, 23, 42, 0.12),
      0 4px 8px rgba(15, 23, 42, 0.08);
  }

  .timeline-indicator {
    position: absolute;
    left: -12px;
    top: 20px;
    z-index: 3;
  }

  .timeline-dot {
    width: 12px;
    height: 12px;
    background: white;
    border: 2px solid #cbd5e1;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .timeline-dot.pulsing {
    border-color: #334155;
    transform: scale(1.2);
    box-shadow: 
      0 0 0 4px rgba(51, 65, 85, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .card-content {
    position: relative;
    z-index: 2;
  }

  .hover-glow {
    position: absolute;
    inset: -2px;
    background: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.05) 0%,
      rgba(15, 23, 42, 0.02) 50%,
      rgba(15, 23, 42, 0.05) 100%
    );
    border-radius: 18px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }

  .hover-glow.visible {
    opacity: 1;
  }

  .selection-indicator {
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 60px;
    background: linear-gradient(
      to bottom,
      transparent,
      #0f172a,
      transparent
    );
    border-radius: 2px;
    z-index: 4;
  }

  /* Story-telling enhancement: subtle paper texture */
  .interactive-activity-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(15, 23, 42, 0.01) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(15, 23, 42, 0.01) 1px, transparent 1px);
    background-size: 20px 20px, 24px 24px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    border-radius: inherit;
  }

  .interactive-activity-card.hovered::before {
    opacity: 0.6;
  }

  /* Animation enhancements */
  .interactive-activity-card.animated {
    animation: fadeInUp 0.4s ease both;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .interactive-activity-card {
      margin-left: 20px;
    }
    
    .timeline-indicator {
      left: -10px;
    }
    
    .timeline-dot {
      width: 10px;
      height: 10px;
    }
  }

  /* Accessibility & Motion */
  @media (prefers-reduced-motion: reduce) {
    .interactive-activity-card {
      transition: background-color 0.1s ease, border-color 0.1s ease;
    }
    
    .timeline-dot {
      transition: none;
    }
    
    .timeline-dot.pulsing {
      transform: none;
      animation: none;
    }
    
    .hover-glow {
      transition: none;
    }
    
    .interactive-activity-card.animated {
      animation: none;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .interactive-activity-card {
      background: white;
      border: 2px solid #64748b;
    }
    
    .interactive-activity-card.hovered {
      border-color: #0f172a;
      box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.2);
    }
    
    .interactive-activity-card.expanded {
      background: #f8fafc;
      border: 2px solid #0f172a;
    }
    
    .timeline-dot {
      background: white;
      border: 3px solid #64748b;
    }
    
    .timeline-dot.pulsing {
      border-color: #0f172a;
    }
    
    .selection-indicator {
      background: #0f172a;
      width: 6px;
    }
  }
</style>