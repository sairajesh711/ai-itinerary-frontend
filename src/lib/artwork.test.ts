import { describe, it, expect } from 'vitest';
import { resolveArtwork } from './artwork';

describe('artwork resolution', () => {
  it('returns default artwork for empty/null/undefined input', () => {
    expect(resolveArtwork('')).toEqual({ src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork(null)).toEqual({ src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork(undefined)).toEqual({ src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork('   ')).toEqual({ src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 });
  });

  it('resolves major cities correctly', () => {
    expect(resolveArtwork('Paris')).toEqual({ src: '/art/paris.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork('london')).toEqual({ src: '/art/london.webp', opacity: 0.14, nudgeVw: -2 });
    expect(resolveArtwork('Tokyo')).toEqual({ src: '/art/japan.webp', opacity: 0.14, nudgeVw: -2 });
    expect(resolveArtwork('rome')).toEqual({ src: '/art/italy.webp', opacity: 0.14, nudgeVw: -3 });
  });

  it('resolves countries correctly', () => {
    expect(resolveArtwork('France')).toEqual({ src: '/art/paris.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork('Japan')).toEqual({ src: '/art/japan.webp', opacity: 0.14, nudgeVw: -2 });
    expect(resolveArtwork('Italy')).toEqual({ src: '/art/italy.webp', opacity: 0.14, nudgeVw: -3 });
    expect(resolveArtwork('Brazil')).toEqual({ src: '/art/brazil.webp', opacity: 0.14, nudgeVw: -6 });
  });

  it('resolves regions correctly', () => {
    expect(resolveArtwork('Southeast Asia')).toEqual({ src: '/art/southeast.webp', opacity: 0.14, nudgeVw: -3 });
    expect(resolveArtwork('Middle East')).toEqual({ src: '/art/middle-east.webp', opacity: 0.14, nudgeVw: -4 });
    expect(resolveArtwork('Central Asia')).toEqual({ src: '/art/central-asia.webp', opacity: 0.14, nudgeVw: -3 });
  });

  it('handles partial matches correctly', () => {
    expect(resolveArtwork('I want to visit Paris next month')).toEqual({ src: '/art/paris.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork('Trip to Japan and Korea')).toEqual({ src: '/art/japan.webp', opacity: 0.14, nudgeVw: -2 });
  });

  it('handles case insensitive matching', () => {
    expect(resolveArtwork('PARIS')).toEqual({ src: '/art/paris.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork('London')).toEqual({ src: '/art/london.webp', opacity: 0.14, nudgeVw: -2 });
    expect(resolveArtwork('tOkYo')).toEqual({ src: '/art/japan.webp', opacity: 0.14, nudgeVw: -2 });
  });

  it('falls back to regional defaults for generic terms', () => {
    expect(resolveArtwork('somewhere in Europe')).toEqual({ src: '/art/eastern-europe.webp', opacity: 0.14, nudgeVw: -3 });
    expect(resolveArtwork('America')).toEqual({ src: '/art/nyc.webp', opacity: 0.14, nudgeVw: -2 });
    expect(resolveArtwork('USA')).toEqual({ src: '/art/nyc.webp', opacity: 0.14, nudgeVw: -2 });
    expect(resolveArtwork('Middle East region')).toEqual({ src: '/art/middle-east.webp', opacity: 0.14, nudgeVw: -4 });
  });

  it('returns default for unrecognized locations', () => {
    expect(resolveArtwork('Mars')).toEqual({ src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork('Atlantis')).toEqual({ src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 });
    expect(resolveArtwork('Random City Name')).toEqual({ src: '/art/default.webp', opacity: 0.14, nudgeVw: 0 });
  });

  it('handles special location aliases', () => {
    expect(resolveArtwork('Taj Mahal')).toEqual({ src: '/art/taj.webp', opacity: 0.14, nudgeVw: -5 });
    expect(resolveArtwork('visiting the taj')).toEqual({ src: '/art/taj.webp', opacity: 0.14, nudgeVw: -5 });
    expect(resolveArtwork('New York City')).toEqual({ src: '/art/nyc.webp', opacity: 0.14, nudgeVw: -2 });
    expect(resolveArtwork('NYC')).toEqual({ src: '/art/nyc.webp', opacity: 0.14, nudgeVw: -2 });
  });
});