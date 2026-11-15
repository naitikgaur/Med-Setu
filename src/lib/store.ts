import type { Attempt } from './types';

// Everything lives in sessionStorage, on the student's own device only.
// Nothing is ever sent over the network. Closing the tab clears it.

const NAME_KEY = 'medsetu-name';
const attemptKey = (paperId: string) => `medsetu-attempt-${paperId}`;

export function getName(): string {
  try { return sessionStorage.getItem(NAME_KEY) || ''; } catch { return ''; }
}
export function setName(name: string) {
  try { sessionStorage.setItem(NAME_KEY, name); } catch { /* private mode */ }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// A stored attempt is untrusted input: it can be edited, truncated, or left
// over from another version. Anything that does not match the Attempt shape
// is treated as "no attempt" rather than handed to components that would
// crash on it (security audit 2026-11-12).
function isValidAttempt(a: unknown, paperId: string): a is Attempt {
  if (!isPlainObject(a)) return false;
  if (a.paperId !== paperId) return false;
  if (typeof a.name !== 'string') return false;
  if (a.phase !== 'part1' && a.phase !== 'break' && a.phase !== 'part2' && a.phase !== 'done') return false;
  if (typeof a.current !== 'number' || !Number.isFinite(a.current)) return false;
  if (!isPlainObject(a.answers) || !isPlainObject(a.marked) || !isPlainObject(a.confidence)) return false;
  if (!isPlainObject(a.timeSec) || !isPlainObject(a.visits)) return false;
  if (!Array.isArray(a.changes)) return false;
  if (typeof a.startedAt !== 'number' || !Number.isFinite(a.startedAt)) return false;
  if (!(a.finishedAt === null || (typeof a.finishedAt === 'number' && Number.isFinite(a.finishedAt)))) return false;
  if (typeof a.part1Remaining !== 'number' || !Number.isFinite(a.part1Remaining)) return false;
  if (typeof a.part2Remaining !== 'number' || !Number.isFinite(a.part2Remaining)) return false;
  if (!(a.part1Summary === null || isPlainObject(a.part1Summary))) return false;
  return true;
}

export function loadAttempt(paperId: string): Attempt | null {
  try {
    const raw = sessionStorage.getItem(attemptKey(paperId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidAttempt(parsed, paperId) ? parsed : null;
  } catch { return null; }
}

export function saveAttempt(attempt: Attempt) {
  try { sessionStorage.setItem(attemptKey(attempt.paperId), JSON.stringify(attempt)); } catch { /* quota */ }
}

export function clearAttempt(paperId: string) {
  try { sessionStorage.removeItem(attemptKey(paperId)); } catch { /* noop */ }
}

export function newAttempt(
  paperId: string,
  name: string,
  part1Count: number,
  durations?: { part1Sec: number; part2Sec: number }
): Attempt {
  return {
    paperId,
    name,
    startedAt: Date.now(),
    finishedAt: null,
    phase: 'part1',
    current: 0,
    answers: {},
    marked: {},
    confidence: {},
    timeSec: {},
    visits: { 0: 1 },
    changes: [],
    part1Remaining: durations?.part1Sec ?? 150 * 60,
    part2Remaining: durations?.part2Sec ?? 150 * 60,
    part1Summary: null,
  };
}

export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export function fmtDuration(totalSec: number): string {
  const s = Math.round(totalSec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${r}s`;
  return `${r}s`;
}
