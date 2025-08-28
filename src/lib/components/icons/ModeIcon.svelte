<script lang="ts">
	export let mode: string = 'walk';
	export let size = 14;
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	class="icon-stroke"
	style="width:{size}px;height:{size}px"
>
	{#if mode === 'walk'}
		<path d="M13 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" stroke-width="1.8" />
		<path d="M7 21l3-6 3 3 1 3M9 13l2-2h3l2 2" stroke-width="1.8" />
	{:else if mode === 'public_transit' || mode === 'bus'}
		<rect x="5" y="5" width="14" height="12" rx="2" stroke-width="1.8" />
		<path d="M7 17v2M17 17v2M7 10h10" stroke-width="1.8" />
	{:else if mode === 'train'}
		<rect x="5" y="4" width="14" height="12" rx="2" stroke-width="1.8" />
		<path d="M7 10h10M8 20l8-2M8 18H6M18 18h2" stroke-width="1.8" />
	{:else if mode === 'car' || mode === 'rideshare'}
		<path d="M5 16l2-6h10l2 6M7 16v2M17 16v2" stroke-width="1.8" />
		<path d="M7 16h10" stroke-width="1.8" />
	{:else if mode === 'flight'}
		<path d="M2 12l9 2 8-8 2 2-8 8 2 9-2-2-3-7-8-2Z" stroke-width="1.8" />
	{:else if mode === 'bike'}
		<path
			d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
			stroke-width="1.8"
		/>
		<path d="M5 14h6l-1-5h7" stroke-width="1.8" />
	{:else if mode === 'ferry'}
		<path d="M3 15l3-4h12l3 4M3 15l3 4h12l3-4" stroke-width="1.8" />
	{:else}
		<circle cx="12" cy="12" r="8" stroke-width="1.8" />
	{/if}
</svg>
