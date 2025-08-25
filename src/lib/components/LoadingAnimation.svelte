<script lang="ts">
  import { onDestroy } from 'svelte';

  export let visible = false;
  export let steps: string[] = [
    'Consulting the Atlas…',
    'Checking local events…',
    'Sketching your route…',
    'Balancing your budget…',
    'Curating food + coffee stops…'
  ];
  export let intervalMs = 1100;

  let idx = 0;
  let timer: number | null = null;

  function start() {
    stop();
    timer = window.setInterval(() => { idx = (idx + 1) % steps.length; }, intervalMs);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  $: visible ? start() : stop();

  onDestroy(stop);
</script>

{#if visible}
  <div class="fixed inset-0 z-[999] grid place-items-center" style="background: radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,0.9), rgba(250,249,246,0.95)); backdrop-filter: blur(2px);">
    <div class="passport">
      <!-- rotating “stamps” -->
      <div class="stamp s1">✈️</div>
      <div class="stamp s2">🧭</div>
      <div class="stamp s3">🗺️</div>
      <div class="stamp s4">📍</div>

      <div class="title">Preparing your trip…</div>
      <div class="msg">{steps[idx]}</div>

      <div class="bar">
        <div class="fill" style="transform: translateX({-100 + ((idx+1)/steps.length)*100}%);"></div>
      </div>
      <p class="hint">We’ll show your itinerary the moment it’s ready.</p>
    </div>
  </div>
{/if}

<style>
  .passport{
    position: relative;
    width: min(520px, 90vw);
    background: #fff;
    border: 2px solid rgba(17,24,39,.08);
    border-radius: 18px;
    box-shadow: 0 18px 60px rgba(16,24,40,.12);
    padding: 28px 22px 22px;
    overflow: hidden;
    text-align: center;
  }
  .title{ font: 700 20px/1.2 Roboto, Inter, system-ui; color: #111827; letter-spacing: .2px; margin-top: 10px; }
  .msg{ margin-top: 8px; color:#475569; font: 500 14px/1.5 Inter, system-ui; min-height: 1.5rem; }

  .bar{ position: relative; margin: 16px auto 10px; height: 6px; width: 75%; background: rgba(15,23,42,.08); border-radius: 999px; overflow: hidden; }
  .fill{ height: 100%; width: 100%; background:#1f2a37; border-radius: 999px; transition: transform .5s ease; }

  .hint{ color:#64748b; font: 400 12px/1.5 Inter, system-ui; margin: 2px 0 0; }

  .stamp{
    position: absolute; inset: auto;
    width: 60px; height: 60px; display:grid; place-items:center;
    border: 2px dashed rgba(30,41,59,.45);
    border-radius: 14px; background: #fbfbfb;
    transform-origin: center;
    box-shadow: 0 10px 20px rgba(15,23,42,.10);
    animation: float 4s ease-in-out infinite;
    user-select: none;
  }
  .s1{ top: -10px; left: -10px; rotate: -8deg; }
  .s2{ top: 6px; right: -16px; rotate: 10deg; animation-delay: .6s; }
  .s3{ bottom: -16px; left: 10px; rotate: 6deg; animation-delay: 1.1s; }
  .s4{ bottom: -12px; right: -10px; rotate: -12deg; animation-delay: 1.7s; }

  @keyframes float{
    0%,100%{ transform: translateY(0) }
    50%{ transform: translateY(-6px) }
  }
</style>
