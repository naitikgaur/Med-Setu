import type { Analysis, PerQ } from './analysis';
import { LETTERS } from './analysis';
import type { Attempt, TestData } from './types';
import { fmtClock } from './store';

/**
 * Attempt classification — MedSetu's published rules (the definitions
 * adopted in the analysis model this platform was built on). Every
 * label is deterministic, computed from the student's own logged time,
 * visits and answer changes, and explains itself in plain words.
 *
 *   Perfect   correct, inside the allotted time per question
 *   Overtime  answered correctly but slower than the allotment
 *   Confused  time over the allotment spent without answering
 *   Wasted    wrong in under 30% of the allotment (a rushed guess)
 *   Painful   wrong after real effort — at least 75% of the allotment
 *             spent, or 3+ visits, or an answer change (checked before
 *             Overtime, so a slow wrong answer is Painful, not Overtime)
 *
 * The allotment is the test's total time divided by its questions —
 * 60 seconds a question on a full FMGE paper or a grand test.
 */
export type QClass = 'perfect' | 'overtime' | 'confused' | 'wasted' | 'painful';

export interface ClassifiedQ {
  row: PerQ;
  cls: QClass | null;
  reason: string | null;
}

export const CLASS_ORDER: QClass[] = ['perfect', 'overtime', 'painful', 'wasted', 'confused'];

export const CLASS_META: Record<QClass, { label: string; blurb: string }> = {
  perfect: {
    label: 'Perfect',
    blurb: 'Correct, inside the allotted time. This is the habit to repeat.',
  },
  overtime: {
    label: 'Overtime',
    blurb: 'Right answer, but slower than the allotted time — marks earned at the cost of other questions.',
  },
  painful: {
    label: 'Painful',
    blurb: 'Wrong after real effort — long time, repeat visits or an answer change — and the mark still went.',
  },
  wasted: {
    label: 'Wasted',
    blurb: 'Wrong in under 30% of the allotted time: a rushed guess. Slow down, or skip cleanly.',
  },
  confused: {
    label: 'Confused',
    blurb: 'Time over the allotment spent without answering — the question held you without paying you.',
  },
};

export function classifyPerQ(a: Analysis): ClassifiedQ[] {
  const allotted = a.total ? a.timeDetail.availableSec / a.total : 60;
  const all = fmtClock(allotted);
  return a.perQ.map((row) => {
    const t = row.timeSec;
    if (row.status === 'correct') {
      if (t <= allotted)
        return { row, cls: 'perfect' as const, reason: `Correct in ${fmtClock(t)} — inside the ${all} allotted per question.` };
      return { row, cls: 'overtime' as const, reason: `Correct, but it took ${fmtClock(t)} against ${all} allotted.` };
    }
    if (row.status === 'wrong') {
      if (t < 0.3 * allotted)
        return { row, cls: 'wasted' as const, reason: `Wrong in ${fmtClock(t)} — under 30% of the ${all} allotted: a rushed guess.` };
      if (t >= 0.75 * allotted || row.visits >= 3 || (row.change && row.change.count >= 1)) {
        const bits: string[] = [];
        if (t >= 0.75 * allotted) bits.push(`you spent ${fmtClock(t)}`);
        if (row.visits >= 3) bits.push(`you visited it ${row.visits} times`);
        if (row.change && row.change.count >= 1) bits.push('you changed your answer');
        return { row, cls: 'painful' as const, reason: `Wrong after real effort — ${bits.join(', ')}.` };
      }
      return { row, cls: null, reason: null };
    }
    if (t > allotted)
      return { row, cls: 'confused' as const, reason: `You spent ${fmtClock(t)} here — over the ${all} allotted — and still left it unanswered.` };
    return { row, cls: null, reason: null };
  });
}

// ---- Test Breakdown (MathonGo Performance Analysis shape) -------------------

export interface BreakdownRow {
  subject: string;
  total: number;
  score: number;
  correct: number;
  wrong: number;
  notAttempted: number; // visited, left unanswered
  notVisited: number; // never opened
}

export function breakdownRows(a: Analysis): { overall: BreakdownRow; rows: BreakdownRow[] } {
  const mk = (subject: string, rows: PerQ[]): BreakdownRow => ({
    subject,
    total: rows.length,
    score: rows.filter((r) => r.status === 'correct').length,
    correct: rows.filter((r) => r.status === 'correct').length,
    wrong: rows.filter((r) => r.status === 'wrong').length,
    notAttempted: rows.filter((r) => r.status === 'skipped' && r.visits > 0).length,
    notVisited: rows.filter((r) => r.visits === 0).length,
  });
  const bySubj = new Map<string, PerQ[]>();
  for (const r of a.perQ) {
    if (!r.subject) continue;
    if (!bySubj.has(r.subject)) bySubj.set(r.subject, []);
    bySubj.get(r.subject)!.push(r);
  }
  return { overall: mk('Overall', a.perQ), rows: [...bySubj.values()].map((rs) => mk(rs[0].subject!, rs)) };
}

// ---- Topic analysis ----------------------------------------------------------

export interface TopicRow {
  topic: string;
  subject: string | null;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number; // of attempted
}

export function topicRows(paper: TestData, a: Analysis): TopicRow[] {
  const by = new Map<string, { topic: string; subject: string | null; rows: PerQ[] }>();
  paper.questions.forEach((q, i) => {
    if (!q.topic) return;
    const key = `${q.subject ?? ''}||${q.topic}`;
    if (!by.has(key)) by.set(key, { topic: q.topic, subject: q.subject, rows: [] });
    by.get(key)!.rows.push(a.perQ[i]);
  });
  return [...by.values()]
    .map(({ topic, subject, rows }) => {
      const attempted = rows.filter((r) => r.status !== 'skipped').length;
      const correct = rows.filter((r) => r.status === 'correct').length;
      return {
        topic,
        subject,
        total: rows.length,
        correct,
        wrong: rows.filter((r) => r.status === 'wrong').length,
        skipped: rows.filter((r) => r.status === 'skipped').length,
        accuracy: attempted ? Math.round((correct / attempted) * 1000) / 10 : 0,
      };
    })
    .sort((x, y) => y.wrong - x.wrong || x.accuracy - y.accuracy);
}

// ---- Question journey ---------------------------------------------------------

export interface JourneyChange {
  q: number; // 1-based question number
  from: string;
  to: string;
  effect: 'gained' | 'lost' | 'neutral';
}

export function journeyChanges(attempt: Attempt, paper: TestData): JourneyChange[] {
  return attempt.changes.map((c) => {
    const correct = paper.questions[c.q]?.correct;
    const wasRight = c.from === correct;
    const isRight = c.to === correct;
    return {
      q: c.q + 1,
      from: LETTERS[c.from] ?? '?',
      to: LETTERS[c.to] ?? '?',
      effect: isRight && !wasRight ? 'gained' : wasRight && !isRight ? 'lost' : 'neutral',
    };
  });
}
