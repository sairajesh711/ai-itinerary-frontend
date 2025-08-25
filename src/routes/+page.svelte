<script lang="ts">
  import Loading from '$lib/components/LoadingAnimation.svelte';
  import ItineraryForm from '$lib/components/ItineraryForm.svelte';
  import { postItinerary, type JobState } from '$lib/api';
  import { itinerary } from '$lib/stores';
  import { resolveArtwork } from '$lib/artwork';
  import type { ItineraryRequest } from '$lib/types';

  // Loader state
  let loading = false;
  let backendState: JobState = 'idle'; // 'idle' | 'queued' | 'running' | 'done' | 'error'

  // Artwork reacts to the destination being typed
  let destForArt = '';
  $: art = resolveArtwork(destForArt);

  async function handleFormSubmit(e: CustomEvent<Partial<ItineraryRequest>>) {
    const payload = e.detail;

    loading = true;
    backendState = 'queued';

    try {
      const result = await postItinerary(payload as ItineraryRequest, (s) => backendState = s);
      itinerary.set(result);
      // Loading overlay will finish itself (98→100) then emit finish
    } catch (err) {
      console.error(err);
      backendState = 'error';
      loading = false;
    }
  }

  function onDestChange(e: CustomEvent<string>) {
    destForArt = e.detail || '';
  }

  function handleFinish() {
    loading = false;
  }
</script>

<!-- HERO artwork (anchored right; always visible) -->
<img
  src={art.src}
  alt=""
  class="pointer-events-none select-none fixed top-1/2 -translate-y-1/2 z-0 h-[78vh] md:h-[90vh] w-auto object-contain"
  style="right: calc(0vw + {art.nudgeVw ?? 0}vw); opacity: {art.opacity ?? 0.14}; filter: grayscale(100%) contrast(92%);"
/>

<!-- Readability wash -->
<div class="bg-wash"></div>

<main class="container-pro relative z-10 lg:pr-[30vw]">
  <div class="mb-8 text-center lg:text-left">
    <h1 class="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">AI Travel Planner</h1>
    <p class="mt-2 text-sm text-slate-500">Minimal • matte • slick</p>
  </div>

  <ItineraryForm
    on:submitForm={handleFormSubmit}
    on:destinationChange={onDestChange}
  />

  <!-- Placeholder sections while you’re wiring results -->
  <section class="mt-8 space-y-4">
    <div class="card p-6 card-interactive card-placeholder">
      <h2 class="font-heading text-xl sm:text-2xl font-semibold mb-2">Daily Timeline</h2>
      <p class="text-sm text-slate-500 font-note">Your generated day-by-day plan will appear here.</p>
      <div class="mt-3 h-28 rounded-xl skeleton"></div>
    </div>
    <div class="card p-6 card-interactive card-placeholder">
      <h2 class="font-heading text-xl sm:text-2xl font-semibold mb-2">Map View</h2>
      <p class="text-sm text-slate-500 font-note">We’ll render an interactive map for each day’s activities.</p>
      <div class="mt-3 h-28 rounded-xl skeleton"></div>
    </div>
  </section>
</main>

<!-- Clean, monotonic, ~20s loader -->
<Loading
  visible={loading}
  backendState={backendState}
  totalMs={20000}
  holdCap={98}
  on:finish={handleFinish}
/>
