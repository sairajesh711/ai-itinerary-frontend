<!-- src/lib/components/Anticipation.svelte -->
<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';

  /** Public props */
  export let visible = false;
  export let backendDone = false;          // parent sets true when the job returns
  export let onComplete: (() => void) | undefined;

  /** Tuning knobs (ms) — calm, premium pacing */
  export let stageDurations = [1400, 2000, 2400, 2000, 1500, 900];

  /** Stage spec + copy (edit freely) */
  const STAGES = [
    { start: 0,   end: 0.15, title: 'Consulting the Atlas…',          sub: 'Laying out the maps for your destination.' },
    { start: 0.15,end: 0.35, title: 'Finding the Hidden Gems…',       sub: 'Scanning for local festivals and secret viewpoints.' },
    { start: 0.35,end: 0.60, title: 'Plotting your Journey…',         sub: 'Sketching the most delightful routes between sights.' },
    { start: 0.60,end: 0.85, title: 'Chatting with the Locals…',      sub: 'Finding the best cafés and coziest stays.' },
    { start: 0.85,end: 0.95, title: 'Balancing the Budget…',          sub: 'Making sure the numbers add up perfectly.' },
    { start: 0.95,end: 1.00, title: 'Adding the Finishing Touches…',  sub: 'Your adventure is almost ready!' }
  ];

  /** Internal state */
  let stage = 0;
  let progress = 0;           // 0..1 monotonic
  let running = false;
  let raf: number | null = null;

  // Ease progress between two values (monotonic)
  function tweenTo(target: number, duration: number) {
    const start = performance.now();
    const from = progress;
    const to = Math.max(progress, target); // never go backwards

    return new Promise<void>((resolve) => {
      const step = (t: number) => {
        const now = performance.now();
        const p = Math.min(1, (now - start) / duration);
        progress = from + (to - from) * cubicOut(p);
        if (p < 1) {
          raf = requestAnimationFrame(step);
        } else {
          progress = to;
          resolve();
        }
      };
      raf = requestAnimationFrame(step);
    });
  }

  // Orchestrate stages
  async function play() {
    running = true;
    stage = 0;
    progress = 0;

    // Run the first 5 stages regardless of backend (cap at 0.95)
    for (let i = 0; i < 5; i++) {
      stage = i;
      await tweenTo(STAGES[i].end, stageDurations[i]);
      if (!running) return;
    }

    // Wait here until backendDone; keep a gentle shimmer on the canvas
    while (!backendDone && running) {
      await new Promise((r) => setTimeout(r, 450)); // calm heartbeat
    }

    if (!running) return;

    // Final stage: sign-off
    stage = 5;
    await tweenTo(STAGES[5].end, stageDurations[5]);

    // Small flourish before leaving
    await new Promise((r) => setTimeout(r, 220));

    onComplete?.();
  }

  // React to visibility changes
  $: if (visible) {
    cancel();
    play();
  } else {
    cancel();
  }

  function cancel() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  // Helpers for stage visibility
  const active = (i: number) => stage >= i;
  const current = (i: number) => stage === i;

  // Derived UI forms
  $: pct = Math.round(progress * 100);
  $: copy = STAGES[Math.min(stage, STAGES.length - 1)];
</script>

{#if visible}
  <div class="overlay" transition:fade>
    <div class="workbench" role="status" aria-live="polite">
      <!-- Title / micro-copy -->
      <div class="panel">
        <div class="h1">Crafting your travel journal…</div>
        <div class="sub">{copy.title}</div>
        <div class="sub2">{copy.sub}</div>
        <div class="meter" aria-label="Progress">
          <div class="ink" style="transform: scaleX({progress})"></div>
        </div>
        <div class="pct">{pct}%</div>
      </div>

      <!-- Canvas: open journal / map (monochrome SVG) -->
      <div class="canvas">
        <svg viewBox="0 0 900 520" class="sheet" aria-hidden="true">
          <!-- Paper & fold -->
          <rect x="10" y="10" width="880" height="500" rx="18" class="paper"/>
          <line x1="450" y1="10" x2="450" y2="510" class="fold"/>

          <!-- Stage 1: Compass rose -->
          <g class="compass" style="opacity:{active(0) ? 1 : 0}">
            <circle cx="120" cy="120" r="52" class="stroke" />
            <line x1="120" y1="66"  x2="120" y2="174" class="stroke" />
            <line x1="66"  y1="120" x2="174" y2="120" class="stroke" />
            <path d="M120 70 L135 120 L120 170 L105 120 Z" class="fill-ink" />
          </g>

          <!-- Stage 2: Magnifier highlight -->
          <g class="magnifier" style="opacity:{active(1) ? 1 : 0}">
            <circle cx="330" cy="220" r="38" class="glass"/>
            <line x1="357" y1="247" x2="392" y2="282" class="stroke" />
          </g>

          <!-- Map grid (faint) -->
          <g class="grid">
            {#each Array.from({ length: 12 }) as _, i}
              <line x1="{70 + i*60}" y1="60" x2="{70 + i*60}" y2="460" class="gridline" />
            {/each}
            {#each Array.from({ length: 6 }) as _, i}
              <line x1="70" y1="{60 + i*64}" x2="830" y2="{60 + i*64}" class="gridline" />
            {/each}
          </g>

          <!-- Stage 3: Dotted route path (animated dash) -->
          <path
            d="M180 390 C 300 310, 380 300, 450 330 S 620 380, 720 280"
            class="route {current(2) ? 'route-anim' : ''} {active(2) ? '' : 'route-hidden'}"
          />

          <!-- Waypoints -->
          <g class="waypoints" style="opacity:{active(2) ? 1 : 0}">
            <circle cx="180" cy="390" r="5" class="dot"/>
            <circle cx="720" cy="280" r="5" class="dot"/>
          </g>

          <!-- Stage 4: Icons (fork & bed) -->
          <g class="icons" style="opacity:{active(3) ? 1 : 0}">
            <!-- Fork & knife -->
            <path d="M520 250 v-26 m8 26 v-26 m-16 26 v-26 m24 26 v-26" class="stroke"/>
            <rect x="544" y="224" width="10" height="26" class="stroke"/>
            <!-- Bed -->
            <rect x="620" y="330" width="44" height="12" class="stroke"/>
            <rect x="620" y="322" width="14" height="8"  class="stroke"/>
            <rect x="650" y="322" width="14" height="8"  class="stroke"/>
          </g>

          <!-- Stage 5: Abacus / calculator -->
          <g class="abacus" style="opacity:{active(4) ? 1 : 0}">
            <rect x="260" y="300" width="70" height="50" class="stroke" />
            {#each [0,1,2] as r}
              <line x1="264" y1="{312 + r*12}" x2="326" y2="{312 + r*12}" class="stroke"/>
              {#each [0,1,2] as c}
                <circle cx="{270 + c*18}" cy="{312 + r*12}" r="3" class="fill-ink" />
              {/each}
            {/each}
          </g>

          <!-- Stage 6: Signature flourish -->
          <path
            d="M180 470 C 300 450, 360 500, 420 470 S 560 440, 700 470"
            class="signature {current(5) ? 'signature-anim' : ''} {active(5) ? '' : 'signature-hidden'}"
          />
        </svg>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed; inset: 0; z-index: 60;
    display: grid; place-items: center;
    background: rgba(0,0,0,.30);
    backdrop-filter: blur(1.5px);
  }
  .workbench {
    width: min(94vw, 980px);
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    background: var(--paper, #fff);
    border: 1px solid rgba(15, 23, 42, 0.14);
    border-radius: 18px;
    box-shadow:
      0 12px 28px rgba(0,0,0,.16),
      inset 0 1px 0 rgba(255,255,255,.65);
    padding: 18px;
  }
  @media (min-width: 960px) { .workbench { grid-template-columns: 320px 1fr; } }

  .panel { padding: 4px 6px; }
  .h1 {
    font-family: var(--font-heading, Roboto), ui-sans-serif, system-ui;
    font-weight: 600; letter-spacing: -0.01em; font-size: 18px;
  }
  .sub  { margin-top: 6px;  font-size: 14px; color: #0f172a; }
  .sub2 { margin-top: 2px;  font-size: 12px; color: #64748b; }

  .meter {
    margin-top: 12px; height: 8px; width: 100%;
    border-radius: 999px; background: #e2e8f0; overflow: hidden;
  }
  .ink {
    height: 100%;
    background: #111827; transform-origin: left center;
    transition: transform 800ms cubic-bezier(.2,.7,.1,1);
  }
  .pct { margin-top: 6px; font-size: 12px; color: #475569; }

  .canvas {
    background:
      radial-gradient(1200px 400px at 20% 0%, rgba(0,0,0,0.03), transparent 60%),
      var(--paper, #fff);
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 14px;
    padding: 8px;
  }
  .sheet {
    width: 100%; height: auto; display: block;
    filter: grayscale(100%) contrast(92%);
  }

  /* Ink styles */
  .stroke { fill: none; stroke: #111827; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
  .fill-ink { fill: #111827; }
  .paper { fill: #ffffff; filter: drop-shadow(0 1px 0 rgba(0,0,0,0.02)); }
  .fold  { stroke: rgba(17,24,39,0.15); stroke-dasharray: 4 6; }

  .gridline { stroke: rgba(17,24,39,0.08); stroke-width: 1; }
  .grid    { opacity: .6; }

  /* Stage bits */
  .glass { fill: rgba(17,24,39,0.07); stroke: #111827; stroke-width: 1.5; }

  .route { stroke: #111827; stroke-width: 2; fill: none; stroke-dasharray: 2 7; }
  .route-hidden { opacity: 0; }
  .route-anim { animation: dash 2200ms cubic-bezier(.2,.7,.1,1) forwards; }
  @keyframes dash { from { stroke-dashoffset: 420; opacity:.2 } to { stroke-dashoffset: 0; opacity:1 } }

  .dot { fill: #111827; }

  .signature { stroke: #111827; stroke-width: 2; fill: none; stroke-linecap: round; }
  .signature-hidden { opacity: 0; }
  .signature-anim { stroke-dasharray: 600; stroke-dashoffset: 600; animation: write 900ms ease-out forwards; }
  @keyframes write { to { stroke-dashoffset: 0; } }

  /* Subtle shimmering while waiting on backend */
  :global(.waiting) .canvas { animation: shimmer 2.6s ease-in-out infinite; }
  @keyframes shimmer {
    0%,100% { box-shadow: inset 0 0 0 rgba(0,0,0,0) }
    50%     { box-shadow: inset 0 0 60px rgba(0,0,0,0.035) }
  }
</style>
