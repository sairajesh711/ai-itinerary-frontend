<script lang="ts">
  import '../app.css';
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Enable once you have a domain
  <script defer data-domain="YOUR_DOMAIN" src="https://plausible.io/js/script.js"></script>
  -->
</svelte:head>

<!-- Background (subtle paper/map vibe) -->
<div class="min-h-screen bg-stone-50 text-slate-800">
  <div class="pointer-events-none fixed inset-0 opacity-[0.04]"
       style="background-image: radial-gradient(600px 400px at 10% 20%, #2b2f39 1px, transparent 1px),
                                radial-gradient(600px 400px at 80% 0%, #2b2f39 1px, transparent 1px),
                                radial-gradient(500px 300px at 90% 90%, #2b2f39 1px, transparent 1px);
              background-size: 40px 40px, 50px 50px, 60px 60px;">
  </div>

  <slot />
</div>
