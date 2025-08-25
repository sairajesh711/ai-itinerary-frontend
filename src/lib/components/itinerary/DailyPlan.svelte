<script lang="ts">
  import { fade } from 'svelte/transition';
  import ActivityCard from './ActivityCard.svelte';
  import type { DayPlan } from '$lib/types';

  export let day: DayPlan;

  function fmtDate(iso: string){
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
  }

  // pull the 1–2 “crucial” notes (budget lines first)
  $: budgetNotes = (day.notes || []).filter(n => /Budget/i.test(n)).slice(0,2);
  $: otherNotes = (day.notes || []).filter(n => !/Budget/i.test(n)).slice(0,1);
</script>

<section class="timeline-day" in:fade={{duration:200}}>
  <header class="mb-3">
    <div class="text-xs text-slate-600">{fmtDate(day.date)}</div>
    <h2 class="font-heading text-xl sm:text-2xl leading-tight">{day.summary ?? `Day ${day.day_index}`}</h2>

    {#if budgetNotes.length || otherNotes.length}
      <ul class="mt-1 space-y-0.5">
        {#each budgetNotes as n}
          <li class="text-[13px] text-slate-700 font-scribble">{n}</li>
        {/each}
        {#each otherNotes as n}
          <li class="text-[13px] text-slate-600 font-scribble">{n}</li>
        {/each}
      </ul>
    {/if}
  </header>

  <!-- vertical spine -->
  <div class="timeline-spine"></div>

  <div class="space-y-3">
    {#each day.activities as a, i}
      <div class="relative">
        <ActivityCard activity={a} leg={a.travel_from_prev ?? null}/>
      </div>
    {/each}
  </div>
</section>
