import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
	value: {
		VITE_API_BASE: 'http://127.0.0.1:8000'
	}
});

// Mock fetch for API tests
(globalThis as any).fetch = vi.fn();
