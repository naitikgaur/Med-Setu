import metaJson from './qbank-meta.json';
import type {
  QBankData, QBankMeta, QBankPracticeState, QBankSessionDef, Question,
  TestData, TestDescriptor,
} from './types';

// Question bank (V3). Everything lives in sessionStorage on the student's
// own device — the bank itself ships as static per-subject JSON chunks,
// loaded only when a student opens that subject.

export const QBANK_META = metaJson as unknown as QBankMeta;

export function getQBankSubject(slug: string) {
  return QBANK_META.subjects.find((s) => s.slug === slug);
}

// Per-subject dynamic imports so each subject's chunk downloads only when
// a student actually practises that subject.
export async function loadQBankSubject(slug: string): Promise<QBankData> {
  switch (slug) {
    case 'anatomy': return (await import('../data/qbank/anatomy.json')).default as unknown as QBankData;
    case 'physiology': return (await import('../data/qbank/physiology.json')).default as unknown as QBankData;
    case 'biochemistry': return (await import('../data/qbank/biochemistry.json')).default as unknown as QBankData;
    case 'pathology': return (await import('../data/qbank/pathology.json')).default as unknown as QBankData;
    case 'microbiology': return (await import('../data/qbank/microbiology.json')).default as unknown as QBankData;
    case 'pharmacology': return (await import('../data/qbank/pharmacology.json')).default as unknown as QBankData;
    case 'forensic-medicine': return (await import('../data/qbank/forensic-medicine.json')).default as unknown as QBankData;
    case 'medicine': return (await import('../data/qbank/medicine.json')).default as unknown as QBankData;
    case 'surgery': return (await import('../data/qbank/surgery.json')).default as unknown as QBankData;
    case 'obstetrics-gynaecology': return (await import('../data/qbank/obstetrics-gynaecology.json')).default as unknown as QBankData;
    case 'community-medicine': return (await import('../data/qbank/community-medicine.json')).default as unknown as QBankData;
    case 'paediatrics': return (await import('../data/qbank/paediatrics.json')).default as unknown as QBankData;
    case 'ophthalmology': return (await import('../data/qbank/ophthalmology.json')).default as unknown as QBankData;
    case 'ent': return (await import('../data/qbank/ent.json')).default as unknown as QBankData;
    case 'anaesthesia': return (await import('../data/qbank/anaesthesia.json')).default as unknown as QBankData;
    case 'orthopaedics': return (await import('../data/qbank/orthopaedics.json')).default as unknown as QBankData;
    case 'dermatology': return (await import('../data/qbank/dermatology.json')).default as unknown as QBankData;
    case 'psychiatry': return (await import('../data/qbank/psychiatry.json')).default as unknown as QBankData;
    case 'radiology': return (await import('../data/qbank/radiology.json')).default as unknown as QBankData;
    default: throw new Error(`Unknown qbank subject: ${slug}`);
  }
}

/** Assemble the questions of a session, in play order, from subject chunks. */
export async function loadQBankQuestions(def: QBankSessionDef): Promise<Question[]> {
  const slugs = [...new Set(def.refs.map((r) => r.slug))];
  const byId = new Map<string, Question>();
  for (const slug of slugs) {
    const data = await loadQBankSubject(slug);
    for (const q of data.questions) if (q.bankId) byId.set(q.bankId, q);
  }
  const out: Question[] = [];
  def.refs.forEach((r, i) => {
    const q = byId.get(r.id);
    if (q) out.push({ ...q, n: i + 1 });
  });
  return out;
}

/** TestData for the shared Runner / AnalysisView (exam mode + analysis). */
export async function loadQBankTestData(sessionId: string): Promise<TestData> {
  const def = loadQBankSession();
  if (!def || def.id !== sessionId) throw new Error('Question-bank session not found');
  const questions = await loadQBankQuestions(def);
  return { questions, durationMin: def.total };
}

export function qbankDescriptor(def: QBankSessionDef): TestDescriptor {
  return {
    id: def.id,
    kind: 'qbank',
    heading: def.heading,
    subline: def.subline,
    total: def.total,
    part1Count: def.total,
    part2Count: 0,
    singlePart: true,
    part1Sec: def.total * 60,
    part2Sec: 0,
    part1Min: def.total,
    detailHref: '/qbank/',
    detailLabel: 'Go to the question bank',
    analysisHref: '/qbank/analysis/',
    backHref: '/qbank/',
    backLabel: 'Question Bank',
    addedCount: 0,
    passPct: null,
    singleSubject: def.subjectName,
    testLabel: null,
    benchmarkNote:
      'the FMGE pass proportion. This is a question-bank set, so there is no official pass; the 50% line is a benchmark only.',
  };
}

// ---------------------------------------------------------------- set building
/** Round-robin interleave of groups (deterministic; spans groups evenly). */
export function interleave<T>(groups: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < max; i++) for (const g of groups) if (i < g.length) out.push(g[i]);
  return out;
}

export function topicGroups(data: QBankData): Map<string, Question[]> {
  const map = new Map<string, Question[]>();
  for (const q of data.questions) {
    const t = q.topic || 'General';
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(q);
  }
  return map;
}

/** A subject-wide set: interleaved across the subject's topics. */
export function subjectSet(data: QBankData, size: number): Question[] {
  const groups = [...topicGroups(data).values()];
  return interleave(groups).slice(0, size);
}

/** A topic set: the topic's questions in source order, capped at size. */
export function topicSet(data: QBankData, topic: string, size: number): Question[] {
  return (topicGroups(data).get(topic) || []).slice(0, size);
}

// ---------------------------------------------------------------- session store
const SESSION_KEY = 'medsetu-qb-session';
const PRACTICE_KEY = 'medsetu-qb-practice';
const MISTAKES_KEY = 'medsetu-qb-mistakes';
const BOOKMARKS_KEY = 'medsetu-qb-bookmarks';
const PROGRESS_KEY = 'medsetu-qb-progress';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function newSessionId(): string {
  return `qb-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function saveQBankSession(def: QBankSessionDef) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(def)); } catch { /* quota */ }
}

export function loadQBankSession(): QBankSessionDef | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const d: unknown = JSON.parse(raw);
    if (!isPlainObject(d)) return null;
    if (d.v !== 1 || typeof d.id !== 'string' || typeof d.heading !== 'string') return null;
    if (d.mode !== 'practice' && d.mode !== 'exam') return null;
    if (!Array.isArray(d.refs) || d.refs.length === 0) return null;
    if (!d.refs.every((r) => isPlainObject(r) && typeof r.id === 'string' && typeof r.slug === 'string')) return null;
    if (typeof d.total !== 'number' || d.total !== d.refs.length) return null;
    return d as unknown as QBankSessionDef;
  } catch { return null; }
}

export function clearQBankSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
}

// ---------------------------------------------------------------- practice state
export function newPracticeState(sessionId: string): QBankPracticeState {
  return {
    sessionId, idx: 0, picked: {}, revealed: {}, timeSec: {}, visits: { 0: 1 },
    startedAt: Date.now(), finished: false,
  };
}

export function loadPracticeState(sessionId: string): QBankPracticeState | null {
  try {
    const raw = sessionStorage.getItem(PRACTICE_KEY);
    if (!raw) return null;
    const s: unknown = JSON.parse(raw);
    if (!isPlainObject(s) || s.sessionId !== sessionId) return null;
    if (typeof s.idx !== 'number' || !isPlainObject(s.picked) || !isPlainObject(s.revealed)) return null;
    if (!isPlainObject(s.timeSec) || !isPlainObject(s.visits)) return null;
    return s as unknown as QBankPracticeState;
  } catch { return null; }
}

export function savePracticeState(s: QBankPracticeState) {
  try { sessionStorage.setItem(PRACTICE_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

export function clearPracticeState() {
  try { sessionStorage.removeItem(PRACTICE_KEY); } catch { /* noop */ }
}

// ---------------------------------------------------------------- mistakes & bookmarks
export interface QBankRef { id: string; slug: string }

function loadRefs(key: string): QBankRef[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return [];
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v
      .filter((r): r is QBankRef => isPlainObject(r) && typeof r.id === 'string' && typeof r.slug === 'string')
      .slice(0, 5000);
  } catch { return []; }
}
function saveRefs(key: string, refs: QBankRef[]) {
  try { sessionStorage.setItem(key, JSON.stringify(refs.slice(0, 5000))); } catch { /* quota */ }
}

export function loadMistakes(): QBankRef[] { return loadRefs(MISTAKES_KEY); }
export function addMistake(ref: QBankRef) {
  const cur = loadMistakes();
  if (!cur.some((r) => r.id === ref.id)) saveRefs(MISTAKES_KEY, [...cur, ref]);
}
export function removeMistake(id: string) {
  saveRefs(MISTAKES_KEY, loadMistakes().filter((r) => r.id !== id));
}

export function loadBookmarks(): QBankRef[] { return loadRefs(BOOKMARKS_KEY); }
export function isBookmarked(id: string): boolean {
  return loadBookmarks().some((r) => r.id === id);
}
export function toggleBookmark(ref: QBankRef): boolean {
  const cur = loadBookmarks();
  if (cur.some((r) => r.id === ref.id)) {
    saveRefs(BOOKMARKS_KEY, cur.filter((r) => r.id !== ref.id));
    return false;
  }
  saveRefs(BOOKMARKS_KEY, [...cur, ref]);
  return true;
}

// ---------------------------------------------------------------- session progress
export type QBankProgress = Record<string, { attempted: number; correct: number }>;

export function loadProgress(): QBankProgress {
  try {
    const raw = sessionStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const v: unknown = JSON.parse(raw);
    if (!isPlainObject(v)) return {};
    const out: QBankProgress = {};
    for (const [k, val] of Object.entries(v)) {
      if (isPlainObject(val) && typeof val.attempted === 'number' && typeof val.correct === 'number') {
        out[k] = { attempted: val.attempted, correct: val.correct };
      }
    }
    return out;
  } catch { return {}; }
}

export function recordProgress(slug: string, wasCorrect: boolean) {
  const p = loadProgress();
  const cur = p[slug] || { attempted: 0, correct: 0 };
  cur.attempted += 1;
  if (wasCorrect) cur.correct += 1;
  p[slug] = cur;
  try { sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch { /* quota */ }
}

/** Build + store a session definition and return it. */
export function startQBankSession(args: {
  mode: QBankSessionDef['mode'];
  scope: QBankSessionDef['scope'];
  questions: Question[];
  subjectSlug: string | null;
  subjectName: string | null;
  topic: string | null;
  heading: string;
  subline: string;
}): QBankSessionDef {
  const refs = args.questions.map((q) => {
    if (!q.bankId || !q.subject) throw new Error('bank question without id/subject');
    const slug = QBANK_META.subjects.find((s) => s.name === q.subject)?.slug;
    if (!slug) throw new Error('bank question subject not in meta: ' + q.subject);
    return { id: q.bankId, slug };
  });
  const def: QBankSessionDef = {
    v: 1,
    id: newSessionId(),
    mode: args.mode,
    scope: args.scope,
    subjectSlug: args.subjectSlug,
    subjectName: args.subjectName,
    topic: args.topic,
    refs,
    total: refs.length,
    startedAt: Date.now(),
    heading: args.heading,
    subline: args.subline,
  };
  saveQBankSession(def);
  return def;
}

/** Build + store a session directly from stored refs (mistakes/bookmarks). */
export function startQBankSessionFromRefs(args: {
  mode: QBankSessionDef['mode'];
  scope: QBankSessionDef['scope'];
  refs: QBankRef[];
  heading: string;
  subline: string;
}): QBankSessionDef {
  const def: QBankSessionDef = {
    v: 1,
    id: newSessionId(),
    mode: args.mode,
    scope: args.scope,
    subjectSlug: null,
    subjectName: null,
    topic: null,
    refs: args.refs,
    total: args.refs.length,
    startedAt: Date.now(),
    heading: args.heading,
    subline: args.subline,
  };
  saveQBankSession(def);
  return def;
}
