import { ART_MANIFEST, type ArtRecord } from '$lib/data/artworkManifest';

function norm(s: string): string {
  try {
    return s
      .toLowerCase()
      .normalize('NFD')
      
      .replace(/\p{Diacritic}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return s.toLowerCase().replace(/\s+/g, ' ').trim();
  }
}

type Index = Map<string, ArtRecord[]>;
let TAG_INDEX: Index | null = null;
let DEFAULT_FILE = 'default.webp';

function buildIndex(): Index {
  const idx: Index = new Map();
  for (const rec of ART_MANIFEST) {
    if (rec.file.endsWith('default.webp')) DEFAULT_FILE = rec.file;
    for (const raw of rec.tags) {
      const t = norm(raw);
      const arr = idx.get(t) ?? [];
      arr.push(rec);
      idx.set(t, arr);
    }
  }
  return idx;
}

export function resolveArtwork(query: string | null | undefined): string {
  if (!TAG_INDEX) TAG_INDEX = buildIndex();
  const q = norm(query ?? '');
  if (!q) return `/art/${DEFAULT_FILE}`;

  // exact
  if (TAG_INDEX.has(q)) {
    const rec = TAG_INDEX.get(q)!.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
    return `/art/${rec.file}`;
  }

  // contains
  let best: { rec: ArtRecord; score: number } | null = null;
  for (const [tag, recs] of TAG_INDEX.entries()) {
    if (q.includes(tag)) {
      for (const rec of recs) {
        const score = (rec.weight ?? 0) + tag.length;
        if (!best || score > best.score) best = { rec, score };
      }
    }
  }
  if (best) return `/art/${best.rec.file}`;

  // region hints
  const regionMap: Record<string, string> = {
    'north america': 'nyc.webp',
    'south america': 'brazil.webp',
    europe: 'paris.webp',
    africa: 'africa.webp',
    oceania: 'australia.webp',
    asia: 'japan.webp',
    'middle east': 'middle-east.webp'
  };
  for (const [needle, file] of Object.entries(regionMap)) {
    if (q.includes(needle)) return `/art/${file}`;
  }

  return `/art/${DEFAULT_FILE}`;
}
