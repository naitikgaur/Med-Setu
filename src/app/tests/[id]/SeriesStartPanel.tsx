'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getName, loadAttempt, clearAttempt, newAttempt, saveAttempt } from '../../../lib/store';
import type { SeriesTestMeta } from '../../../lib/types';

/**
 * The attempt panel for one grand test — mirrors the subject tests'
 * StartPanel: the name comes from the /start gate; "Attempt Test"
 * creates the attempt and goes to the test window, which opens on the
 * exam instructions screen.
 */
export default function SeriesStartPanel({ test }: { test: SeriesTestMeta }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const testPath = `/tests/${test.testId}`;

  useEffect(() => {
    setName(getName());
    const a = loadAttempt(test.testId);
    setPhase(a ? a.phase : null);
    setReady(true);
  }, [test.testId]);

  const startFresh = () => {
    const n = getName().trim();
    if (!n) {
      router.replace(`/start/?next=${encodeURIComponent(testPath + '/')}`);
      return;
    }
    clearAttempt(test.testId);
    saveAttempt(newAttempt(test.testId, n, 150));
    router.push(`${testPath}/test/`);
  };

  if (!ready) return <div className="h-24 animate-pulse rounded-xl bg-mist" aria-hidden />;

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">{test.title}</h2>
        <p className="text-sm tabular-nums text-inksoft">
          {test.total} questions · two parts of 150 · 150 minutes a part · +1 / 0, no negative marking
        </p>
      </div>
      <p className="mt-2 text-sm text-inksoft">
        Attempting as{' '}
        <span className="font-semibold text-ink">{name || '…'}</span>
        {' · '}
        <Link href="/start/" className="font-semibold text-med hover:underline">
          change name
        </Link>
      </p>

      {phase === 'done' ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-lg bg-med-soft px-4 py-3 text-sm font-medium text-med-deep">
            You have a completed attempt of this test in this tab.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${testPath}/analysis/`}
              className="rounded-md bg-med px-5 py-2.5 font-semibold text-white hover:bg-med-deep"
            >
              View analysis
            </Link>
            <button
              type="button"
              onClick={startFresh}
              className="rounded-md border border-med px-5 py-2.5 font-semibold text-med hover:bg-med-soft"
            >
              Start fresh
            </button>
          </div>
        </div>
      ) : phase ? (
        <div className="mt-4 space-y-3">
          <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm font-medium text-accent-deep">
            An attempt of this test is in progress in this tab.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${testPath}/test/`}
              className="rounded-md bg-med px-5 py-2.5 font-semibold text-white hover:bg-med-deep"
            >
              Resume test
            </Link>
            <button
              type="button"
              onClick={startFresh}
              className="rounded-md border border-accent px-5 py-2.5 font-semibold text-accent-deep hover:bg-accent-soft"
            >
              Discard &amp; start fresh
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={startFresh}
            className="mt-4 w-full rounded-md bg-med px-6 py-3 text-base font-bold text-white transition-colors hover:bg-med-deep sm:w-auto sm:px-8"
          >
            Attempt Test
          </button>
          <p className="mt-2 text-xs leading-relaxed text-inksoft">
            You will see the exam instructions first and confirm you have read them; only then does
            the test begin ({test.total} questions · two parts of 150, 150 minutes a part, with a
            break between them — exactly like the real FMGE).
          </p>
        </>
      )}
    </div>
  );
}
