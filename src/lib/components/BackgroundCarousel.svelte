<script lang="ts">
	import { fade } from 'svelte/transition';

	export let images: string[] = [];
	export let interval = 4000;
	export let paused = false;

	let i = 0;
	let timer: any;

	function start() {
		stop();
		if (!paused && images.length > 1) {
			timer = setInterval(() => (i = (i + 1) % images.length), interval);
		}
	}
	function stop() {
		if (timer) clearInterval(timer);
		timer = null;
	}

	$: start();
	$: current = images.length ? images[i] : '';

	import { onDestroy } from 'svelte';
	onDestroy(stop);
</script>

<!-- z-0 so it actually shows; your foreground uses z-10 -->
<div class="pointer-events-none fixed inset-0 z-0">
	{#if current}
		<div
			class="absolute inset-0 opacity-10 bg-img"
			style={`background-image:url(${current})`}
			in:fade={{ duration: 600 }}
			out:fade={{ duration: 600 }}
		></div>
	{/if}
</div>

<style>
	.bg-img {
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		filter: grayscale(100%) contrast(90%);
	}
</style>
