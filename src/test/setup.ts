import '@testing-library/jest-dom';

// Mock environment variables for testing
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_BASE: 'http://127.0.0.1:8000'
  }
});

// Mock fetch for API tests
global.fetch = vi.fn();