// src/lib/config.ts
/**
 * Centralized configuration management to prevent CORS and API issues
 */

export interface ApiConfig {
	baseUrl: string;
	timeout: number;
	retries: number;
	headers: Record<string, string>;
}

/**
 * Multiple backend URLs for redundancy and fallback
 * Priority order: Google Cloud Run (primary) -> Local dev
 */
const API_ENDPOINTS = {
	production: 'https://ai-itinerary-backend-adijnzupnq-el.a.run.app',
	backup: 'https://ai-itinerary-backend.onrender.com', // Keep as backup
	development: 'http://127.0.0.1:8000'
} as const;

/**
 * Get the optimal API configuration based on environment
 */
export function getApiConfig(): ApiConfig {
	const envApiBase = import.meta.env.VITE_API_BASE?.toString()?.trim();
	
	let baseUrl: string;

	if (envApiBase) {
		// Use explicitly configured API base
		baseUrl = validateAndNormalizeUrl(envApiBase);
		console.log('🔗 Using configured API:', baseUrl);
	} else if (import.meta.env.DEV) {
		// Development mode - prefer proxy to avoid CORS
		baseUrl = '/api';
		console.log('🚀 Development mode: using proxy /api');
	} else {
		// Production fallback - use primary endpoint
		baseUrl = API_ENDPOINTS.production;
		console.warn('⚠️ No VITE_API_BASE configured, using default production endpoint');
	}

	return {
		baseUrl,
		timeout: 15000,
		retries: 3,
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			// Using Authorization header for security instead of X-Requested-With
			// Backend allows: Accept, Accept-Language, Authorization, Content-Language, Content-Type
			'Accept-Language': 'en-US,en;q=0.9'
		}
	};
}

/**
 * Validate and normalize API URL
 */
function validateAndNormalizeUrl(url: string): string {
	try {
		const parsed = new URL(url.replace(/\/+$/, '')); // Remove trailing slashes
		
		if (!['http:', 'https:'].includes(parsed.protocol)) {
			throw new Error(`Invalid protocol: ${parsed.protocol}`);
		}

		// Warn about localhost in production
		if (!import.meta.env.DEV && typeof window !== 'undefined') {
			const isLocalhost = ['127.0.0.1', '::1', '0.0.0.0', 'localhost'].some(
				host => parsed.hostname.toLowerCase().includes(host)
			);
			
			if (isLocalhost && window.location.hostname !== 'localhost') {
				console.warn('⚠️ Using localhost API in production environment');
			}
		}

		return parsed.toString();
	} catch (error) {
		throw new Error(`Invalid API URL "${url}": ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Get all available API endpoints for testing/fallback
 */
export function getAllApiEndpoints(): string[] {
	const config = getApiConfig();
	const endpoints = [config.baseUrl];
	
	// Add backup endpoints if different from current
	Object.values(API_ENDPOINTS).forEach(endpoint => {
		if (!endpoints.includes(endpoint) && endpoint !== config.baseUrl) {
			endpoints.push(endpoint);
		}
	});

	return endpoints;
}

/**
 * Test if an API endpoint is accessible
 */
export async function testApiEndpoint(baseUrl: string): Promise<boolean> {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000);
		
		const response = await fetch(`${baseUrl}/health`, {
			method: 'GET',
			signal: controller.signal,
			headers: {
				'Accept': 'application/json'
			}
		});
		
		clearTimeout(timeoutId);
		return response.ok;
	} catch (error) {
		console.debug(`API endpoint ${baseUrl} test failed:`, error);
		return false;
	}
}

// Export the current API config as default
export const API_CONFIG = getApiConfig();