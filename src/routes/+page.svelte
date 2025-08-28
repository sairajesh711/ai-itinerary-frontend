<script lang="ts">
	import Loading from '$lib/components/LoadingAnimation.svelte';
	import ItineraryForm from '$lib/components/ItineraryForm.svelte';
	import { postItinerary, type JobState } from '$lib/api';
	import { itinerary } from '$lib/stores';
	import { resolveArtwork } from '$lib/artwork';
	import { goto } from '$app/navigation';
	import type { ItineraryRequest } from '$lib/types';

	// Loader state
	let loading = false;
	let backendState: JobState = 'idle'; // 'idle' | 'queued' | 'running' | 'done' | 'error'

	// Artwork reacts to the destination being typed
	let destForArt = '';
	$: art = resolveArtwork(destForArt);

	async function handleFormSubmit(e: CustomEvent<Partial<ItineraryRequest>>) {
		const payload = e.detail;

		loading = true;
		backendState = 'queued';

		try {
			const result = await postItinerary(payload as ItineraryRequest, (s) => (backendState = s));
			itinerary.set(result);
			// Wait a tick to ensure store update propagates before navigation
			await new Promise((resolve) => setTimeout(resolve, 100));
		} catch (err) {
			console.error(err);
			backendState = 'error';
			loading = false;
		}
	}

	function onDestChange(e: CustomEvent<string>) {
		destForArt = e.detail || '';
	}

	function handleFinish() {
		loading = false;
		// Navigate to itinerary page after loading finishes
		if ($itinerary) {
			goto('/itinerary');
		}
	}
</script>

<!-- 12-Column Grid Layout System -->
<div class="grid-container">
	<!-- Artwork Layer - Distinct layer behind content -->
	<div class="artwork-layer">
		<img
			src={art.src}
			alt="Travel destination artwork"
			class="artwork-image"
			style="--art-nudge: {art.nudgeVw ?? 0}vw;"
		/>
	</div>

	<!-- Main Content Grid - 12 Columns -->
	<main class="main-grid">
		<!-- Content Area: Columns 1-6 -->
		<section class="content-area">
			<!-- Hero Section -->
			<header class="hero-section">
				<h1 class="hero-headline">
					<span class="headline-primary">Your Journey, Artfully Drafted.</span>
				</h1>
				<p class="hero-description">
					Transform your travel ideas into a flawless, personalized itinerary. Our AI companion
					designs every moment, from hidden gems to seamless logistics, so you can focus on the
					adventure.
				</p>
			</header>

			<!-- Form Section -->
			<section class="form-container">
				<div class="form-header">
					<h2 class="form-title">Where to next?</h2>
				</div>
				<ItineraryForm on:submitForm={handleFormSubmit} on:destinationChange={onDestChange} />
			</section>
		</section>

		<!-- Breathing Room: Columns 7-12 (Empty space for artwork) -->
		<div class="breathing-space"></div>
	</main>

	<!-- Key Features Section - Below the fold -->
	<section class="features-section">
		<div class="features-grid">
			<article class="feature-card">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
						<circle cx="12" cy="10" r="3" />
					</svg>
				</div>
				<h3 class="feature-title">Beyond the Obvious</h3>
				<p class="feature-description">
					Our AI discovers hidden gems and local favorites tailored to your unique interests,
					creating a trip that's truly yours.
				</p>
			</article>

			<article class="feature-card">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="10" />
						<polyline points="12,6 12,12 16,14" />
					</svg>
				</div>
				<h3 class="feature-title">Perfectly Paced</h3>
				<p class="feature-description">
					From travel times to opening hours and local holidays, we handle the complex logistics so
					your plan is always feasible and enjoyable.
				</p>
			</article>

			<article class="feature-card">
				<div class="feature-icon">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14,2 14,8 20,8" />
						<line x1="16" y1="13" x2="8" y2="13" />
						<line x1="16" y1="17" x2="8" y2="17" />
						<polyline points="10,9 9,9 8,9" />
					</svg>
				</div>
				<h3 class="feature-title">Beautifully Designed</h3>
				<p class="feature-description">
					Receive your plan in a stunning, interactive format that feels less like a document and
					more like a personal travel journal.
				</p>
			</article>
		</div>
	</section>
</div>

<!-- Clean, monotonic, ~3min loader for AI processing -->
<Loading visible={loading} {backendState} totalMs={180000} holdCap={95} on:finish={handleFinish} />

<style>
	/* 12-COLUMN GRID SYSTEM - Precise Layout Control */

	/* Grid Container - Full Screen Foundation */
	.grid-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
		position: relative;
		overflow-x: hidden;
	}

	/* Artwork Layer - Distinct Layer Behind Content (z-0) */
	.artwork-layer {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding-right: 2rem;
	}

	.artwork-image {
		height: 90vh;
		width: auto;
		object-fit: contain;
		/* Dramatic white/chalky effect - anchored to right */
		filter: invert(1) brightness(1.3) contrast(1.4) saturate(0.1)
			drop-shadow(0 0 25px rgba(255, 255, 255, 0.4));
		transform: translateX(var(--art-nudge, 0));
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0.85;
		/* Fade out towards the left */
		mask: linear-gradient(
			to right,
			transparent 0%,
			rgba(255, 255, 255, 0.3) 30%,
			rgba(255, 255, 255, 0.8) 60%,
			rgba(255, 255, 255, 1) 80%,
			rgba(255, 255, 255, 1) 100%
		);
	}

	/* Main 12-Column Grid (z-10) */
	.main-grid {
		position: relative;
		z-index: 10;
		min-height: 100vh;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.5rem;
		padding: 2rem;
		align-items: center;
	}

	/* Content Area - Columns 1-6 */
	.content-area {
		grid-column: 1 / 7; /* Spans columns 1-6 */
		display: flex;
		flex-direction: column;
		gap: 3rem;
		max-width: 100%;
	}

	/* Breathing Space - Columns 7-12 (Empty for artwork) */
	.breathing-space {
		grid-column: 7 / 13; /* Spans columns 7-12 */
		/* Intentionally empty - this is where artwork shines through */
		position: relative;
	}

	/* Hero Section Styling */
	.hero-section {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.hero-headline {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.headline-primary {
		/* Roboto - The Structural Foundation */
		font-family:
			'Roboto',
			-apple-system,
			BlinkMacSystemFont,
			system-ui,
			sans-serif;
		font-size: clamp(3rem, 5vw, 4.5rem);
		font-weight: 600; /* Semi-bold for premium confidence */
		line-height: 0.95;
		color: #f8fafc;
		letter-spacing: -0.025em; /* Slightly tight for premium feel */
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
	}

	.hero-description {
		/* Caveat - The Artistic Personality (for sub-headline) */
		font-family: 'Caveat', cursive;
		font-size: clamp(1.25rem, 2.2vw, 1.5rem);
		line-height: 1.6;
		color: #e2e8f0;
		font-weight: 500;
		opacity: 0.95;
		max-width: 32rem;
		font-style: normal;
		transform: rotate(-0.5deg); /* Subtle handwritten angle */
	}

	/* Form Container - Premium Glass Card */
	.form-container {
		background: rgba(30, 41, 59, 0.85);
		backdrop-filter: blur(16px);
		border: 1px solid rgba(248, 250, 252, 0.12);
		border-radius: 24px;
		padding: 2.5rem;
		position: relative;
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.3),
			0 8px 16px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(248, 250, 252, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-container:hover {
		border-color: rgba(249, 115, 22, 0.3);
		box-shadow:
			0 25px 50px rgba(0, 0, 0, 0.4),
			0 12px 20px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(248, 250, 252, 0.1),
			0 0 0 1px rgba(249, 115, 22, 0.2);
	}

	.form-container::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			135deg,
			rgba(249, 115, 22, 0.06) 0%,
			transparent 50%,
			rgba(248, 250, 252, 0.03) 100%
		);
		border-radius: inherit;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.form-container:hover::before {
		opacity: 1;
	}

	/* Form Header */
	.form-header {
		margin-bottom: 1.5rem;
	}

	.form-title {
		/* Caveat - Artistic personality for form prompt */
		font-family: 'Caveat', cursive;
		font-size: 1.375rem;
		font-weight: 500;
		color: #f97316; /* Burnt orange accent */
		margin: 0;
		transform: rotate(-0.3deg);
	}

	/* Features Section - Below the fold */
	.features-section {
		background: rgba(15, 23, 42, 0.4);
		backdrop-filter: blur(8px);
		padding: 4rem 2rem;
		margin-top: 2rem;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2.5rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.feature-card {
		text-align: center;
		padding: 2rem 1.5rem;
		background: rgba(30, 41, 59, 0.6);
		border-radius: 16px;
		border: 1px solid rgba(248, 250, 252, 0.08);
		transition: all 0.3s ease;
	}

	.feature-card:hover {
		transform: translateY(-4px);
		background: rgba(30, 41, 59, 0.8);
		border-color: rgba(249, 115, 22, 0.2);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	}

	.feature-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto 1.5rem;
		color: #f97316; /* Burnt orange accent */
		opacity: 0.9;
	}

	.feature-icon svg {
		width: 100%;
		height: 100%;
	}

	.feature-title {
		/* Roboto - Structural foundation for headings */
		font-family:
			'Roboto',
			-apple-system,
			BlinkMacSystemFont,
			system-ui,
			sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: #f8fafc;
		margin: 0 0 1rem 0;
		letter-spacing: -0.01em;
	}

	.feature-description {
		/* Inter - Voice of clarity for body text */
		font-family:
			'Inter',
			-apple-system,
			BlinkMacSystemFont,
			system-ui,
			sans-serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: #cbd5e1;
		margin: 0;
		opacity: 0.9;
	}

	/* Dynamic Artwork Interaction */
	.grid-container:hover .artwork-image {
		transform: translateX(var(--art-nudge, 0)) scale(1.03);
		filter: invert(1) brightness(1.4) contrast(1.5) saturate(0.15)
			drop-shadow(0 0 35px rgba(255, 255, 255, 0.5));
		opacity: 0.9;
	}

	/* Responsive Grid Adjustments */
	@media (max-width: 1400px) {
		.main-grid {
			gap: 1.25rem;
			padding: 1.5rem;
		}
	}

	@media (max-width: 1200px) {
		/* Adjust content to use more columns */
		.content-area {
			grid-column: 1 / 8; /* Spans columns 1-7 */
		}

		.breathing-space {
			grid-column: 8 / 13; /* Spans columns 8-12 */
		}
	}

	@media (max-width: 1024px) {
		.content-area {
			grid-column: 1 / 9; /* Spans columns 1-8 */
		}

		.breathing-space {
			grid-column: 9 / 13; /* Spans columns 9-12 */
		}

		.form-container {
			padding: 2rem;
		}
	}

	@media (max-width: 768px) {
		/* Mobile: Full width content */
		.main-grid {
			grid-template-columns: 1fr;
			padding: 1.5rem;
			padding-top: 35vh;
		}

		.content-area {
			grid-column: 1;
		}

		.breathing-space {
			display: none;
		}

		.artwork-layer {
			position: absolute;
			height: 35vh;
			justify-content: center;
		}

		.artwork-image {
			height: 25vh;
			opacity: 0.6;
			mask: linear-gradient(
				to bottom,
				rgba(255, 255, 255, 1) 0%,
				rgba(255, 255, 255, 0.8) 60%,
				transparent 100%
			);
		}

		.hero-section {
			text-align: center;
			gap: 1.25rem;
		}
	}

	@media (max-width: 640px) {
		.main-grid {
			padding: 1rem;
		}

		.form-container {
			padding: 1.5rem;
		}

		.headline-primary {
			font-size: clamp(2.5rem, 8vw, 3.5rem);
		}
	}

	/* High Contrast Mode */
	@media (prefers-contrast: high) {
		.grid-container {
			background: #000;
		}

		.artwork-image {
			filter: invert(1) brightness(1.8) contrast(2);
		}

		.form-container {
			background: rgba(15, 23, 42, 0.95);
			border: 2px solid rgba(248, 250, 252, 0.4);
		}
	}

	/* Reduced Motion */
	@media (prefers-reduced-motion: reduce) {
		.artwork-image {
			transition: none;
		}

		.form-container {
			transition: border-color 0.1s ease;
		}

		.grid-container:hover .artwork-image {
			transform: translateX(var(--art-nudge, 0));
			scale: 1;
		}
	}
</style>
