import { describe, it, expect } from 'vitest';
import { fmtTime, moneyRange } from './format';

describe('time formatting', () => {
  it('formats valid time strings correctly', () => {
    expect(fmtTime('09:30:00')).toBe('09:30');
    expect(fmtTime('14:45:30')).toBe('14:45');
    expect(fmtTime('00:00:00')).toBe('00:00');
    expect(fmtTime('23:59:59')).toBe('23:59');
  });

  it('handles empty/null/undefined time', () => {
    expect(fmtTime('')).toBe('');
    expect(fmtTime(null)).toBe('');
    expect(fmtTime(undefined)).toBe('');
  });

  it('handles time strings without seconds', () => {
    expect(fmtTime('09:30')).toBe('09:30');
    expect(fmtTime('14:45')).toBe('14:45');
  });

  it('handles short time strings', () => {
    expect(fmtTime('9:3')).toBe('9:3');
    expect(fmtTime('1:2:3')).toBe('1:2:3'); // slice(0,5) keeps first 5 chars including the seconds
  });
});

describe('money range formatting', () => {
  it('formats single amount correctly', () => {
    expect(moneyRange({ currency: 'USD', amount_min: 50, amount_max: 50 })).toBe('USD 50');
    expect(moneyRange({ currency: 'EUR', amount_min: 25 })).toBe('EUR 25');
    expect(moneyRange({ currency: 'GBP', amount_max: 75 })).toBe('GBP 75');
  });

  it('formats range correctly', () => {
    expect(moneyRange({ currency: 'USD', amount_min: 20, amount_max: 50 })).toBe('USD 20–50');
    expect(moneyRange({ currency: 'EUR', amount_min: 10, amount_max: 100 })).toBe('EUR 10–100');
  });

  it('handles missing amounts gracefully', () => {
    expect(moneyRange({ currency: 'USD' })).toBe('USD');
    expect(moneyRange({ currency: 'EUR', amount_min: null, amount_max: null })).toBe('EUR');
  });

  it('handles empty/null input', () => {
    expect(moneyRange()).toBe('');
    expect(moneyRange(undefined)).toBe('');
  });

  it('handles missing currency', () => {
    expect(moneyRange({ currency: '', amount_min: 50 })).toBe(' 50');
    expect(moneyRange({ amount_min: 50 } as any)).toBe(' 50');
  });

  it('handles zero amounts', () => {
    expect(moneyRange({ currency: 'USD', amount_min: 0, amount_max: 50 })).toBe('USD 0–50');
    expect(moneyRange({ currency: 'USD', amount_min: 0, amount_max: 0 })).toBe('USD 0');
  });

  it('handles negative amounts', () => {
    expect(moneyRange({ currency: 'USD', amount_min: -10, amount_max: 50 })).toBe('USD -10–50');
  });

  it('swaps min/max when only one is provided', () => {
    expect(moneyRange({ currency: 'USD', amount_min: 50 })).toBe('USD 50');
    expect(moneyRange({ currency: 'USD', amount_max: 75 })).toBe('USD 75');
  });
});