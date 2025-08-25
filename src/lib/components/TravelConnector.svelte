<script lang="ts">
  import type { TravelLeg } from '$lib/types'
  import { iconForMode } from '$lib/icons'
  export let leg: TravelLeg | null = null
</script>

{#if leg}
  <div class="mx-6 my-2 flex items-center gap-2">
    <div class="flex-1 border-t border-dashed border-[var(--ring)]"></div>
    <div class="text-sm text-[var(--muted)] whitespace-nowrap">
      {iconForMode(leg.mode)} {leg.duration_minutes ?? '—'} min
    </div>
    <div class="flex-1 border-t border-dashed border-[var(--ring)]"></div>
  </div>
{/if}
