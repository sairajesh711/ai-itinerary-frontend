<script lang="ts">
  import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
  import { resolveArtwork } from '$lib/artwork';
  import { postItinerary, waitForJob } from '$lib/api';
  import type { ItineraryRequest, ItineraryResponse } from '$lib/types';

  let destination = '';
  let loading = false;
  let steps: string[] = [];

  $: art = resolveArtwork(destination);

  async function onSubmit(e: Event) {
    e.preventDefault();
    steps = [];
    loading = true;
    try {
      const payload: ItineraryRequest = {
        destination,
        start_date: '2025-10-05',   // TODO bind real inputs
        end_date: '2025-10-10',
        interests: ['history'],
        travelers_count: 1,
        budget_level: 'moderate',
        pace: 'balanced',
        language: 'en',
        preferred_transport: ['walk','public_transit']
      };
      const { job_id } = await postItinerary(payload);

      const result: ItineraryResponse = await waitForJob(job_id, {
        onSteps(msgs) { steps = [...steps, ...msgs]; },
        // we left defaults (starts ~1.8s, backs off to 5s)
      });

      console.log('[itinerary]', result);
      // optional tiny delay to let the bar finish animating
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) {
      steps = [...steps, 'Something went wrong. Please try again.'];
      console.error(e);
    } finally {
      loading = false;
    }
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

  <form class="card p-6 max-w-xl card-interactive card-form" on:submit={onSubmit}>
    <!-- your inputs... -->
    <label class="block text-sm font-medium mb-2" for="dest">Where are you going?</label>
    <input
      id="dest"
      class="w-full rounded-2xl border border-slate-300 bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-base"
      type="text"
      placeholder="e.g., Paris, Durban, Kyoto"
      bind:value={destination}
      autocomplete="off"
      spellcheck="false"
    />
    <div class="mt-4 flex items-center justify-between">
      <p class="text-xs text-slate-500 font-note">The background sketch adapts as you type.</p>
      <button type="submit" class="btn btn-primary">Get started</button>
    </div>
  </form>

  <!-- Placeholders while loading -->
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

<LoadingAnimation visible={loading} {steps} />
