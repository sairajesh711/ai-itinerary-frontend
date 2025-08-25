// src/lib/api.ts
import type { ItineraryRequest, ItineraryResponse } from './types';

const BASE_URL =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://127.0.0.1:8000';

function withTimeout<T>(p: Promise<T>, ms: number, label = 'Request') {
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

// POST to create a job
export async function postItinerary(payload: ItineraryRequest): Promise<{ job_id: string }> {
  const url = `${BASE_URL}/jobs/itinerary`;
  const res = await withTimeout(
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }),
    20_000,
    'Create job'
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Create job failed (${res.status}): ${text}`);
  }
  return res.json();
}

// GET job status
export async function fetchJob(jobId: string): Promise<any> {
  const url = `${BASE_URL}/jobs/${jobId}`;
  const res = await withTimeout(fetch(url, { method: 'GET' }), 15_000, 'Poll job');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Poll failed (${res.status}): ${text}`);
  }
  return res.json();
}

/**
 * Wait for job completion with calm backoff and progress streaming.
 * - Starts at ~1.8s, backs off gently up to 5s.
 * - Calls onSteps() when the server sends new step messages.
 * - Uses a deadline to avoid infinite waits.
 */
export async function waitForJob<T = ItineraryResponse>(
  jobId: string,
  opts: {
    onSteps?: (msgs: string[]) => void;
    startIntervalMs?: number; // default 1800
    maxIntervalMs?: number; // default 5000
    deadlineMs?: number; // default 6 min
  } = {}
): Promise<T> {
  const seenSeq = new Set<number>();
  const startInterval = opts.startIntervalMs ?? 1800;
  const maxInterval = opts.maxIntervalMs ?? 5000;
  const deadline = Date.now() + (opts.deadlineMs ?? 6 * 60_000);

  let interval = startInterval;

  // first immediate fetch so UI updates quickly
  while (true) {
    const status = await fetchJob(jobId);

    // server shape assumed:
    // { status: "pending"|"running"|"done"|"error", steps: [{seq, msg, ts?}], result?, error? }
    const newMsgs: string[] = [];
    const steps = Array.isArray(status?.steps) ? status.steps : [];
    for (const step of steps) {
      if (typeof step?.seq === 'number' && !seenSeq.has(step.seq)) {
        seenSeq.add(step.seq);
        if (typeof step?.msg === 'string' && step.msg.trim()) newMsgs.push(step.msg.trim());
      }
    }
    if (newMsgs.length && opts.onSteps) opts.onSteps(newMsgs);

    if (status?.status === 'done') return status.result as T;
    if (status?.status === 'error') throw new Error(status?.error || 'Job failed');

    if (Date.now() > deadline) throw new Error('Timed out waiting for job');

    await new Promise((r) => setTimeout(r, interval));
    // gentle backoff up to 5s
    interval = Math.min(Math.round(interval * 1.25), maxInterval);
  }
}
