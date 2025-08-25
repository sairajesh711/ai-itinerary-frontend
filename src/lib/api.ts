// src/lib/api.ts
import type { ItineraryRequest, ItineraryResponse } from './types';

export type JobState = 'idle' | 'queued' | 'running' | 'done' | 'error';

const API_BASE =
  import.meta.env.VITE_API_BASE?.toString().replace(/\/$/, '') || 'http://127.0.0.1:8000';

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

async function withTimeout<T>(p: Promise<T>, ms: number, label = 'request'): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then((v) => {
      clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Create an itinerary job and poll until it's completed.
 * Returns the final ItineraryResponse.
 *
 * The backend is expected to expose:
 *  - POST  /jobs/itinerary -> { job_id: string }
 *  - GET   /jobs/:id       -> { status: 'queued'|'running'|'completed'|'failed', result?: ItineraryResponse, error?: string }
 *
 * We’re resilient to slight shape differences: 'result'|'data'|'itinerary'.
 */
export async function postItinerary(
  payload: ItineraryRequest,
  onStatus?: (s: JobState) => void
): Promise<ItineraryResponse> {
  onStatus?.('queued');

  // 1) Create job
  const createRes = await withTimeout(
    fetch(`${API_BASE}/jobs/itinerary`, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(payload)
    }),
    15000,
    'create itinerary job'
  );

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => '');
    throw new Error(`Job create failed (${createRes.status}): ${text}`);
  }
  const createJson = (await createRes.json()) as { job_id?: string; id?: string };
  const jobId = createJson.job_id || createJson.id;
  if (!jobId) throw new Error('Job create succeeded but no job_id was returned');

  // 2) Poll
  let lastEmitted: JobState = 'queued';
  const POLL_MS = 1400;             // smooth pacing for the loader
  const MAX_WAIT_MS = 120000;       // hard cap 2 minutes (adjust as needed)
  const started = Date.now();

  // helper to map backend status to JobState
  const mapStatus = (s: string): JobState => {
    if (s === 'completed') return 'done';
    if (s === 'failed') return 'error';
    if (s === 'running' || s === 'processing') return 'running';
    return 'queued';
  };

  while (true) {
    if (Date.now() - started > MAX_WAIT_MS) {
      onStatus?.('error');
      throw new Error('Job timed out while polling');
    }

    const stRes = await withTimeout(
      fetch(`${API_BASE}/jobs/${jobId}`, { method: 'GET' }),
      10000,
      'poll itinerary job'
    );

    if (!stRes.ok) {
      const text = await stRes.text().catch(() => '');
      onStatus?.('error');
      throw new Error(`Job status error (${stRes.status}): ${text}`);
    }

    const st = await stRes.json();
    const backendStatus: string =
      st.status || st.state || st.job_status || 'running';

    const uiState = mapStatus(backendStatus);
    if (uiState !== lastEmitted) {
      lastEmitted = uiState;
      onStatus?.(uiState);
    }

    if (uiState === 'done') {
      const result: ItineraryResponse =
        st.result || st.data || st.itinerary;
      if (!result) {
        onStatus?.('error');
        throw new Error('Job completed but no itinerary result was found in payload');
      }
      onStatus?.('done');
      return result;
    }

    if (uiState === 'error') {
      const msg = st.error || 'Job failed';
      onStatus?.('error');
      throw new Error(msg);
    }

    await sleep(POLL_MS);
  }
}
