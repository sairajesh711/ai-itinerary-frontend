<script context="module" lang="ts">
	export type MapActivity = {
		title: string;
		start_time?: string | null;
		place?: {
			name?: string | null;
			coordinates?: { lat: number; lng: number } | null;
		} | null;
		category?: string;
		estimated_cost?: number;
	};
</script>

<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { ui } from '$lib/stores';
	import { InteractionService, hoverStates } from '$lib/stores/interactions';
	import type { DayPlan } from '$lib/types';
	import CategoryIcon from '$lib/components/icons/CategoryIcon.svelte';
	import { DateFormatter, MoneyFormatter } from '$lib/utils/formatters';
	import { sanitizeUserInput, validateApiKey } from '$lib/utils/security';

	import { PUBLIC_MAPTILER_KEY } from '$env/static/public';

	export let dayPlan: DayPlan;
	export let totalDays: number = 1;

	// const dispatch = createEventDispatcher(); // Currently unused

	$: activities = dayPlan?.activities || [];

	function previousDay() {
		if ($ui.selectedDay > 1) {
			ui.update((state) => ({ ...state, selectedDay: state.selectedDay - 1 }));
		}
	}

	function nextDay() {
		if ($ui.selectedDay < totalDays) {
			ui.update((state) => ({ ...state, selectedDay: state.selectedDay + 1 }));
		}
	}

	// MapTiler SDK state management
	let mapEl: HTMLDivElement | null = null;
	let map: any = null;
	let markers: any[] = [];
	let routePath: any = null;
	let hoveredActivity: number | null = null;
	let selectedActivity: number | null = null;
	let popupInstance: any = null;

	// Enhanced activity points with MapTiler integration
	function toPoints() {
		return (activities || [])
			.map((a, i) => {
				const c = a.place?.coordinates;
				if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number') return null;

				const componentId = InteractionService.generateComponentId(
					'activity',
					dayPlan.day_index,
					i
				);
				const mapPinId = InteractionService.generateComponentId('map-pin', dayPlan.day_index, i);

				return {
					activityIndex: i,
					componentId,
					mapPinId,
					title: a.title || 'Untitled',
					time: DateFormatter.formatTimeRange(a.start_time, a.end_time) || '',
					name: a.place?.name || '',
					category: a.category || 'general',
					cost: a.estimated_cost ? MoneyFormatter.formatCurrency(a.estimated_cost) : null,
					coordinates: [c.lng, c.lat], // MapTiler uses [lng, lat] format
					activity: a
				};
			})
			.filter(Boolean);
	}

	// Clear all map markers and routes
	function clearMapElements() {
		// Remove all markers
		markers.forEach((markerId) => {
			if (map.getSource(markerId)) {
				map.removeLayer(markerId);
				map.removeSource(markerId);
			}
		});
		markers = [];

		// Remove route if exists
		if (routePath && map.getSource('route')) {
			map.removeLayer('route');
			map.removeSource('route');
			routePath = null;
		}

		// Close popup if open
		if (popupInstance) {
			popupInstance.remove();
			popupInstance = null;
		}
	}

	// Create premium activity markers with MapTiler (XSS-safe)
	async function createActivityMarker(point: any, index: number) {
		// const markerId = `activity-marker-${index}`; // Currently unused

		// Create marker elements safely without innerHTML
		const markerElement = document.createElement('div');
		markerElement.className = 'premium-marker';

		// Create pin container
		const pinDiv = document.createElement('div');
		pinDiv.className = `marker-pin ${hoveredActivity === index ? 'hovered' : ''} ${selectedActivity === index ? 'selected' : ''}`;

		// Create icon container
		const iconDiv = document.createElement('div');
		iconDiv.className = 'marker-icon';

		// Create SVG safely
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('width', '16');
		svg.setAttribute('height', '16');

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path.setAttribute(
			'd',
			'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
		);
		path.setAttribute('fill', 'currentColor');

		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', '12');
		circle.setAttribute('cy', '9');
		circle.setAttribute('r', '2.5');
		circle.setAttribute('fill', 'white');

		svg.appendChild(path);
		svg.appendChild(circle);
		iconDiv.appendChild(svg);

		// Create number display safely
		const numberDiv = document.createElement('div');
		numberDiv.className = 'marker-number';
		numberDiv.textContent = String(index + 1); // textContent prevents XSS

		// Assemble marker
		pinDiv.appendChild(iconDiv);
		pinDiv.appendChild(numberDiv);
		markerElement.appendChild(pinDiv);

		// Add event listeners
		markerElement.addEventListener('mouseenter', () => handleMarkerHover(index, point));
		markerElement.addEventListener('mouseleave', () => handleMarkerLeave(index));
		markerElement.addEventListener('click', (e) => {
			e.stopPropagation();
			handleMarkerClick(index, point).catch(console.error);
		});

		// Create MapTiler marker
		const { Marker } = await import('@maptiler/sdk');
		const marker = new Marker({ element: markerElement }).setLngLat(point.coordinates).addTo(map);

		markers.push(marker);
		return marker;
	}

	// Handle marker interactions
	function handleMarkerHover(index: number, point: any) {
		hoveredActivity = index;

		// Cross-component interaction
		InteractionService.triggerInteraction(point.mapPinId, point.componentId, 'hover', {
			dayIndex: dayPlan.day_index,
			activityIndex: index,
			activity: point.activity
		});
	}

	function handleMarkerLeave(_index: number) {
		hoveredActivity = null;
	}

	async function handleMarkerClick(index: number, point: any) {
		selectedActivity = selectedActivity === index ? null : index;

		// Show activity popup
		await showActivityPopup(point);

		// Cross-component interaction
		InteractionService.triggerInteraction(point.mapPinId, point.componentId, 'click', {
			dayIndex: dayPlan.day_index,
			activityIndex: index,
			activity: point.activity
		});
	}

	// Create premium popup with activity details (XSS-safe)
	async function showActivityPopup(point: any) {
		if (popupInstance) {
			popupInstance.remove();
		}

		// Create popup DOM safely without innerHTML
		const popupDiv = document.createElement('div');
		popupDiv.className = 'activity-popup';

		// Header section
		const headerDiv = document.createElement('div');
		headerDiv.className = 'popup-header';

		const categoryDiv = document.createElement('div');
		categoryDiv.className = 'popup-category';

		// Create category SVG safely
		const categorySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		categorySvg.setAttribute('viewBox', '0 0 24 24');
		categorySvg.setAttribute('width', '16');
		categorySvg.setAttribute('height', '16');
		categorySvg.setAttribute('class', 'category-icon');

		const starPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		starPath.setAttribute(
			'd',
			'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
		);
		starPath.setAttribute('fill', 'currentColor');

		categorySvg.appendChild(starPath);
		categoryDiv.appendChild(categorySvg);

		// Add sanitized category text
		const categoryText = document.createTextNode(sanitizeUserInput(point.category || 'Activity'));
		categoryDiv.appendChild(categoryText);

		headerDiv.appendChild(categoryDiv);
		popupDiv.appendChild(headerDiv);

		// Title
		const titleH3 = document.createElement('h3');
		titleH3.className = 'popup-title';
		titleH3.textContent = sanitizeUserInput(point.title || 'Untitled Activity');
		popupDiv.appendChild(titleH3);

		// Details section
		const detailsDiv = document.createElement('div');
		detailsDiv.className = 'popup-details';

		// Time detail (if exists)
		if (point.time) {
			const timeItem = createDetailItem(
				'time',
				sanitizeUserInput(point.time),
				'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'
			);
			detailsDiv.appendChild(timeItem);
		}

		// Location detail (if exists)
		if (point.name) {
			const locationItem = createDetailItem(
				'location',
				sanitizeUserInput(point.name),
				'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z'
			);
			detailsDiv.appendChild(locationItem);
		}

		// Cost detail (if exists)
		if (point.cost) {
			const costItem = createDetailItem(
				'cost',
				sanitizeUserInput(point.cost),
				'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'
			);
			costItem.className += ' cost';
			detailsDiv.appendChild(costItem);
		}

		popupDiv.appendChild(detailsDiv);

		// Helper function to create detail items safely
		function createDetailItem(type: string, text: string, iconPath: string) {
			const itemDiv = document.createElement('div');
			itemDiv.className = 'detail-item';

			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.setAttribute('viewBox', '0 0 24 24');
			svg.setAttribute('width', '14');
			svg.setAttribute('height', '14');

			const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			path.setAttribute('d', iconPath);
			path.setAttribute('stroke', 'currentColor');
			path.setAttribute('stroke-width', '2');
			path.setAttribute('fill', 'none');

			svg.appendChild(path);
			itemDiv.appendChild(svg);

			const span = document.createElement('span');
			span.textContent = text;
			itemDiv.appendChild(span);

			return itemDiv;
		}

		// Convert DOM element to HTML string for MapTiler popup
		const tempContainer = document.createElement('div');
		tempContainer.appendChild(popupDiv);
		const popupContent = tempContainer.innerHTML;

		const { Popup } = await import('@maptiler/sdk');
		popupInstance = new Popup({
			closeButton: false,
			closeOnClick: true,
			offset: [0, -40]
		})
			.setLngLat(point.coordinates)
			.setHTML(popupContent)
			.addTo(map);
	}

	// Draw route between activities
	function drawRoute(points: any[]) {
		if (points.length < 2) return;

		const coordinates = points.map((p) => p.coordinates);

		// Simple straight line route (could be enhanced with routing API)
		const routeData = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'LineString',
				coordinates
			}
		};

		if (map.getSource('route')) {
			map.getSource('route').setData(routeData);
		} else {
			map.addSource('route', {
				type: 'geojson',
				data: routeData
			});

			map.addLayer({
				id: 'route',
				type: 'line',
				source: 'route',
				layout: {
					'line-join': 'round',
					'line-cap': 'round'
				},
				paint: {
					'line-color': '#f97316',
					'line-width': 3,
					'line-opacity': 0.7,
					'line-dasharray': [2, 2]
				}
			});
		}
	}

	// Fit map to show all activities
	async function fitMapToActivities(points: any[]) {
		if (!map || !points.length) return;

		if (points.length === 1) {
			map.flyTo({
				center: points[0].coordinates,
				zoom: 15,
				duration: 1000
			});
		} else {
			const coordinates = points.map((p) => p.coordinates);
			const { LngLatBounds } = await import('@maptiler/sdk');
			const bounds = coordinates.reduce(
				(bounds, coord) => {
					return bounds.extend(coord);
				},
				new LngLatBounds(coordinates[0], coordinates[0])
			);

			map.fitBounds(bounds, {
				padding: { top: 50, bottom: 50, left: 50, right: 50 },
				duration: 1000
			});
		}
	}

	// Render all map elements
	async function renderMap() {
		if (!map) return;

		clearMapElements();
		const points = toPoints();

		if (!points.length) {
			// Fallback view
			map.flyTo({
				center: [-9.14, 38.72], // Lisbon
				zoom: 12,
				duration: 1000
			});
			return;
		}

		// Create markers
		await Promise.all(points.map((point, index) => createActivityMarker(point, index)));

		// Draw route between activities
		if (points.length > 1) {
			drawRoute(points);
		}

		// Fit map to show all activities
		await fitMapToActivities(points);
	}

	// Initialize MapTiler map
	onMount(async () => {
		try {
			// Validate API key before initialization
			if (!PUBLIC_MAPTILER_KEY || !validateApiKey(PUBLIC_MAPTILER_KEY)) {
				console.error('Invalid or missing MapTiler API key');
				return;
			}

			const { Map, config } = await import('@maptiler/sdk');
			await import('@maptiler/sdk/dist/maptiler-sdk.css');

			// Configure MapTiler with validated API key
			config.apiKey = PUBLIC_MAPTILER_KEY;

			// Create map with premium styling
			map = new Map({
				container: mapEl!,
				style: 'streets-v2', // Premium street style
				center: [-9.14, 38.72], // Default center (Lisbon)
				zoom: 12,
				pitch: 45, // Slight 3D tilt for premium feel
				bearing: 0,
				antialias: true
			});

			// Wait for map to load
			map.on('load', async () => {
				await renderMap();

				// Add subtle animations
				map.on('movestart', () => {
					if (popupInstance) {
						popupInstance.remove();
						popupInstance = null;
					}
				});
			});

			// Handle resize
			const handleResize = () => map.resize();
			window.addEventListener('resize', handleResize);

			// Cleanup on destroy
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		} catch (error) {
			console.error('Failed to initialize MapTiler:', error);
		}
	});

	// Re-render when activities change
	$: if (map && activities) {
		renderMap().catch(console.error);
	}

	// Handle cross-component interactions
	$: if (map && $hoverStates) {
		// React to timeline hover states
		Object.entries($hoverStates).forEach(([componentId, isHovered]) => {
			if (componentId.includes('activity')) {
				const parts = componentId.split('-');
				const dayIndex = parseInt(parts[1]);
				const activityIndex = parseInt(parts[2]);

				if (dayIndex === dayPlan.day_index && isHovered && hoveredActivity !== activityIndex) {
					hoveredActivity = activityIndex;
				}
			}
		});
	}

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<!-- Premium MapTiler Map Container -->
<div class="premium-map-container" in:fade={{ duration: 400 }}>
	<!-- Map Canvas -->
	<div
		bind:this={mapEl}
		class="premium-map"
		role="application"
		aria-label="Interactive travel map showing day {$ui.selectedDay} activities"
	></div>

	<!-- Premium Day Navigation -->
	<nav class="premium-day-nav" role="navigation" aria-label="Day navigation">
		<button
			type="button"
			class="nav-btn prev {$ui.selectedDay <= 1 ? 'disabled' : ''}"
			disabled={$ui.selectedDay <= 1}
			on:click={previousDay}
			aria-label="Previous day"
			in:scale={{ duration: 200 }}
		>
			<svg viewBox="0 0 16 16" class="nav-icon">
				<path
					d="M10 4l-4 4 4 4"
					stroke="currentColor"
					stroke-width="2"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<div class="day-info" in:fly={{ y: -10, duration: 300 }}>
			<div class="day-title">{dayPlan?.summary || `Day ${$ui.selectedDay}`}</div>
			<div class="day-meta">
				<span class="day-count">{$ui.selectedDay} of {totalDays}</span>
				{#if activities.length > 0}
					<span class="activity-count">• {activities.length} activities</span>
				{/if}
			</div>
		</div>

		<button
			type="button"
			class="nav-btn next {$ui.selectedDay >= totalDays ? 'disabled' : ''}"
			disabled={$ui.selectedDay >= totalDays}
			on:click={nextDay}
			aria-label="Next day"
			in:scale={{ duration: 200 }}
		>
			<svg viewBox="0 0 16 16" class="nav-icon">
				<path
					d="M6 4l4 4-4 4"
					stroke="currentColor"
					stroke-width="2"
					fill="none"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</nav>

	<!-- Map Controls Overlay -->
	<div class="map-controls">
		<button
			class="control-btn"
			on:click={() => map?.flyTo({ center: map.getCenter(), zoom: map.getZoom() + 1 })}
			aria-label="Zoom in"
		>
			<svg viewBox="0 0 16 16" width="16" height="16">
				<path d="M8 2v12M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>

		<button
			class="control-btn"
			on:click={() => map?.flyTo({ center: map.getCenter(), zoom: map.getZoom() - 1 })}
			aria-label="Zoom out"
		>
			<svg viewBox="0 0 16 16" width="16" height="16">
				<path d="M2 8h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>

		<button
			class="control-btn"
			on:click={() => renderMap().catch(console.error)}
			aria-label="Fit to activities"
		>
			<svg viewBox="0 0 16 16" width="16" height="16">
				<path
					d="M1 6v4c0 .55.45 1 1 1h4M14 10V6c0-.55-.45-1-1-1H9"
					stroke="currentColor"
					stroke-width="1.5"
					fill="none"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	</div>

	<!-- Activity Summary Panel -->
	{#if activities.length > 0}
		<div class="activity-summary" in:fly={{ x: 20, duration: 400 }}>
			<div class="summary-header">
				<h3>Today's Journey</h3>
				<span class="activity-badge">{activities.length}</span>
			</div>
			<div class="summary-stats">
				{#each activities.slice(0, 3) as activity, i}
					<div class="stat-item" class:highlighted={hoveredActivity === i}>
						<CategoryIcon name={activity.category || 'general'} size={14} />
						<span>{activity.title}</span>
					</div>
				{/each}
				{#if activities.length > 3}
					<div class="stat-item more">
						<span>+{activities.length - 3} more</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	/* PREMIUM MAPTILER MAP - Dark Journal Theme */

	.premium-map-container {
		position: relative;
		height: 70vh;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		border-radius: 24px;
		overflow: hidden;
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.3),
			0 8px 16px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(248, 250, 252, 0.05);
	}

	.premium-map {
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 1;
	}

	/* Premium Day Navigation - Glass Morphism */
	.premium-day-nav {
		position: absolute;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 16px;
		background: rgba(15, 23, 42, 0.8);
		backdrop-filter: blur(16px);
		border: 1px solid rgba(248, 250, 252, 0.1);
		border-radius: 20px;
		padding: 12px 20px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(248, 250, 252, 0.08);
		z-index: 1000;
	}

	.nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 50%;
		background: rgba(248, 250, 252, 0.1);
		color: #e2e8f0;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.nav-btn::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(249, 115, 22, 0.1));
		border-radius: inherit;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.nav-btn:hover:not(.disabled)::before {
		opacity: 1;
	}

	.nav-btn:hover:not(.disabled) {
		background: rgba(248, 250, 252, 0.15);
		color: #f8fafc;
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
	}

	.nav-btn:active:not(.disabled) {
		transform: scale(0.95);
	}

	.nav-btn.disabled {
		opacity: 0.3;
		cursor: not-allowed;
		background: rgba(248, 250, 252, 0.05);
	}

	.nav-icon {
		width: 18px;
		height: 18px;
		z-index: 2;
		position: relative;
	}

	.day-info {
		text-align: center;
		min-width: 160px;
	}

	.day-title {
		font-family: 'Roboto', system-ui, sans-serif;
		font-weight: 600;
		font-size: 1rem;
		color: #f8fafc;
		line-height: 1.2;
		margin-bottom: 4px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.day-meta {
		font-size: 0.8rem;
		color: #cbd5e1;
		font-weight: 400;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}

	.activity-count {
		color: #f97316;
		font-weight: 500;
	}

	/* Map Controls - Right Side */
	.map-controls {
		position: absolute;
		top: 20px;
		right: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		z-index: 1000;
	}

	.control-btn {
		width: 40px;
		height: 40px;
		background: rgba(15, 23, 42, 0.8);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(248, 250, 252, 0.1);
		border-radius: 12px;
		color: #e2e8f0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.control-btn:hover {
		background: rgba(15, 23, 42, 0.9);
		color: #f8fafc;
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
	}

	.control-btn:active {
		transform: translateY(0);
	}

	/* Activity Summary Panel - Bottom Left */
	.activity-summary {
		position: absolute;
		bottom: 20px;
		left: 20px;
		background: rgba(15, 23, 42, 0.85);
		backdrop-filter: blur(16px);
		border: 1px solid rgba(248, 250, 252, 0.1);
		border-radius: 16px;
		padding: 16px;
		min-width: 240px;
		max-width: 320px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(248, 250, 252, 0.06);
		z-index: 1000;
	}

	.summary-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.summary-header h3 {
		font-family: 'Roboto', system-ui, sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		color: #f8fafc;
		margin: 0;
	}

	.activity-badge {
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 8px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
	}

	.summary-stats {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		color: #cbd5e1;
		padding: 6px 8px;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.stat-item.highlighted {
		background: rgba(249, 115, 22, 0.1);
		color: #f8fafc;
		transform: translateX(4px);
	}

	.stat-item.more {
		color: #94a3b8;
		font-style: italic;
		justify-content: center;
		border-top: 1px solid rgba(248, 250, 252, 0.1);
		margin-top: 4px;
		padding-top: 8px;
	}

	/* Premium Markers - Global Styles */
	:global(.premium-marker) {
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.premium-marker:hover) {
		transform: translateY(-2px);
	}

	:global(.marker-pin) {
		position: relative;
		width: 36px;
		height: 36px;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		border: 2px solid #f8fafc;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 6px 18px rgba(0, 0, 0, 0.3),
			0 2px 6px rgba(0, 0, 0, 0.2);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	:global(.marker-pin.hovered) {
		border-color: #f97316;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.4),
			0 0 0 4px rgba(249, 115, 22, 0.2);
		transform: scale(1.1);
	}

	:global(.marker-pin.selected) {
		background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
		border-color: #f8fafc;
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.5),
			0 0 0 6px rgba(249, 115, 22, 0.3);
		transform: scale(1.15);
	}

	:global(.marker-number) {
		color: #f8fafc;
		font-family: 'Roboto', system-ui, sans-serif;
		font-weight: 700;
		font-size: 0.85rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	:global(.marker-pin.selected .marker-number) {
		color: #f8fafc;
	}

	/* Activity Popup Styling */
	:global(.activity-popup) {
		font-family: 'Inter', system-ui, sans-serif;
		min-width: 240px;
		max-width: 300px;
	}

	:global(.popup-header) {
		margin-bottom: 8px;
	}

	:global(.popup-category) {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		font-weight: 500;
		color: #f97316;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.category-icon) {
		color: #f97316;
	}

	:global(.popup-title) {
		font-weight: 700;
		font-size: 1.1rem;
		color: #0f172a;
		line-height: 1.3;
		margin: 0 0 12px 0;
	}

	:global(.popup-details) {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	:global(.detail-item) {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		color: #64748b;
	}

	:global(.detail-item.cost) {
		color: #059669;
		font-weight: 600;
	}

	:global(.detail-item svg) {
		color: #94a3b8;
		flex-shrink: 0;
	}

	:global(.detail-item.cost svg) {
		color: #059669;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.premium-map-container {
			height: 60vh;
			border-radius: 16px;
		}

		.premium-day-nav {
			top: 12px;
			padding: 8px 12px;
			gap: 12px;
		}

		.nav-btn {
			width: 32px;
			height: 32px;
		}

		.day-info {
			min-width: 120px;
		}

		.day-title {
			font-size: 0.9rem;
		}

		.activity-summary {
			bottom: 12px;
			left: 12px;
			right: 12px;
			min-width: auto;
			max-width: none;
		}

		.map-controls {
			top: 12px;
			right: 12px;
		}

		.control-btn {
			width: 36px;
			height: 36px;
		}
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.premium-day-nav {
			background: rgba(0, 0, 0, 0.95);
			border: 2px solid #f8fafc;
		}

		.activity-summary {
			background: rgba(0, 0, 0, 0.95);
			border: 2px solid #f8fafc;
		}

		.control-btn {
			background: rgba(0, 0, 0, 0.95);
			border: 2px solid #f8fafc;
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.nav-btn,
		.control-btn,
		.stat-item,
		:global(.premium-marker),
		:global(.marker-pin) {
			transition: none;
		}

		.nav-btn:hover:not(.disabled),
		:global(.marker-pin.hovered),
		:global(.marker-pin.selected) {
			transform: none;
		}
	}
</style>
