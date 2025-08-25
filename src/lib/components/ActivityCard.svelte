<script lang="ts">
  import type { Activity } from '$lib/types'
  import { iconForCategory } from '$lib/icons'
  import { fmtTime, moneyRange } from '$lib/format'

  export let activity: Activity
</script>

<div class="card p-4 flex gap-3">
  <div class="text-xl">{iconForCategory(activity.category)}</div>
  <div class="flex-1">
    <div class="flex items-center gap-3">
      <h3 class="text-base font-semibold">{activity.title}</h3>
      {#if activity.estimated_cost}
        <span class="chip">{moneyRange(activity.estimated_cost)}</span>
      {/if}
    </div>
    <div class="mt-1 text-sm text-[var(--muted)]">
      {#if activity.start_time}{fmtTime(activity.start_time)}–{/if}{fmtTime(activity.end_time)}
      {#if activity.category}&nbsp;• {activity.category}{/if}
    </div>
    {#if activity.description}
      <p class="mt-2 text-sm">{activity.description}</p>
    {/if}
    {#if activity.place?.name}
      <div class="mt-2 text-sm">
        <span class="chip">📍 {activity.place.name}</span>
      </div>
    {/if}
    {#if activity.tags && activity.tags.length}
      <div class="mt-2 flex flex-wrap gap-2">
        {#each activity.tags as tag}<span class="chip">{tag}</span>{/each}
      </div>
    {/if}
  </div>
</div>
