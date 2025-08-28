/**
 * Security utilities for preventing XSS attacks and sanitizing user input
 */

/**
 * HTML-escape a string to prevent XSS attacks
 * Escapes: < > & " ' / characters
 */
export function escapeHtml(unsafe: string): string {
	if (typeof unsafe !== 'string') {
		return String(unsafe);
	}

	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text for safe insertion into HTML attributes
 */
export function sanitizeAttribute(value: string | number): string {
	const str = String(value);
	return str.replace(/[<>"'&]/g, '');
}

/**
 * Create a safe DOM element with escaped content
 */
export function createSafeElement(
	tagName: string,
	textContent: string,
	className?: string
): HTMLElement {
	const element = document.createElement(tagName);
	element.textContent = textContent; // textContent automatically escapes
	if (className) {
		element.className = className;
	}
	return element;
}

/**
 * Validate and sanitize URL to prevent XSS through href/src attributes
 */
export function sanitizeUrl(url: string): string {
	const blockedProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
	const urlLower = url.toLowerCase().trim();

	for (const protocol of blockedProtocols) {
		if (urlLower.startsWith(protocol)) {
			return ''; // Return empty string for blocked protocols
		}
	}

	return url;
}

/**
 * Validate API key format (basic validation)
 */
export function validateApiKey(key: string): boolean {
	// MapTiler API keys are typically 32+ characters of alphanumeric + some special chars
	if (!key || typeof key !== 'string') return false;
	if (key.length < 20) return false;

	// Only allow alphanumeric, hyphens, and underscores
	return /^[a-zA-Z0-9\-_]+$/.test(key);
}

/**
 * Sanitize user input for activity/location names
 */
export function sanitizeUserInput(input: string, maxLength: number = 200): string {
	if (typeof input !== 'string') return '';

	// Remove potential HTML/script tags
	let sanitized = input.replace(/<[^>]*>/g, '');

	// Remove potentially dangerous characters but keep basic punctuation
	sanitized = sanitized.replace(/[<>{}[\]\\`|]/g, '');

	// Trim and limit length
	sanitized = sanitized.trim().substring(0, maxLength);

	return sanitized;
}

/**
 * Rate limiting helper - tracks API calls per IP/session
 */
class RateLimiter {
	private attempts = new Map<string, { count: number; resetTime: number }>();
	private readonly maxAttempts: number;
	private readonly windowMs: number;

	constructor(maxAttempts = 10, windowMs = 60000) {
		// 10 requests per minute default
		this.maxAttempts = maxAttempts;
		this.windowMs = windowMs;
	}

	isAllowed(identifier: string): boolean {
		const now = Date.now();
		const record = this.attempts.get(identifier);

		if (!record || now > record.resetTime) {
			// First request or window expired
			this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
			return true;
		}

		if (record.count >= this.maxAttempts) {
			return false; // Rate limit exceeded
		}

		record.count++;
		return true;
	}

	reset(identifier: string): void {
		this.attempts.delete(identifier);
	}
}

export const apiRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

/**
 * Get environment-specific CSP headers
 */
function getCSPHeaders() {
	const isDev = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : false;

	const baseDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' https://api.maptiler.com https://unpkg.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.maptiler.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https: blob:",
		"worker-src 'self' blob:",
		"child-src 'none'",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'"
	];

	// Add environment-specific connect-src rules
	const connectSrc = isDev
		? "connect-src 'self' https://api.maptiler.com http://127.0.0.1:8000 http://localhost:8000 wss: ws:"
		: "connect-src 'self' https://api.maptiler.com https: wss: ws:";

	return baseDirectives.concat([connectSrc]).join('; ');
}

/**
 * Content Security Policy headers for additional protection
 */
export const CSP_HEADERS = {
	'Content-Security-Policy': getCSPHeaders()
};

/**
 * Secure headers for API responses
 */
export const SECURITY_HEADERS = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'X-XSS-Protection': '1; mode=block',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
