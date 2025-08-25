<script lang="ts">
  import { fade } from 'svelte/transition';
  import LoadingAnimation from '$lib/components/LoadingAnimation.svelte';
  import { resolveArtwork } from '$lib/artwork';

  let destination = '';
  let loading = false;

  // Resolve background art from the typed destination
  $: art = resolveArtwork(destination);

  async function onSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    try {
      // TODO: call your backend here
      await new Promise((r) => setTimeout(r, 2600));
    } finally {
      loading = false;
    }
  }
</script>

<!-- HERO artwork (anchored right). 
     We wrap in {#key} so Svelte crossfades when art.src changes. -->
{#key art.src}
  <img
    src={art.src}
    alt=""
    class="pointer-events-none select-none fixed top-1/2 -translate-y-1/2 z-0 h-[78vh] md:h-[90vh] w-auto object-contain"
    style="right: calc(0vw + {art.nudgeVw ?? 0}vw); opacity: {art.opacity ?? 0.14}; filter: grayscale(100%) contrast(92%);"
    in:fade={{ duration: 300 }}
    out:fade={{ duration: 200 }}
  />
{/key}

<!-- Readability wash over the left content column -->
<div class="bg-wash"></div>

<main class="container-pro relative z-10 lg:pr-[30vw]">
  <div class="mb-8 text-center lg:text-left">
    <h1 class="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">AI Travel Planner</h1>
    <p class="mt-2 text-sm text-slate-500">Minimal • matte • slick</p>
  </div>

  <form class="card p-6 max-w-xl" on:submit|preventDefault={onSubmit}>
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
      <p class="text-xs text-slate-500">The background sketch adapts as you type.</p>
      <button type="submit" class="btn btn-primary">Get started</button>
    </div>
  </form>

  <section class="mt-8 space-y-4">
    <div class="card p-6">
      <h2 class="font-heading text-xl sm:text-2xl font-semibold mb-2">Daily Timeline</h2>
      <p class="text-sm text-slate-500">Your generated day-by-day plan will appear here.</p>
    </div>
    <div class="card p-6">
      <h2 class="font-heading text-xl sm:text-2xl font-semibold mb-2">Map View</h2>
      <p class="text-sm text-slate-500">We’ll render an interactive map for each day’s activities.</p>
    </div>
  </section>
</main>

<!-- Loading overlay, faded in/out -->
{#if loading}
  <div class="fixed inset-0 z-50" in:fade={{ duration: 150 }} out:fade={{ duration: 150 }}>
    <LoadingAnimation
      visible={true}
      steps={[
        'Consulting the atlas…',
        'Checking local events…',
        'Sketching your route…',
        'Balancing your budget…',
        'Estimating travel times…'
      ]}
      intervalMs={1100}
    />
  </div>
{/if}
