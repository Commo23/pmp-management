/** Local sliding-window rate limit to avoid Gemini spam / bill spikes. */

const STORAGE_KEY = 'pmp-gemini-rate';
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 20;

interface RateState {
  timestamps: number[];
}

function load(): RateState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timestamps: [] };
    const parsed = JSON.parse(raw) as RateState;
    return { timestamps: Array.isArray(parsed.timestamps) ? parsed.timestamps : [] };
  } catch {
    return { timestamps: [] };
  }
}

function save(state: RateState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function checkGeminiRateLimit(): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const state = load();
  const recent = state.timestamps.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    const oldest = Math.min(...recent);
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000));
    return { ok: false, retryAfterSec };
  }
  return { ok: true };
}

export function recordGeminiRequest(): void {
  const now = Date.now();
  const state = load();
  const timestamps = [...state.timestamps.filter((t) => now - t < WINDOW_MS), now];
  save({ timestamps });
}

export function getGeminiRateLimitInfo(): { used: number; max: number; windowMin: number } {
  const now = Date.now();
  const recent = load().timestamps.filter((t) => now - t < WINDOW_MS);
  return { used: recent.length, max: MAX_REQUESTS, windowMin: WINDOW_MS / 60000 };
}
