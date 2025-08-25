<!-- src/lib/components/LoadingAnimation.svelte -->
<script lang="ts">
  import { fade } from 'svelte/transition';

  export let visible = false;
  export let steps: string[] = [];

  // Target number of milestones to keep progress monotonic & calm
  export let targetSteps = 8;

  // Compute monotonic progress (cap at 95% until parent hides us)
  $: uniqueCount = new Set(steps).size;
  $: raw = uniqueCount / targetSteps;
  $: progress = Math.min(raw, 0.95);
</script>

{#if visible}
  <div class="overlay" transition:fade>
    <div class="passport">
      <div class="title">Crafting your travel journal…</div>
      <div class="subtitle">Placing visa stamps as we gather details</div>

      <div class="bar">
        <div class="fill" style="width: {Math.round(progress * 100)}%"></div>
      </div>

      <ul class="stamps">
        {#each steps as s, i}
          <li class="stamp" style="--rot: {Math.sin(i * 5.17) * 3}deg">
            <span class="stamp-ink">◼</span>
            <span class="label">{s}</span>
          </li>
        {/each}
      </ul>

      <div class="hint">You can keep browsing — we’ll reveal the itinerary as soon as it’s ready.</div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: grid;
    place-items: center;
    background: rgba(0,0,0,.32);
    backdrop-filter: blur(2px);
  }
  .passport {
    width: min(92vw, 620px);
    padding: 20px 22px;
    border-radius: 18px;
    background:
      radial-gradient(1200px 400px at 20% 0%, rgba(0,0,0,0.03), transparent 60%),
      var(--paper, #fff);
    border: 1px solid rgba(15, 23, 42, 0.12);
    box-shadow:
      0 10px 30px rgba(0,0,0,.15),
      inset 0 1px 0 rgba(255,255,255,.6);
  }
  .title {
    font-family: var(--font-heading, Roboto), ui-sans-serif, system-ui;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .subtitle {
    margin-top: 2px;
    font-size: 12px;
    color: #64748b;
  }
  .bar {
    margin-top: 14px;
    height: 8px;
    width: 100%;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
  }
  .fill {
    height: 100%;
    background: #1f2937; /* deep ink */
    transition: width 700ms ease-out;
  }
  .stamps {
    margin-top: 14px;
    max-height: 160px;
    overflow: auto;
    padding-right: 4px;
    display: grid;
    gap: 8px;
  }
  .stamp {
    display: grid;
    grid-template-columns: 20px 1fr;
    align-items: center;
    gap: 10px;
    transform: rotate(var(--rot, 0deg));
    animation: thump 220ms ease-out;
  }
  .stamp-ink {
    width: 18px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    display: inline-grid;
    place-items: center;
    border-radius: 2px;
    background: #111827;
    color: #111827;
    box-shadow: 0 0 0 2px rgba(17,24,39,0.2) inset, 0 2px 5px rgba(0,0,0,0.25);
  }
  .label {
    font-size: 13px;
    color: #0f172a;
  }
  .hint {
    margin-top: 12px;
    font-size: 11px;
    color: #64748b;
  }
  @keyframes thump {
    0% { transform: scale(0.96) rotate(var(--rot, 0deg)); filter: blur(1px); opacity: 0.0; }
    60% { transform: scale(1.02) rotate(var(--rot, 0deg)); filter: blur(0); opacity: 1; }
    100% { transform: scale(1.00) rotate(var(--rot, 0deg)); }
  }
</style>
