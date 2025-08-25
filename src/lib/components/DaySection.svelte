<script lang="ts">
  import type { DayPlan } from '$lib/types'
  import ActivityCard from './ActivityCard.svelte'
  import TravelConnector from './TravelConnector.svelte'

  export let day: DayPlan
</script>

<section class="card p-4">
  <header class="mb-4">
    <div class="text-xs uppercase tracking-wide text-[var(--muted)]">
      Day {day.day_index} • {day.date}
    </div>
    {#if day.summary}
      <h2 class="text-lg font-semibold mt-1">{day.summary}</h2>
    {/if}
  </header>

  <!-- timeline -->
  <div class="flex flex-col">
    {#each day.activities as a, i}
    <ActivityCard activity={a} />
      {#if i < day.activities.length - 1}
        <TravelConnector leg={day.activities[i+1]?.travel_from_prev ?? null} />
      {/if}
    {/each}
    {#if !day.activities?.length}
      <div class="text-sm text-[var(--muted)]">No activities yet.</div>
    {/if}
  </div>

  {#if day.notes?.length}
    <div class="mt-4 border-t border-[var(--border)] pt-3">
      {#each day.notes as n}
        <div class="text-sm">💡 {n}</div>
      {/each}
    </div>
  {/if}
</section>
