<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { Activity } from '$lib/types';
	import { ANIMATIONS } from '$lib/utils/constants';

	export let activity: Activity;
	export let isExpanded: boolean;

	$: hasDescription = !!activity.description;
	$: hasTips = !!activity.tips?.length;
	$: hasBooking = !!activity.booking;
	$: hasAnyDetails = hasDescription || hasTips || hasBooking;

	function formatBookingCost(booking: Activity['booking']) {
		if (!booking?.cost) return '';

		const { amount_min, amount_max, currency } = booking.cost;
		const symbol =
			currency === 'EUR'
				? '€'
				: currency === 'GBP'
					? '£'
					: currency === 'USD'
						? '$'
						: `${currency} `;

		if (amount_min && amount_max) {
			return `${symbol}${amount_min}-${amount_max}`;
		}
		if (amount_max) {
			return `~${symbol}${amount_max}`;
		}
		if (amount_min) {
			return `from ${symbol}${amount_min}`;
		}
		return '';
	}
</script>

{#if isExpanded && hasAnyDetails}
	<div
		class="activity-details"
		transition:slide={{ duration: ANIMATIONS.DURATIONS.NORMAL, easing: quintOut }}
	>
		<!-- Description -->
		{#if hasDescription}
			<div class="detail-section description">
				<p class="description-text">{activity.description}</p>
			</div>
		{/if}

		<!-- Tips -->
		{#if hasTips}
			<div class="detail-section tips">
				<h4 class="detail-title">
					<svg viewBox="0 0 16 16" class="detail-icon">
						<path
							d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 4a1 1 0 110 2 1 1 0 010-2zm0 3a1 1 0 011 1v3a1 1 0 01-2 0V8a1 1 0 011-1z"
							fill="currentColor"
						/>
					</svg>
					Tips
				</h4>
				<div class="tips-grid">
					{#each activity.tips as tip, index}
						<div class="tip-item" style="--delay: {index * 50}ms">
							<span class="tip-bullet">•</span>
							<span class="tip-text">{tip}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Booking Information -->
		{#if hasBooking}
			<div class="detail-section booking">
				<h4 class="detail-title">
					<svg viewBox="0 0 16 16" class="detail-icon">
						<path
							d="M3 4a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 0v8h6V4H5zm1 2h4v2H6V6z"
							fill="currentColor"
						/>
					</svg>
					Booking
				</h4>

				<div class="booking-content">
					{#if activity.booking.required}
						<div class="booking-notice required">
							<svg viewBox="0 0 16 16" class="notice-icon">
								<path
									d="M8 2a6 6 0 100 12A6 6 0 008 2zM7 5a1 1 0 112 0v3a1 1 0 01-2 0V5zm1 7a1 1 0 100-2 1 1 0 000 2z"
									fill="currentColor"
								/>
							</svg>
							Booking Required
						</div>
					{:else}
						<div class="booking-notice recommended">Booking Recommended</div>
					{/if}

					{#if activity.booking.recommended_timeframe}
						<div class="booking-detail">
							<span class="detail-label">Timeframe:</span>
							<span class="detail-value">{activity.booking.recommended_timeframe}</span>
						</div>
					{/if}

					{#if formatBookingCost(activity.booking)}
						<div class="booking-detail">
							<span class="detail-label">Cost:</span>
							<span class="detail-value cost">{formatBookingCost(activity.booking)}</span>
						</div>
					{/if}

					{#if activity.booking.url}
						<a
							href={activity.booking.url}
							target="_blank"
							rel="noopener noreferrer"
							class="booking-link"
						>
							<svg viewBox="0 0 16 16" class="link-icon">
								<path
									d="M7 3a1 1 0 000 2h2a1 1 0 100-2H7zM4 7a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1z"
									fill="currentColor"
								/>
							</svg>
							Book Now
							<svg viewBox="0 0 16 16" class="external-icon">
								<path
									d="M6 3a1 1 0 000 2h2.586L4.293 9.293a1 1 0 101.414 1.414L10 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1H6z"
									fill="currentColor"
								/>
							</svg>
						</a>
					{/if}

					{#if activity.booking.confirmation_ref}
						<div class="booking-detail confirmation">
							<span class="detail-label">Confirmation:</span>
							<span class="detail-value ref">{activity.booking.confirmation_ref}</span>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.activity-details {
		background: rgba(248, 250, 252, 0.8);
		border-radius: 12px;
		padding: 16px;
		margin-top: 12px;
		border: 1px solid rgba(15, 23, 42, 0.08);
		backdrop-filter: blur(2px);
	}

	.detail-section {
		margin-bottom: 16px;
	}

	.detail-section:last-child {
		margin-bottom: 0;
	}

	.detail-title {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #334155;
		margin: 0 0 8px 0;
	}

	.detail-icon {
		width: 14px;
		height: 14px;
		color: #64748b;
	}

	.description-text {
		font-size: 0.875rem;
		line-height: 1.5;
		color: #475569;
		margin: 0;
	}

	.tips-grid {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.tip-item {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		animation: fadeInUp 0.3s ease calc(var(--delay, 0ms)) both;
	}

	.tip-bullet {
		color: #64748b;
		font-weight: bold;
		flex-shrink: 0;
		margin-top: 1px;
	}

	.tip-text {
		font-size: 0.8125rem;
		line-height: 1.4;
		color: #475569;
	}

	.booking-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.booking-notice {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8125rem;
		font-weight: 500;
		padding: 6px 10px;
		border-radius: 8px;
		width: fit-content;
	}

	.booking-notice.required {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.booking-notice.recommended {
		background: rgba(251, 191, 36, 0.1);
		color: #d97706;
		border: 1px solid rgba(251, 191, 36, 0.2);
	}

	.notice-icon {
		width: 12px;
		height: 12px;
	}

	.booking-detail {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.8125rem;
	}

	.detail-label {
		font-weight: 500;
		color: #64748b;
		min-width: 80px;
	}

	.detail-value {
		color: #334155;
	}

	.detail-value.cost {
		font-weight: 600;
		color: #059669;
	}

	.detail-value.ref {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
		background: rgba(15, 23, 42, 0.05);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.booking-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: #0f172a;
		color: white;
		text-decoration: none;
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 0.8125rem;
		font-weight: 500;
		transition: all 0.2s ease;
		width: fit-content;
	}

	.booking-link:hover {
		background: #1e293b;
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
	}

	.booking-link:focus-visible {
		outline: 2px solid #0f172a;
		outline-offset: 2px;
	}

	.link-icon,
	.external-icon {
		width: 12px;
		height: 12px;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.tip-item {
			animation: none;
		}

		.booking-link:hover {
			transform: none;
		}
	}

	/* High Contrast */
	@media (prefers-contrast: high) {
		.activity-details {
			background: white;
			border: 2px solid #64748b;
		}

		.booking-notice.required {
			background: white;
			border: 2px solid #dc2626;
		}

		.booking-notice.recommended {
			background: white;
			border: 2px solid #d97706;
		}

		.booking-link {
			background: #0f172a;
			border: 2px solid #0f172a;
		}
	}
</style>
