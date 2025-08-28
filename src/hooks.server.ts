import type { Handle } from '@sveltejs/kit';
import { CSP_HEADERS, SECURITY_HEADERS } from '$lib/utils/security';

export const handle: Handle = async ({ event, resolve }) => {
	// Apply security headers to all responses
	const response = await resolve(event);

	// Add Content Security Policy
	response.headers.set('Content-Security-Policy', CSP_HEADERS['Content-Security-Policy']);

	// Add other security headers
	Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
		response.headers.set(key, value);
	});

	// Add HSTS header in production
	if (process.env.NODE_ENV === 'production') {
		response.headers.set(
			'Strict-Transport-Security',
			'max-age=31536000; includeSubDomains; preload'
		);
	}

	return response;
};
