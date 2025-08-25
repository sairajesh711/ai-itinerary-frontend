<script lang="ts">
  import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';
  import ModeIcon from '$lib/components/icons/ModeIcon.svelte';
  import type { Activity, TravelLeg } from '$lib/types';

  export let activity: Activity;
  // leg = activity.travel_from_prev (connector from previous)
  export let leg: TravelLeg | null = null;

  function timeShort(t?: string|null){
    if(!t) return null;
    const [h,m] = t.split(':'); return `${h}:${m}`;
  }

  function money(a?: Activity['estimated_cost']){
    if(!a) return null;
    const sym = (c: string) => c==='EUR' ? '€' : c==='GBP' ? '£' : c==='USD' ? '$' : `${c} `;
    const mm = (x?: number|null)=> (x==null?null:Math.round(x));
    const lo = mm(a.amount_min); const hi = mm(a.amount_max);
    if(lo!=null && hi!=null) return `${sym(a.currency)}${lo}–${hi}`;
    if(hi!=null) return `~${sym(a.currency)}${hi}`;
    if(lo!=null) return `from ${sym(a.currency)}${lo}`;
    return a.currency;
  }
</script>

<!-- Leg connector (dashed line + chip) -->
{#if leg}
  <div class="leg-dash"></div>
  <div class="leg-chip">
    <ModeIcon mode={leg.mode} size={12}/>
    {#if leg.duration_minutes}{leg.duration_minutes}m{/if}
    {#if leg.distance_km}&nbsp;• {leg.distance_km} km{/if}
  </div>
{/if}

<div class="card px-4 py-3 relative">
  <!-- Left timeline dot -->
  <div class="absolute -left-2 top-5 h-3 w-3 rounded-full bg-white border border-slate-400 shadow-sm"></div>

  <div class="flex items-start gap-3">
    <div class="mt-0.5 text-slate-700">
      <CategoryIcon name={activity.category} size={18}/>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h3 class="font-medium leading-tight">{activity.title}</h3>
        {#if money(activity.estimated_cost)}
          <span class="text-xs text-slate-600 border border-slate-300 rounded-md px-1.5 py-0.5">
            {money(activity.estimated_cost)}
          </span>
        {/if}
      </div>

      <div class="mt-0.5 text-xs text-slate-600">
        {#if activity.start_time || activity.end_time}
          <span>{timeShort(activity.start_time)}{activity.end_time ? `–${timeShort(activity.end_time)}` : ''}</span>
          <span class="mx-1.5">•</span>
        {/if}
        {#if activity.place?.name}
          <span>{activity.place.name}</span>
        {/if}
      </div>

      {#if activity.description}
        <p class="mt-1 text-sm text-slate-700">{activity.description}</p>
      {/if}

      {#if activity.tips && activity.tips.length}
        <div class="mt-1 flex flex-wrap gap-1">
          {#each activity.tips as t}
            <span class="text-[11px] text-slate-600 border border-dashed border-slate-300 rounded px-1">{t}</span>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
