<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ItineraryRequest } from '$lib/types';

  const dispatch = createEventDispatcher();

  // External two-way bindings (for background art updates, etc.)
  export let destination = '';
  export let start_date = new Date().toISOString().slice(0, 10);
  export let end_date = '';
  export let duration_days: number = 5;

  // Form extras
  export let interests: string[] = [];
  export let budget_level: 'shoestring' | 'moderate' | 'comfortable' | 'luxury' = 'moderate';
  export let pace: 'relaxed' | 'balanced' | 'packed' = 'balanced';
  export let travelers_count = 1;
  export let preferred_transport: Array<'walk'|'public_transit'|'car'|'train'|'bike'|'rideshare'> = ['walk', 'public_transit'];
  export let max_daily_budget: number | null = null;

  // Interest options (monochrome, “hand-drawn” vibe via stroke SVGs)
  const INTERESTS: { key: string; label: string; svg: string }[] = [
    { key: 'food',      label: 'Food',      svg: '<path d="M6 3v10m4-10v10M3 7h10" stroke-width="1.5"/>' },
    { key: 'history',   label: 'History',   svg: '<path d="M3 5h10v8H3z M5 7h6" stroke-width="1.5"/>' },
    { key: 'art',       label: 'Art',       svg: '<path d="M3 11c3-6 7-6 10 0M5 8h2" stroke-width="1.5"/>' },
    { key: 'museum',    label: 'Museum',    svg: '<path d="M3 6l5-3 5 3v5H3z" stroke-width="1.5"/>' },
    { key: 'nightlife', label: 'Nightlife', svg: '<path d="M4 11l6-6 2 2-6 6z" stroke-width="1.5"/>' },
    { key: 'nature',    label: 'Nature',    svg: '<path d="M8 3v8M5 7h6" stroke-width="1.5"/>' },
    { key: 'shopping',  label: 'Shopping',  svg: '<path d="M4 6h8l-1 6H5z M6 6V5a2 2 0 014 0v1" stroke-width="1.5"/>' },
    { key: 'beach',     label: 'Beach',     svg: '<path d="M3 11h10M5 9c2-3 5-3 7 0" stroke-width="1.5"/>' },
    { key: 'hike',      label: 'Hike',      svg: '<path d="M5 11l3-6 3 6" stroke-width="1.5"/>' },
    { key: 'coffee',    label: 'Coffee',    svg: '<path d="M4 9h7a2 2 0 100-4H4v4z" stroke-width="1.5"/>' },
    { key: 'bar',       label: 'Bar',       svg: '<path d="M4 5h8l-3 3v3" stroke-width="1.5"/>' },
    { key: 'music',     label: 'Music',     svg: '<path d="M6 5v6a2 2 0 11-2-2" stroke-width="1.5"/>' }
  ];

  // Transport options
  const TRANSPORT: { key: any; label: string; svg: string }[] = [
    { key: 'walk',           label: 'Walk',          svg: '<path d="M6 3a1 1 0 102 0 1 1 0 10-2 0z M6 5v3l-2 3m4-6l2 2 1 4" stroke-width="1.5"/>' },
    { key: 'public_transit', label: 'Transit',       svg: '<path d="M4 4h8v6H4zM5 11h2m4 0h2" stroke-width="1.5"/>' },
    { key: 'train',          label: 'Train',         svg: '<path d="M4 4h8v6H4zM5 10l-1 2m7-2l1 2" stroke-width="1.5"/>' },
    { key: 'car',            label: 'Car',           svg: '<path d="M4 8h8l-1-3H5zM5 10h2m4 0h2" stroke-width="1.5"/>' },
    { key: 'bike',           label: 'Bike',          svg: '<path d="M5 10a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z M6 8l3-3" stroke-width="1.5"/>' },
    { key: 'rideshare',      label: 'Rideshare',     svg: '<path d="M4 9h8m-6-3h4" stroke-width="1.5"/>' }
  ];

  function toggleInterest(k: string) {
    interests = interests.includes(k) ? interests.filter(i => i !== k) : [...interests, k];
  }
  function toggleTransport(k: any) {
    preferred_transport = preferred_transport.includes(k)
      ? preferred_transport.filter(t => t !== k)
      : [...preferred_transport, k];
  }

  function submit() {
    const base: Partial<ItineraryRequest> = {
      destination,
      start_date,
      interests,
      travelers_count,
      budget_level,
      pace,
      language: 'en',
      preferred_transport
    };
    if (max_daily_budget != null && !Number.isNaN(max_daily_budget)) {
      // @ts-ignore optional in backend
      base.max_daily_budget = Math.max(0, Math.floor(max_daily_budget));
    }
    if (end_date) base.end_date = end_date;
    else base.duration_days = Math.max(1, Number(duration_days) || 3);

    dispatch('submitForm', base);
  }
</script>

<form class="card p-6 max-w-xl card-interactive card-form" on:submit|preventDefault={submit}>
  <!-- Destination -->
  <label class="block text-sm font-medium mb-2" for="dest">Where are you going?</label>
  <input
    id="dest"
    class="w-full rounded-2xl border border-slate-300 bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-base"
    type="text"
    placeholder="e.g., Paris, Durban, Kyoto"
    bind:value={destination}
    on:input={() => dispatch('destinationChange', destination)}
    autocomplete="off"
    spellcheck="false"
    required
  />
  <p class="mt-2 text-xs text-slate-500 font-note">The background sketch adapts as you type.</p>

  <!-- Dates -->
  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium mb-2" for="start">Start date</label>
      <input
        id="start"
        class="w-full rounded-2xl border border-slate-300 bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-base"
        type="date"
        bind:value={start_date}
        required
      />
    </div>
    <div>
      <label class="block text-sm font-medium mb-2" for="end">End date (or leave blank)</label>
      <input
        id="end"
        class="w-full rounded-2xl border border-slate-300 bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-base"
        type="date"
        bind:value={end_date}
        min={start_date}
      />
    </div>
  </div>

  <!-- Duration if no end date -->
  {#if !end_date}
    <div class="mt-4">
      <label class="block text-sm font-medium mb-2" for="dur">Trip length (days)</label>
      <input
        id="dur"
        class="w-full rounded-2xl border border-slate-300 bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-base"
        type="number"
        min="1"
        max="30"
        bind:value={duration_days}
      />
    </div>
  {/if}

  <!-- Interests grid -->
  <div class="mt-6">
    <div class="flex items-baseline justify-between">
      <label class="block text-sm font-medium">Interests</label>
      <span class="text-xs text-slate-500 font-note">Pick a few that fit your vibe</span>
    </div>
    <div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
      {#each INTERESTS as it}
        <button
          type="button"
          class="chip {interests.includes(it.key) ? 'chip-selected' : ''}"
          aria-pressed={interests.includes(it.key)}
          on:click={() => toggleInterest(it.key)}
        >
          <svg viewBox="0 0 14 14" class="icon-stroke" aria-hidden="true" width="16" height="16">
            {@html it.svg}
          </svg>
          <span>{it.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Budget & pace segmented controls -->
  <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label class="block text-sm font-medium">Budget</label>
      <div class="seg mt-2">
        {#each (['shoestring','moderate','comfortable','luxury'] as any) as b}
          <button type="button" class="seg-btn {budget_level===b?'seg-active':''}"
            on:click={() => budget_level = b}>{b}</button>
        {/each}
      </div>
    </div>
    <div>
      <label class="block text-sm font-medium">Pace</label>
      <div class="seg mt-2">
        {#each (['relaxed','balanced','packed'] as any) as p}
          <button type="button" class="seg-btn {pace===p?'seg-active':''}"
            on:click={() => pace = p}>{p}</button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Advanced -->
  <details class="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 open:shadow-sm">
    <summary class="cursor-pointer font-medium text-slate-800">Advanced options</summary>

    <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="sm:col-span-1">
        <label class="block text-sm font-medium mb-2" for="trav">Travelers</label>
        <input
          id="trav"
          class="w-full rounded-2xl border border-slate-300 bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-base"
          type="number"
          min="1" max="12"
          bind:value={travelers_count}
        />
      </div>

      <div class="sm:col-span-2">
        <label class="block text-sm font-medium">Preferred transport</label>
        <div class="mt-2 flex flex-wrap gap-2">
          {#each TRANSPORT as t}
            <button
              type="button"
              class="chip {preferred_transport.includes(t.key) ? 'chip-selected':''}"
              aria-pressed={preferred_transport.includes(t.key)}
              on:click={() => toggleTransport(t.key)}
            >
              <svg viewBox="0 0 14 14" class="icon-stroke" aria-hidden="true" width="16" height="16">
                {@html t.svg}
              </svg>
              <span>{t.label}</span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div class="mt-4">
      <label class="block text-sm font-medium mb-2" for="mdb">Max daily budget (optional)</label>
      <input
        id="mdb"
        class="w-full rounded-2xl border border-slate-300 bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300 text-base"
        type="number"
        min="0" step="1"
        bind:value={max_daily_budget}
        placeholder="EUR per day"
      />
    </div>
  </details>

  <div class="mt-6 flex items-center justify-end gap-3">
    <button type="submit" class="btn btn-primary">Create itinerary</button>
  </div>
</form>
