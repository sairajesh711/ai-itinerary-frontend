<script lang="ts">
  import { onMount } from 'svelte';
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

  // Subscribe to store changes
  $: currentItinerary = $itinerary;
  $: if (currentItinerary) {
    selectedDayPlan = currentItinerary.daily_plan.find(d => d.day_index === $ui.selectedDay);
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

        {#if $ui.mode === 'timeline'}
          <!-- Timeline View -->
          <div class="space-y-8">
            {#each currentItinerary.daily_plan as day (day.day_index)}
              <DailyPlan {day} />
            {/each}
          </div>
        {:else}
          <!-- Map View -->
          {#if selectedDayPlan}
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <MapView dayPlan={selectedDayPlan} />
            </div>
          {/if}
        {/if}

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