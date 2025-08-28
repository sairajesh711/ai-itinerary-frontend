<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import DailyPlan from '$lib/components/itinerary/DailyPlan.svelte';
  import ViewToggle from '$lib/components/ViewToggle.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import { ui, itinerary } from '$lib/stores';
  import type { ItineraryResponse } from '$lib/types';

  let currentItinerary: ItineraryResponse | null = null;
  let selectedDayPlan: any = null;
  let dayComponents: DailyPlan[] = [];
  let lastMode = $ui.mode;

  // Subscribe to store changes
  $: currentItinerary = $itinerary;
  $: if (currentItinerary) {
    selectedDayPlan = currentItinerary.daily_plan.find(d => d.day_index === $ui.selectedDay);
  }
  
  // Handle mode changes and cross-view synchronization
  $: if ($ui.mode !== lastMode) {
    handleModeChange($ui.mode, lastMode);
    lastMode = $ui.mode;
  }
  
  async function handleModeChange(newMode: string, oldMode: string) {
    if (newMode === 'timeline' && oldMode === 'map') {
      // Switching from map to timeline - scroll to selected day
      await tick();
      scrollToSelectedDay();
    }
  }
  
  function scrollToSelectedDay() {
    const dayComponent = dayComponents.find((_, i) => 
      currentItinerary?.daily_plan[i]?.day_index === $ui.selectedDay
    );
    if (dayComponent && dayComponent.scrollIntoView) {
      dayComponent.scrollIntoView();
    }
  }

  onMount(() => {
    // If no itinerary is available, redirect to home
    if (!$itinerary) {
      goto('/');
      return;
    }
    
    // Set default selected day to 1 if not set
    if ($ui.selectedDay < 1) {
      ui.update(state => ({ ...state, selectedDay: 1 }));
    }
  });

  function handleBackHome() {
    // Clear the itinerary and go back home
    itinerary.set(null);
    ui.update(state => ({ ...state, selectedDay: 1, mode: 'timeline' }));
    goto('/');
  }
</script>

<svelte:head>
  <title>{currentItinerary?.destination || 'Itinerary'} - AI Travel Planner</title>
</svelte:head>

{#if currentItinerary}
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
      <div class="container-pro py-4">
        <div class="flex items-center justify-between">
          <button 
            on:click={handleBackHome}
            class="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="rotate-180">
              <path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="text-sm font-medium">New Trip</span>
          </button>
          
          <div class="text-center">
            <h1 class="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">{currentItinerary.destination}</h1>
            <p class="text-sm text-slate-600 mt-1">
              {currentItinerary.total_days} day{currentItinerary.total_days !== 1 ? 's' : ''} • 
              {currentItinerary.travelers_count || 1} traveler{(currentItinerary.travelers_count || 1) !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div class="w-20"></div> <!-- Spacer for centering -->
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container-pro py-6">
      <div in:fade={{ duration: 300 }}>
        <!-- View Toggle -->
        <div class="mb-6">
          <ViewToggle />
        </div>

        <div id="main-content" role="tabpanel" aria-labelledby="view-toggle">
          {#if $ui.mode === 'timeline'}
            <!-- Timeline View -->
            <div class="space-y-8" in:fade={{ duration: 200 }}>
              {#each currentItinerary.daily_plan as day, i (day.day_index)}
                <DailyPlan bind:this={dayComponents[i]} {day} />
              {/each}
            </div>
          {:else}
            <!-- Map View -->
            {#if selectedDayPlan}
              <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden" in:fade={{ duration: 200 }}>
                <MapView dayPlan={selectedDayPlan} totalDays={currentItinerary.total_days} />
              </div>
            {:else}
              <div class="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                <div class="text-slate-500">
                  <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m-6 3l6-3"/>
                  </svg>
                  <p class="font-medium">No activities with locations found for this day</p>
                  <p class="text-sm mt-1">Switch to timeline view to see all activities</p>
                </div>
              </div>
            {/if}
          {/if}
        </div>

        <!-- Logistics Footer -->
        {#if currentItinerary.logistics && (currentItinerary.logistics.transit_tips?.length || currentItinerary.logistics.safety_etiquette?.length)}
          <footer class="mt-12 p-6 card">
            <h3 class="font-heading text-lg font-semibold mb-3">Travel Tips</h3>
            
            {#if currentItinerary.logistics.transit_tips?.length}
              <div class="mb-4">
                <h4 class="font-medium text-sm text-slate-700 mb-2">Getting Around</h4>
                <ul class="space-y-1">
                  {#each currentItinerary.logistics.transit_tips as tip}
                    <li class="text-sm text-slate-600">• {tip}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            {#if currentItinerary.logistics.safety_etiquette?.length}
              <div>
                <h4 class="font-medium text-sm text-slate-700 mb-2">Local Tips</h4>
                <ul class="space-y-1">
                  {#each currentItinerary.logistics.safety_etiquette as tip}
                    <li class="text-sm text-slate-600">• {tip}</li>
                  {/each}
                </ul>
              </div>
            {/if}
          </footer>
        {/if}
      </div>
    </main>
  </div>
{:else}
  <!-- Loading state -->
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
      <p class="mt-4 text-slate-600">Loading your itinerary...</p>
    </div>
  </div>
{/if}

<style>
  /* Journal-like background texture */
  .min-h-screen {
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(15, 23, 42, 0.01) 1px, transparent 1px),
      radial-gradient(circle at 80% 70%, rgba(15, 23, 42, 0.01) 1px, transparent 1px);
    background-size: 24px 24px, 32px 32px;
  }
  
  /* Enhanced readability with subtle paper texture */
  main {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(1px);
    border-radius: 24px 24px 0 0;
    margin-top: 8px;
  }
  
  /* Smooth transitions for view changes */
  #main-content {
    min-height: 400px;
  }
  
  /* Enhanced contrast for better readability */
  @media (prefers-contrast: high) {
    .min-h-screen {
      background: white;
    }
    
    main {
      background: white;
      box-shadow: 0 0 0 2px #0f172a;
    }
  }
  
  /* Respect reduced motion preferences */
  @media (prefers-reduced-motion: reduce) {
    main {
      backdrop-filter: none;
    }
  }
</style>