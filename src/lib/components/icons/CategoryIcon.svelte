<script lang="ts">
  export let name: string = 'sightseeing';
  export let size = 16;
</script>

<svg width={size} height={size} viewBox="0 0 24 24" class="icon-stroke" style="width:{size}px;height:{size}px">
  {#if name==='food'}
    <!-- fork & knife -->
    <path d="M6 3v8m0 0c0 2 3 2 3 0V3M6 11v10M9 3v18" stroke-width="1.8"/>
    <path d="M15 3v18m3-12c-2 0-3 1.5-3 3v0" stroke-width="1.8"/>
  {:else if name==='coffee'}
    <path d="M5 8h11a3 3 0 0 1 0 6H5a4 4 0 0 1-4-4v-1h15" stroke-width="1.8"/>
    <path d="M6 17h9" stroke-width="1.8"/>
  {:else if name==='museum' || name==='landmark' || name==='sightseeing'}
    <!-- column/temple -->
    <path d="M3 9h18M6 9v8M9 9v8M15 9v8M18 9v8M3 17h18M12 3l9 6H3l9-6Z" stroke-width="1.8"/>
  {:else if name==='nightlife' || name==='bar'}
    <path d="M6 4h12l-4 5v5a2 2 0 1 1-4 0V9L6 4Z" stroke-width="1.8"/>
  {:else if name==='shopping'}
    <path d="M6 9h12l-1 10H7L6 9Z" stroke-width="1.8"/>
    <path d="M9 9V7a3 3 0 1 1 6 0v2" stroke-width="1.8"/>
  {:else if name==='nature' || name==='hike' || name==='beach'}
    <path d="M12 2v6M8 6l4 4 4-4M5 22c3-8 11-8 14 0" stroke-width="1.8"/>
  {:else}
    <!-- generic star/compass -->
    <path d="M12 3l3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" stroke-width="1.8"/>
  {/if}
</svg>
