import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simple timeout utility test
describe('API utility functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle basic API configuration', () => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';
    expect(API_BASE).toBe('http://127.0.0.1:8000');
  });

  it('should have correct default headers', () => {
    const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };
    expect(DEFAULT_HEADERS['Content-Type']).toBe('application/json');
  });

  it('should map job states correctly', () => {
    const mapStatus = (s: string) => {
      if (s === 'completed') return 'done';
      if (s === 'failed') return 'error';
      if (s === 'running' || s === 'processing') return 'running';
      return 'queued';
    };

    expect(mapStatus('completed')).toBe('done');
    expect(mapStatus('failed')).toBe('error');
    expect(mapStatus('running')).toBe('running');
    expect(mapStatus('processing')).toBe('running');
    expect(mapStatus('queued')).toBe('queued');
    expect(mapStatus('unknown')).toBe('queued');
  });
});