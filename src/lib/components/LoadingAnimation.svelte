<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { createEventDispatcher, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();

  /** Public API */
  export let visible = false;
  // Let your poller set this: 'idle' | 'queued' | 'running' | 'done' | 'error'
  export let backendState: 'idle' | 'queued' | 'running' | 'done' | 'error' = 'idle';

  /** Timing & pacing (20s total by default) */
  export let totalMs = 20000;        // average end-to-end time
  export let holdCap = 98;           // max % while backend is still running
  export let finishMs = 800;         // how long the final 98→100% flourish takes

  // Stage proportions (must sum ≈ 1.0). Tune to taste.
  export let stageFractions = [0.12, 0.18, 0.25, 0.20, 0.15, 0.10];

  // Visual anchors (% targets) the bar lerps between for each stage
  export let stageAnchors = [0, 15, 35, 60, 85, 95];

  // Stage copy (clean, journal-style)
  export let titles = [
    'Consulting the Atlas…',
    'Finding the Hidden Gems…',
    'Plotting Your Journey…',
    'Chatting with the Locals (Figuratively!)…',
    'Balancing the Budget…',
    'Adding the Finishing Touches…'
  ];
  export let subtexts = [
    'Laying out the maps for your destination.',
    'Scanning for festivals and secret viewpoints.',
    'Sketching the most delightful routes.',
    'Choosing cafés, culture and cozy corners.',
    'Making sure the numbers add up.',
    'Your adventure is almost ready!'
  ];

  /** Internal state */
  let raf = 0;
  let startTs = 0;
  let finishStart = 0;
  let finishing = false;
  let progress = 0;      // 0–100
  let baseProgress = 0;  // progression based on schedule (uncapped)
  let stage = 0;

  // Precompute durations & cumulative sums
  const durations = (() => {
    const t = totalMs;
    return stageFractions.map((f) => Math.max(300, Math.round(f * t)));
  })();
  const cumulative = (() => {
    const arr = [0];
    for (const d of durations) arr.push(arr[arr.length - 1] + d);
    return arr; // length = stages+1
  })();

  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  function computeBaseProgress(elapsed: number) {
    // Identify active stage
    let i = 0;
    for (let s = 0; s < durations.length; s++) {
      if (elapsed < cumulative[s + 1]) { i = s; break; }
      i = s;
    }
    stage = i;

    // How far through this stage?
    const segStart = cumulative[i];
    const segEnd = cumulative[i + 1];
    const segDur = Math.max(1, segEnd - segStart);
    const segT = Math.min(1, Math.max(0, (elapsed - segStart) / segDur));

    const nextAnchor = (i + 1 < stageAnchors.length)
      ? stageAnchors[i + 1]
      : stageAnchors[stageAnchors.length - 1];

    // While pending, cap the final anchor so we never look “stuck at 100%”
    const targetAnchor = (i === stageAnchors.length - 1 && backendState !== 'done')
      ? Math.min(holdCap, nextAnchor)
      : nextAnchor;

    const from = stageAnchors[i] ?? 0;
    return lerp(from, targetAnchor, segT);
  }

  function loop(ts: number) {
    if (!startTs) startTs = ts;

    if (!finishing) {
      const elapsed = ts - startTs;
      baseProgress = computeBaseProgress(elapsed);
      progress = backendState === 'done' ? baseProgress : Math.min(baseProgress, holdCap);
    } else {
      // Smooth 98→100
      const t = Math.min(1, (ts - finishStart) / finishMs);
      const eased = cubicOut(t);
      progress = lerp(progress, 100, eased);
      if (t >= 1) {
        progress = 100;
        dispatch('finish');
        stop();
        return;
      }
    }

    raf = requestAnimationFrame(loop);
  }

  function start() {
    stop();
    startTs = 0;
    finishStart = 0;
    finishing = false;
    progress = 0;
    baseProgress = 0;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // Lifecycle: start/stop with visibility
  $: if (visible) start();
  $: if (!visible) stop();

  // When backend completes, run final flourish
  $: if (visible && backendState === 'done' && !finishing) {
    finishing = true;
    finishStart = performance.now();
    // Ensure we start finishing from at least the cap
    progress = Math.max(progress, Math.min(baseProgress, holdCap));
  }

  onDestroy(stop);
</script>

{#if visible}
  <div class="fixed inset-0 z-50 bg-black/25 flex items-center justify-center p-4">
    <div class="w-full max-w-xl rounded-2xl border border-slate-200 bg-[var(--paper,#f7f5f1)] shadow-xl p-6">
      <h3 class="font-heading text-xl sm:text-2xl text-slate-900">Preparing your itinerary…</h3>

      <p class="mt-3 text-base font-heading text-slate-800">
        {titles[stage] ?? titles[titles.length-1]}
      </p>
      <p class="mt-1 text-sm font-note text-slate-600">
        {subtexts[stage] ?? subtexts[subtexts.length-1]}
      </p>

      <div class="mt-5">
        <div class="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            class="h-3 rounded-full bg-slate-900 transition-[width] duration-200"
            style="width: {progress}%;">
          </div>
        </div>
        <div class="mt-2 text-sm text-slate-600">{Math.round(progress)}%</div>
      </div>
    </div>
  </div>
{/if}
