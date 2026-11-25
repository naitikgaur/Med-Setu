'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RequireName from '../../components/RequireName';
import {
  QBANK_META, interleave, loadBookmarks, loadMistakes, loadProgress,
  loadQBankSession, loadQBankSubject, startQBankSession,
  startQBankSessionFromRefs, subjectSet,
} from '../../lib/qbank';
import { getName } from '../../lib/store';
import type { QBankProgress } from '../../lib/qbank';

/**
 * The Question Bank home (behind the name gate, like the rest of the
 * entered flow): session progress, My Mistakes and Bookmarks entries, a
 * mixed practice set, and the 19-subject grid with real counts.
 */
export default function QBankGate() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [progress, setProgress] = useState<QBankProgress>({});
  const [mistakes, setMistakes] = useState(0);
  const [bookmarks, setBookmarks] = useState(0);
  const [active, setActive] = useState<{ heading: string; mode: string; total: number } | null>(null);
  const [busy, setBusy] = useState('');

  useEffect(() => {
    setName(getName());
    setProgress(loadProgress());
    setMistakes(loadMistakes().length);
    setBookmarks(loadBookmarks().length);
    const def = loadQBankSession();
    if (def) setActive({ heading: def.heading, mode: def.mode, total: def.total });
  }, []);

  const totalAttempted = Object.values(progress).reduce((a, p) => a + p.attempted, 0);
  const totalCorrect = Object.values(progress).reduce((a, p) => a + p.correct, 0);

  const startMixed = async () => {
    setBusy('mixed');
    const lists = await Promise.all(
      QBANK_META.subjects.map(async (s) => subjectSet(await loadQBankSubject(s.slug), 60)),
    );
    const qs = interleave(lists).slice(0, 50);
    startQBankSession({
      mode: 'practice',
      scope: 'mixed',
      questions: qs,
      subjectSlug: null,
      subjectName: null,
      topic: null,
      heading: 'Mixed practice — all subjects',
      subline: 'Question Bank · 50 questions drawn across all 19 subjects',
    });
    router.push('/qbank/play/');
  };

  const startMistakes = () => {
    const refs = loadMistakes();
    if (!refs.length) return;
    startQBankSessionFromRefs({
      mode: 'practice',
      scope: 'mistakes',
      refs,
      heading: 'My Mistakes — replay',
      subline: `Question Bank · ${refs.length} question${refs.length === 1 ? '' : 's'} you answered wrong · a correct answer here clears each one`,
    });
    router.push('/qbank/play/');
  };

  const startBookmarks = () => {
    const refs = loadBookmarks();
    if (!refs.length) return;
    startQBankSessionFromRefs({
      mode: 'practice',
      scope: 'bookmarks',
      refs,
      heading: 'My Bookmarks — replay',
      subline: `Question Bank · ${refs.length} bookmarked question${refs.length === 1 ? '' : 's'}`,
    });
    router.push('/qbank/play/');
  };

  return (
    <RequireName>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ink">Question Bank</h2>
          <p className="mt-1.5 text-body2 text-inksoft">
            {name ? (
              <>
                Hi, <span className="font-semibold text-ink">{name}</span> — {QBANK_META.total.toLocaleString('en-IN')}{' '}
                questions across all 19 FMGE subjects, organised by topic, every one with its answer
                and explanation.
              </>
            ) : (
              `${QBANK_META.total.toLocaleString('en-IN')} questions across all 19 FMGE subjects.`
            )}
          </p>
          <p className="mt-1 text-sm text-inksoft">
            Mistakes, bookmarks and progress are kept only in this tab.
          </p>
        </div>
        <Link
          href="/start/"
          className="rounded-md border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-card transition-colors hover:border-med-line hover:text-med-deep"
        >
          Change name
        </Link>
      </div>

      {active && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-med-line bg-med-soft/50 px-5 py-4">
          <p className="text-sm text-ink">
            <strong>A session is in progress:</strong> {active.heading} ({active.total} questions,{' '}
            {active.mode === 'practice' ? 'Practice mode' : 'Exam mode'}).
          </p>
          <Link href="/qbank/play/" className="rounded-md bg-med px-4 py-2 text-sm font-semibold text-white hover:bg-med-deep">
            Continue the session
          </Link>
        </div>
      )}

      {/* Session strip: progress, mistakes, bookmarks, mixed */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-card">
          <h2 className="text-body2 font-bold text-ink">This tab&apos;s progress</h2>
          {totalAttempted > 0 ? (
            <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
              <strong className="tabular-nums text-ink">{totalAttempted}</strong> questions checked ·{' '}
              <strong className="tabular-nums text-ink">{totalCorrect}</strong> correct ·{' '}
              <strong className="tabular-nums text-ink">
                {Math.round((totalCorrect / totalAttempted) * 1000) / 10}%
              </strong>{' '}
              accuracy
            </p>
          ) : (
            <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
              Nothing practised yet in this tab. Your per-subject progress will appear here as you go.
            </p>
          )}
          <p className="mt-auto pt-3 text-xs text-inksoft">Kept only in this tab; closing it clears the slate.</p>
        </div>

        <div className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-card">
          <h2 className="text-body2 font-bold text-ink">My Mistakes</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
            {mistakes > 0 ? (
              <>
                <strong className="tabular-nums text-ink">{mistakes}</strong> question{mistakes === 1 ? '' : 's'} answered
                wrong so far. Replay them in Practice mode — a correct answer clears each one.
              </>
            ) : (
              'Questions you answer wrong — in either mode — collect here for revision. Nothing here yet.'
            )}
          </p>
          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={startMistakes}
              disabled={mistakes === 0}
              className="w-full rounded-md bg-med px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-med-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              Practise my mistakes
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-line bg-white p-5 shadow-card">
          <h2 className="text-body2 font-bold text-ink">My Bookmarks</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
            {bookmarks > 0 ? (
              <>
                <strong className="tabular-nums text-ink">{bookmarks}</strong> bookmarked question{bookmarks === 1 ? '' : 's'}.
                Replay them any time in Practice mode.
              </>
            ) : (
              'Tap ☆ Bookmark on any question — in Practice or Exam mode — and it will be waiting here.'
            )}
          </p>
          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={startBookmarks}
              disabled={bookmarks === 0}
              className="w-full rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
            >
              Replay bookmarks
            </button>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-med-line bg-med-deep p-5 text-white shadow-card">
          <h2 className="text-body2 font-bold">Mixed practice</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white/80">
            50 questions drawn across all 19 subjects, topic by topic — the closest thing to the real
            paper&apos;s mix, one question at a time.
          </p>
          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={startMixed}
              disabled={busy === 'mixed'}
              className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-bold text-med-deep transition hover:bg-med-soft disabled:opacity-50"
            >
              {busy === 'mixed' ? 'Preparing your set…' : 'Start mixed practice · 50'}
            </button>
          </div>
        </div>
      </div>

      {/* Subject grid */}
      <h2 className="mt-8 text-xl font-bold text-ink">Practise by subject</h2>
      <p className="mt-1 text-sm text-inksoft">
        Open a subject for its topics, or start a whole-subject set. Counts are the real bank counts.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QBANK_META.subjects.map((s) => {
          const p = progress[s.slug];
          return (
            <Link
              key={s.slug}
              href={`/qbank/${s.slug}/`}
              className="group flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition hover:border-med-line hover:shadow-lift"
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-base font-bold text-ink group-hover:text-med-deep">{s.name}</span>
                <span className="text-sm font-bold tabular-nums text-med">{s.total.toLocaleString('en-IN')}</span>
              </span>
              <span className="mt-1 text-caption text-inksoft">
                {s.topics.length} topic{s.topics.length === 1 ? '' : 's'} · questions with explanations
              </span>
              {p && p.attempted > 0 && (
                <span className="mt-2 text-caption font-medium tabular-nums text-ink">
                  This tab: {p.attempted} checked · {p.correct} correct ({Math.round((p.correct / p.attempted) * 1000) / 10}%)
                </span>
              )}
              <span className="mt-auto pt-3 text-sm font-semibold text-med">
                Open {s.name} <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          );
        })}
      </div>

      <p className="mt-6 max-w-3xl text-sm leading-relaxed text-inksoft">
        About the questions: the bank is compiled from published FMGE and other entrance-exam
        compilations and is organised by subject and topic for practice. Most questions carry their
        figure with them; where a figure could not be included, the question says so honestly rather
        than guessing at it.
      </p>
    </RequireName>
  );
}
