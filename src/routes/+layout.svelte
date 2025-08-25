<script lang="ts">
  // Global CSS (Tailwind v4 lives here)
  import '../app.css';
  export let data;
</script>

<svelte:head>
  <!-- Font pairing: Roboto for headings, Inter for UI -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="icon" href="/favicon.ico">
</svelte:head>

<slot />
