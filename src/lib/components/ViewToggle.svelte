<script lang="ts">
  export let mode: 'timeline' | 'map' = 'timeline'
  export let setMode: (m:'timeline'|'map') => void
</script>

<div class="inline-flex rounded-xl border border-[var(--ring)] bg-[var(--surface)] overflow-hidden">
  <button class="px-3 py-1 text-sm" class:selected={mode==='timeline'} on:click={() => setMode('timeline')}>
    Timeline
  </button>
  <button class="px-3 py-1 text-sm" class:selected={mode==='map'} on:click={() => setMode('map')}>
    Map
  </button>
</div>

<style>
  :global(button.selected){
    background: var(--accent);
    color: white;
  }
</style>
