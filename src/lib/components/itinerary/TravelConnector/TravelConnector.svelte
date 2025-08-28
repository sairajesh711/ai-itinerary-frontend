<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import AnimatedPath from './AnimatedPath.svelte';
  import ModeIcon from '$lib/components/icons/ModeIcon.svelte';
  import type { TravelLeg } from '$lib/types';
  import { ANIMATIONS } from '$lib/utils/constants';
  import { InteractionService } from '$lib/stores/interactions';

  export let leg: TravelLeg | null = null;
  export let dayIndex: number;
  export let activityIndex: number;
  export let animated: boolean = true;
  export let style: 'vertical' | 'curved' | 'straight' = 'curved';

  const dispatch = createEventDispatcher();
  
  // Generate unique ID for this connector
  $: connectorId = `travel-connector-${dayIndex}-${activityIndex}`;
  $: pathId = `${connectorId}-path`;

  // SVG path data based on style
  $: pathData = getPathData(style);
  
  let connectorElement: HTMLElement;
  let chipVisible = false;

  function getPathData(style: 'vertical' | 'curved' | 'straight'): string {
    switch (style) {
      case 'curved':
        return 'M 10,5 Q 50,15 90,5'; // Gentle curve
      case 'straight':
        return 'M 10,10 L 90,10'; // Straight line
      case 'vertical':
        return 'M 50,0 L 50,40'; // Vertical line
      default:
        return 'M 10,10 L 90,10';
    }
  }

  function handlePathProgress(event: CustomEvent) {
    const progress = event.detail.progress;
    
    // Show chip when path is 70% complete
    if (progress >= 0.7 && !chipVisible) {
      chipVisible = true;
    }
    
    dispatch('progress', { progress, connectorId });
  }

  function handlePathComplete() {
    chipVisible = true;
    dispatch('complete', { connectorId });
  }

  function handleMouseEnter() {
    // Trigger interaction for connected activities
    InteractionService.triggerInteraction(
      connectorId,
      `activity-${dayIndex}-${activityIndex}`,
      'hover',
      { leg, dayIndex, activityIndex }
    );
  }

  onMount(() => {
    if (!animated) {
      chipVisible = true;
    }
  });
</script>

{#if leg}
  <div 
    bind:this={connectorElement}
    class="travel-connector {style}"
    on:mouseenter={handleMouseEnter}
    role="img"
    aria-label="Travel from previous activity: {leg.mode} for {leg.duration_minutes || 'unknown'} minutes"
  >
    <!-- Animated Path -->
    <div class="path-container">
      <AnimatedPath
        {pathData}
        strokeWidth={2}
        strokeColor="#64748b"
        strokeStyle="dashed"
        animationType="draw"
        triggerOffset={0.1}
        easing="ease-out"
        {animated}
        uniqueId={pathId}
        on:progress={handlePathProgress}
        on:complete={handlePathComplete}
      />
    </div>

    <!-- Travel Information Chip -->
    {#if chipVisible}
      <div 
        class="travel-chip"
        in:fade={{ duration: ANIMATIONS.DURATIONS.NORMAL, delay: 100 }}
      >
        <div class="chip-content">
          <div class="mode-icon">
            <ModeIcon mode={leg.mode} size={14} />
          </div>
          
          <div class="travel-details">
            {#if leg.duration_minutes}
              <span class="duration">{leg.duration_minutes}m</span>
            {/if}
            
            {#if leg.distance_km}
              {#if leg.duration_minutes}
                <span class="separator">•</span>
              {/if}
              <span class="distance">{leg.distance_km}km</span>
            {/if}
          </div>
        </div>

        <!-- Journey notes if available -->
        {#if leg.notes}
          <div class="travel-notes">
            {leg.notes}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .travel-connector {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 16px 0;
    min-height: 60px;
    transition: all 0.2s ease;
  }

  .travel-connector:hover {
    transform: translateY(-1px);
  }

  .path-container {
    width: 100%;
    max-width: 200px;
    position: relative;
    z-index: 1;
  }

  .travel-chip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 20px;
    padding: 8px 12px;
    box-shadow: 
      0 2px 8px rgba(15, 23, 42, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    z-index: 2;
    transition: all 0.2s ease;
  }

  .travel-chip:hover {
    background: rgba(255, 255, 255, 0.98);
    border-color: rgba(15, 23, 42, 0.2);
    box-shadow: 
      0 4px 12px rgba(15, 23, 42, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    transform: translate(-50%, -50%) scale(1.05);
  }

  .chip-content {
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .mode-icon {
    display: flex;
    align-items: center;
    color: #64748b;
    transition: color 0.2s ease;
  }

  .travel-chip:hover .mode-icon {
    color: #334155;
  }

  .travel-details {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #475569;
  }

  .duration {
    color: #059669;
  }

  .distance {
    color: #7c3aed;
  }

  .separator {
    opacity: 0.6;
    margin: 0 2px;
  }

  .travel-notes {
    margin-top: 4px;
    padding-top: 4px;
    border-top: 1px solid rgba(15, 23, 42, 0.1);
    font-size: 0.7rem;
    color: #64748b;
    text-align: center;
    font-style: italic;
    max-width: 150px;
  }

  /* Style variations */
  .travel-connector.vertical .path-container {
    max-width: 40px;
    height: 60px;
  }

  .travel-connector.straight .path-container {
    max-width: 180px;
  }

  .travel-connector.curved .path-container {
    max-width: 200px;
  }

  /* Journal-like texture on hover */
  .travel-chip::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-image: 
      radial-gradient(circle at 30% 30%, rgba(15, 23, 42, 0.02) 1px, transparent 1px),
      radial-gradient(circle at 70% 70%, rgba(15, 23, 42, 0.02) 1px, transparent 1px);
    background-size: 12px 12px, 16px 16px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .travel-chip:hover::before {
    opacity: 1;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .travel-connector,
    .travel-chip {
      transition: none;
    }
    
    .travel-connector:hover {
      transform: none;
    }
    
    .travel-chip:hover {
      transform: translate(-50%, -50%);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .travel-chip {
      background: white;
      border: 2px solid #64748b;
    }
    
    .travel-chip:hover {
      border-color: #0f172a;
    }
    
    .mode-icon {
      color: #0f172a;
    }
    
    .travel-details {
      color: #0f172a;
    }
  }
</style>