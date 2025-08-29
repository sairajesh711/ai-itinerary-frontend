// src/lib/api.ts
import type { ItineraryRequest, ItineraryResponse } from './types';
import { sanitizeUserInput, apiRateLimiter } from './utils/security';
import { API_CONFIG, testApiEndpoint, getAllApiEndpoints } from './config';

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

const API_BASE = API_CONFIG.baseUrl;

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
 * Enhanced sanitize itinerary request payload with comprehensive validation
 */
function sanitizeItineraryRequest(payload: ItineraryRequest): ItineraryRequest {
	// Deep validation to prevent injection attacks
	const sanitized = {
		...payload,
		destination: sanitizeUserInput(payload.destination, 100),
		interests: payload.interests?.map((interest) => sanitizeUserInput(interest, 50)) || [],
		home_currency: payload.home_currency ? sanitizeUserInput(payload.home_currency, 5) : undefined,
		// Validate numeric inputs with strict bounds
		travelers_count: Math.max(1, Math.min(12, Number(payload.travelers_count) || 1)),
		duration_days: payload.duration_days
			? Math.max(1, Math.min(30, Number(payload.duration_days)))
			: undefined,
		max_daily_budget: payload.max_daily_budget
			? Math.max(0, Math.min(100000, Number(payload.max_daily_budget))) // Cap at 100k
			: undefined
	};

	// Security: Remove any unexpected properties
	const allowedKeys = [
		'destination', 'interests', 'home_currency', 'travelers_count', 
		'duration_days', 'max_daily_budget', 'start_date', 'end_date'
	];
	
	Object.keys(sanitized).forEach(key => {
		if (!allowedKeys.includes(key)) {
			console.warn(`🚨 Removing unexpected property: ${key}`);
			delete (sanitized as any)[key];
		}
	});

	return sanitized;
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

/**
 * Generate a secure request fingerprint for additional protection
 */
function generateRequestFingerprint(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2);
	const userAgent = navigator.userAgent.slice(0, 50); // Truncate for security
	return btoa(`${timestamp}-${random}-${userAgent}`).substring(0, 32);
}

/**
 * Enhanced fetch with retry logic and security features
 */
async function fetchWithRetry(
	url: string,
	options: RequestInit,
	retries = 3,
	delay = 1000
): Promise<Response> {
	let lastError: Error;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			// Add security headers that are CORS-compliant
			const secureHeaders = {
				...API_CONFIG.headers,
				...options.headers,
				// Use Content-Language for request fingerprinting (CORS allowed)
				'Content-Language': `en-${generateRequestFingerprint().substring(0, 8)}`
			};

			const response = await fetch(url, {
				...options,
				headers: secureHeaders,
				// Additional security options
				credentials: 'omit', // Prevent credential leakage
				mode: 'cors',
				cache: 'no-cache' // Prevent caching of sensitive requests
			});

			// Security check: verify response headers
			if (response.ok) {
				const contentType = response.headers.get('content-type');
				if (contentType && !contentType.includes('application/json')) {
					console.warn('⚠️ Unexpected content type:', contentType);
				}
			}

			// Don't retry on client errors (4xx) except 408, 429
			if (response.status >= 400 && response.status < 500) {
				if (response.status === 408 || response.status === 429) {
					// Request timeout or rate limited - retry with backoff
					if (attempt === retries) return response;
					await sleep(delay * attempt * 2); // Exponential backoff
					continue;
				}
				// Other 4xx errors - don't retry
				return response;
			}

			// Success or 5xx server error
			return response;
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			
			// Don't retry on abort signal
			if (lastError.name === 'AbortError') {
				throw lastError;
			}

			// Enhanced CORS error handling with solution suggestions
			if (lastError.message.includes('CORS') || lastError.message.includes('preflight')) {
				const origin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
				throw new Error(
					`CORS error from ${origin} to ${url}: ${lastError.message}. ` +
					`Ensure backend allows origin: ${origin} and headers: ${Object.keys(API_CONFIG.headers).join(', ')}`
				);
			}

			// Network security check
			if (lastError.message.includes('net::ERR_CERT') || lastError.message.includes('certificate')) {
				throw new Error(`SSL/TLS certificate error: ${lastError.message}. Check backend SSL configuration.`);
			}

			if (attempt === retries) {
				throw new Error(`Secure request failed after ${retries} attempts: ${lastError.message}`);
			}

			console.warn(`🔄 Secure fetch attempt ${attempt} failed, retrying in ${delay * attempt}ms:`, lastError.message);
			await sleep(delay * attempt);
		}
	}

	throw lastError!;
}

function mapStatusToUI(status: string): JobState {
	const normalized = normalizeStatus(status);
	if (normalized === 'succeeded') return 'done';
	if (normalized === 'failed' || normalized === 'error') return 'error';
	if (normalized === 'running') return 'running';
	return 'queued';
}

/**
 * Generate a session ID for rate limiting based on browser fingerprint
 */
function generateSessionId(): string {
	if (typeof window === 'undefined') return 'server-session';
	
	// Create a semi-unique identifier for rate limiting
	const fingerprint = [
		window.screen.width,
		window.screen.height,
		navigator.language,
		new Date().toDateString() // Reset daily
	].join('-');
	
	return btoa(fingerprint).substring(0, 16);
}

export async function postItinerary(
	payload: ItineraryRequest,
	onStatus?: (state: JobState) => void,
	signal?: AbortSignal
): Promise<ItineraryResponse> {
	// Enhanced rate limiting with browser fingerprinting
	const sessionId = generateSessionId();
	if (!apiRateLimiter.isAllowed(sessionId)) {
		throw new Error('🛡️ Rate limit exceeded. Please wait before trying again.');
	}

	// Comprehensive input sanitization
	const sanitizedPayload = sanitizeItineraryRequest(payload);
	
	// Security validation
	if (!sanitizedPayload.destination?.trim()) {
		throw new Error('🚨 Invalid destination provided');
	}

	console.log('🔒 Sending secure request with sanitized payload');
	onStatus?.('queued');

	// Create job with sanitized data
	const createResponse = await withTimeout(
		fetchWithRetry(`${API_BASE}/jobs/itinerary`, {
			method: 'POST',
			headers: {
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
			fetchWithRetry(`${API_BASE}/jobs/${jobId}?_t=${Date.now()}`, {
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
