<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { WeatherService } from '$lib/services/WeatherService';
  import type { WeatherSummary } from '$lib/types';
  import { ANIMATIONS } from '$lib/utils/constants';

  export let weather: WeatherSummary | null = null;
  export let animated = true;
  export let compact = false;

  const weatherService = WeatherService.getInstance();
  
  $: weatherDisplay = weatherService.getWeatherDisplay(weather);
  $: weatherStyling = weatherService.getWeatherStyling(weather);
  $: animationConfig = weatherService.getAnimationConfig();

  let mounted = false;
  
  onMount(() => {
    if (animated) {
      setTimeout(() => {
        mounted = true;
      }, animationConfig.staggerDelay);
    } else {
      mounted = true;
    }
  });
</script>

{#if weatherDisplay.hasData && mounted}
  <div 
    class="weather-display {compact ? 'compact' : ''}"
    style="--icon-color: {weatherStyling.iconColor}; --bg-color: {weatherStyling.backgroundColor}; --text-color: {weatherStyling.textColor}"
    in:fly={{ y: -10, duration: animationConfig.duration, delay: animated ? 100 : 0 }}
  >
    {#if weatherDisplay.icon}
      <span 
        class="weather-icon"
        in:fade={{ duration: animationConfig.duration, delay: animated ? 150 : 0 }}
        role="img"
        aria-label="Weather condition"
      >
        {weatherDisplay.icon}
      </span>
    {/if}
    
    {#if weatherDisplay.temperature}
      <span 
        class="weather-temp"
        in:fly={{ x: -10, duration: animationConfig.duration, delay: animated ? 200 : 0 }}
      >
        {weatherDisplay.temperature}
      </span>
    {/if}
    
    {#if weatherDisplay.description && !compact}
      <span 
        class="weather-desc"
        in:fade={{ duration: animationConfig.duration, delay: animated ? 250 : 0 }}
      >
        {weatherDisplay.description}
      </span>
    {/if}
  </div>
{/if}

<style>
  .weather-display {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: var(--bg-color);
    border-radius: 12px;
    border: 1px solid rgba(var(--icon-color), 0.2);
    transition: all 0.2s ease;
  }

  .weather-display:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .weather-display.compact {
    padding: 2px 6px;
    gap: 4px;
    font-size: 0.85em;
  }

  .weather-icon {
    font-size: 1.1em;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    animation: gentle-float 3s ease-in-out infinite;
  }

  .weather-temp {
    font-weight: 500;
    color: var(--text-color);
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .weather-desc {
    font-size: 0.75rem;
    color: var(--text-color);
    opacity: 0.8;
    font-style: italic;
  }

  @keyframes gentle-float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-1px);
    }
  }

  /* Reduce animations for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .weather-display {
      transition: none;
    }
    
    .weather-icon {
      animation: none;
    }
    
    .weather-display:hover {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .weather-display {
      border: 2px solid var(--text-color);
      background: white;
    }
    
    .weather-temp,
    .weather-desc {
      color: black;
    }
  }
</style>