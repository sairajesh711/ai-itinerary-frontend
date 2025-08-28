// src/lib/api.ts
import type { ItineraryRequest, ItineraryResponse } from './types';
import { sanitizeUserInput, apiRateLimiter } from './utils/security';

export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'error';
export type JobState = 'queued' | 'running' | 'done' | 'error';

type JobEnvelope = {
	job_id?: string;
	id?: string;
	status?: string;
	state?: string;
	job_status?: string;
	result?: ItineraryResponse;
	data?: ItineraryResponse;
	itinerary?: ItineraryResponse;
	error?: unknown;
};

/**
 * Get API base URL based on environment
 * - Development: Use proxy (/api) to avoid CORS issues
 * - Production: Use environment variable or throw error if not set
 */
function getApiBaseUrl(): string {
	const envApiBase = import.meta.env.VITE_API_BASE?.toString();

	if (import.meta.env.DEV) {
		// Development: use proxy if no explicit API base is set
		return envApiBase || '/api';
	} else {
		// Production: require explicit API base URL
		if (!envApiBase) {
			throw new Error('VITE_API_BASE environment variable is required for production builds');
		}
		return validateApiUrl(envApiBase);
	}
}

const API_BASE = getApiBaseUrl();

const DEFAULT_HEADERS = {
	'Content-Type': 'application/json',
	'X-Requested-With': 'XMLHttpRequest' // CSRF protection
};

/**
 * Validate API URL to prevent SSRF attacks
 */
function validateApiUrl(url: string): string {
	try {
		const parsedUrl = new URL(url.replace(/\/$/, ''));

		// Only allow HTTP/HTTPS
		if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
			throw new Error(`Invalid protocol: ${parsedUrl.protocol}. Only HTTP and HTTPS are allowed.`);
		}

		// Warn about localhost in production (but don't block it for testing)
		if (
			!import.meta.env.DEV &&
			typeof window !== 'undefined' &&
			window.location.hostname !== 'localhost'
		) {
			const hostname = parsedUrl.hostname.toLowerCase();
			const localhostHosts = ['127.0.0.1', '::1', '0.0.0.0', 'localhost'];
			if (localhostHosts.some((blocked) => hostname.includes(blocked))) {
				console.warn(
					'⚠️ Localhost API detected in production environment. This may cause connectivity issues.'
				);
			}
		}

		// Remove trailing slash to prevent double slashes when constructing endpoints
		return parsedUrl.toString().replace(/\/$/, '');
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		throw new Error(`Invalid API base URL "${url}": ${errorMessage}`);
	}
}

/**
 * Sanitize itinerary request payload
 */
function sanitizeItineraryRequest(payload: ItineraryRequest): ItineraryRequest {
	return {
		...payload,
		destination: sanitizeUserInput(payload.destination, 100),
		interests: payload.interests?.map((interest) => sanitizeUserInput(interest, 50)) || [],
		home_currency: payload.home_currency ? sanitizeUserInput(payload.home_currency, 5) : undefined,
		// Validate numeric inputs
		travelers_count: Math.max(1, Math.min(12, Number(payload.travelers_count) || 1)),
		duration_days: payload.duration_days
			? Math.max(1, Math.min(30, Number(payload.duration_days)))
			: undefined,
		max_daily_budget: payload.max_daily_budget
			? Math.max(0, Number(payload.max_daily_budget))
			: undefined
	};
}

function normalizeStatus(s?: string): JobStatus {
	const status = (s ?? '').toLowerCase();
	if (
		status === 'done' ||
		status === 'success' ||
		status === 'completed' ||
		status === 'complete' ||
		status === 'succeeded'
	)
		return 'succeeded';
	if (status === 'failed' || status === 'error') return 'failed';
	if (status === 'queued' || status === 'pending') return 'queued';
	if (status === 'running' || status === 'processing' || status === 'in_progress') return 'running';
	return 'running';
}

function pickResult(job: JobEnvelope): ItineraryResponse | undefined {
	return job.result ?? job.data ?? job.itinerary;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label = 'request'): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
		promise
			.then((value) => {
				clearTimeout(timeout);
				resolve(value);
			})
			.catch((error) => {
				clearTimeout(timeout);
				reject(error);
			});
	});
}

function mapStatusToUI(status: string): JobState {
	const normalized = normalizeStatus(status);
	if (normalized === 'succeeded') return 'done';
	if (normalized === 'failed' || normalized === 'error') return 'error';
	if (normalized === 'running') return 'running';
	return 'queued';
}

export async function postItinerary(
	payload: ItineraryRequest,
	onStatus?: (state: JobState) => void,
	signal?: AbortSignal
): Promise<ItineraryResponse> {
	// Rate limiting check
	const sessionId = 'user-session'; // In a real app, use actual session/IP
	if (!apiRateLimiter.isAllowed(sessionId)) {
		throw new Error('Too many requests. Please wait before trying again.');
	}

	// Sanitize input payload
	const sanitizedPayload = sanitizeItineraryRequest(payload);

	onStatus?.('queued');

	// Create job with sanitized data
	const createResponse = await withTimeout(
		fetch(`${API_BASE}/jobs/itinerary`, {
			method: 'POST',
			headers: {
				...DEFAULT_HEADERS,
				Accept: 'application/json'
			},
			body: JSON.stringify(sanitizedPayload),
			signal
		}),
		15000,
		'create itinerary job'
	);

	if (!createResponse.ok) {
		const text = await createResponse.text().catch(() => '');
		throw new Error(`Job create failed (${createResponse.status}): ${text}`);
	}

	const createJson = (await createResponse.json()) as JobEnvelope;
	const jobId = createJson.job_id || createJson.id;
	if (!jobId) throw new Error('Job create succeeded but no job_id was returned');

	return waitForJob(jobId, onStatus, signal);
}

async function waitForJob(
	jobId: string,
	onStatus?: (state: JobState) => void,
	signal?: AbortSignal
): Promise<ItineraryResponse> {
	const startTime = Date.now();
	const MAX_WAIT_MS = 5 * 60 * 1000; // 5 minutes for AI processing
	let intervalMs = 1000; // Start with 1 second
	let lastEmittedState: JobState = 'queued';

	while (true) {
		if (signal?.aborted) throw new Error('Request was aborted');

		if (Date.now() - startTime > MAX_WAIT_MS) {
			onStatus?.('error');
			throw new Error('Job timed out after 5 minutes');
		}

		const pollResponse = await withTimeout(
			fetch(`${API_BASE}/jobs/${jobId}?_t=${Date.now()}`, {
				method: 'GET',
				signal
			}),
			12000,
			'poll job status'
		);

		if (!pollResponse.ok) {
			const text = await pollResponse.text().catch(() => '');
			onStatus?.('error');
			throw new Error(`Job poll failed (${pollResponse.status}): ${text}`);
		}

		const job = (await pollResponse.json()) as JobEnvelope;
		const backendStatus = job.status || job.state || job.job_status || 'running';
		const uiState = mapStatusToUI(backendStatus);

		// Only emit state changes to avoid unnecessary UI updates
		if (uiState !== lastEmittedState) {
			lastEmittedState = uiState;
			onStatus?.(uiState);
		}

		if (uiState === 'done') {
			const result = pickResult(job);
			if (!result) {
				onStatus?.('error');
				throw new Error('Job completed but no result was found');
			}
			return result;
		}

		if (uiState === 'error') {
			const errorMessage = typeof job.error === 'string' ? job.error : 'Job failed';
			onStatus?.('error');
			throw new Error(errorMessage);
		}

		await sleep(intervalMs);

		// Adaptive polling: start fast, then back off gradually
		// 1s -> 1.5s -> 2s -> 2.5s -> max 3s
		if (intervalMs < 3000) {
			intervalMs = Math.min(intervalMs + 500, 3000);
		}
	}
}
