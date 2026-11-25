'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import RequireName from '../../../components/RequireName';
import {
  getQBankSubject, loadProgress, loadQBankSubject, startQBankSession,
  subjectSet, topicSet,
} from '../../../lib/qbank';
import { getName } from '../../../lib/store';
import type { QBankData, QBankMode, Question } from '../../../lib/types';

const SIZES = [20, 50, 0] as const; // 0 = All

/**
 * One subject in the Question Bank: choose Practice or Exam mode and a set
 * size, then start the whole subject or a single topic. Sets are drawn
 * deterministically — a topic's questions in source order, a whole-subject
 * set interleaved across its topics.
 */
export default function SubjectPanel({ slug }: { slug: string }) {
  const router = useRouter();
  const meta = getQBankSubject(slug);
  const [data, setData] = useState<QBankData | null>(null);
  const [mode, setMode] = useState<QBankMode>('practice');
  const [size, setSize] = useState<number>(20);
  const [busy, setBusy] = useState('');
  const [progress, setProgress] = useState<{ attempted: number; correct: number } | null>(null);

  useEffect(() => {
    let alive = true;
    loadQBankSubject(slug).then((d) => { if (alive) setData(d); });
    const p = loadProgress()[slug];
    if (p) setProgress(p);
    return () => { alive = false; };
  }, [slug]);

  const name = getName();

  const start = (questions: Question[], topic: string | null, key: string) => {
    if (!meta || questions.length === 0) return;
    setBusy(key);
    const shown = questions.length;
    const heading = topic ? `${meta.name} — ${topic}` : `${meta.name} — full subject set`;
    startQBankSession({
      mode,
      scope: topic ? 'topic' : 'subject',
      questions,
      subjectSlug: slug,
      subjectName: meta.name,
      topic,
      heading,
      subline: `Question Bank · ${shown} questions · ${mode === 'practice' ? 'Practice mode' : 'Exam mode'}`,
    });
    router.push('/qbank/play/');
  };

  const sized = (all: Question[]) => (size === 0 ? all : all.slice(0, size));

  const subjectQuestions = useMemo(
    () => (data ? sized(subjectSet(data, size === 0 ? data.questions.length : size)) : []),
    [data, size],
  );

  if (!meta) return null;

  return (
    <RequireName>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-h1">{meta.name}</h1>
          <p className="mt-1.5 text-body2 text-inksoft">
            {meta.total.toLocaleString('en-IN')} questions · {meta.topics.length} topics · every question
            with its answer and explanation.
          </p>
        </div>
        {progress && progress.attempted > 0 && (
          <p className="rounded-md bg-med-soft/60 px-3.5 py-2 text-sm font-medium tabular-nums text-ink">
            This tab: {progress.attempted} checked · {progress.correct} correct (
            {Math.round((progress.correct / progress.attempted) * 1000) / 10}%)
          </p>
        )}
      </div>

      {/* Mode + size chooser */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-line bg-white px-5 py-4 shadow-card">
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Mode">
          <span className="text-sm font-semibold text-ink">Mode</span>
          {(['practice', 'exam'] as QBankMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3.5 py-2 text-sm font-semibold transition ${
                mode === m ? 'bg-med text-white' : 'border border-line text-ink hover:bg-mist'
              }`}
            >
              {m === 'practice' ? 'Practice mode' : 'Exam mode'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Set size">
          <span className="text-sm font-semibold text-ink">Set size</span>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={size === s}
              onClick={() => setSize(s)}
              className={`rounded-md px-3.5 py-2 text-sm font-semibold tabular-nums transition ${
                size === s ? 'bg-med text-white' : 'border border-line text-ink hover:bg-mist'
              }`}
            >
              {s === 0 ? 'All' : s}
            </button>
          ))}
        </div>
        <p className="w-full text-caption leading-relaxed text-inksoft">
          {mode === 'practice'
            ? 'Practice mode: check each answer as you go — the explanation appears straight away, and wrong answers are saved to My Mistakes.'
            : 'Exam mode: answers stay locked until you submit, in the exam window, then you get the full analysis with the 50% benchmark.'}
        </p>
      </div>

      {/* Whole subject */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-med-line bg-med-soft/50 px-5 py-4">
        <p className="text-sm text-ink">
          <strong>Whole subject:</strong>{' '}
          {size === 0
            ? `all ${meta.total.toLocaleString('en-IN')} questions, interleaved across every topic.`
            : `${Math.min(size, meta.total)} questions interleaved across every topic.`}
        </p>
        <button
          type="button"
          disabled={!data || busy !== ''}
          onClick={() => start(subjectQuestions, null, 'subject')}
          className="ml-auto rounded-md bg-med px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-med-deep disabled:opacity-50"
        >
          {busy === 'subject' ? 'Preparing…' : `Start ${meta.name} · ${mode === 'practice' ? 'Practice' : 'Exam'}`}
        </button>
      </div>

      {/* Topics */}
      <h2 className="mt-7 text-lg font-bold text-ink">Or practise a topic</h2>
      {!data ? (
        <p className="mt-3 text-sm text-inksoft">Loading the {meta.name} questions…</p>
      ) : (
        <div className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white shadow-card">
          {meta.topics.map((t) => {
            const n = size === 0 ? t.count : Math.min(size, t.count);
            return (
              <div key={t.name} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <p className="min-w-0 flex-1">
                  <span className="block truncate text-body2 font-semibold text-ink" title={t.name}>{t.name}</span>
                  <span className="text-caption tabular-nums text-inksoft">
                    {t.count} question{t.count === 1 ? '' : 's'}
                    {size !== 0 && t.count > size ? ` · this set takes the first ${n}` : ''}
                  </span>
                </p>
                <button
                  type="button"
                  disabled={busy !== ''}
                  onClick={() => start(sized(topicSet(data, t.name, size === 0 ? t.count : size)), t.name, t.name)}
                  className="rounded-md border border-med px-4 py-2 text-sm font-semibold text-med transition hover:bg-med hover:text-white disabled:opacity-50"
                >
                  {busy === t.name ? 'Preparing…' : `Start · ${n}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-4 text-caption leading-relaxed text-inksoft">
        A topic set takes its questions in the order they appear in the source compilation; a
        whole-subject set interleaves topics so the mix stays even. Nothing here leaves your device.
      </p>
    </RequireName>
  );
}
