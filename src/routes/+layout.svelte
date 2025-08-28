<script lang="ts">
	import '../app.css';
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<!-- Headings: Roboto | UI: Inter | Notes: Caveat -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Inter:wght@400;500;600&family=Roboto:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
	<link rel="icon" href="/favicon.ico" />
</svelte:head>

<slot />
