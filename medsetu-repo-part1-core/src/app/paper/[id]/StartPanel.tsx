'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getName, loadAttempt, clearAttempt, newAttempt, saveAttempt } from '../../../lib/store';
import type { PaperMeta } from '../../../lib/types';

/**
 * The attempt panel on a paper page. The student's name comes from the
 * /start gate (stored for this tab) — there is no name field here any
 * more. "Attempt Test" creates the attempt and goes to the test window,
 * which opens on the exam instructions screen.
 */
export default function StartPanel({ meta }: { meta: PaperMeta }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phase, setPhase] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setName(getName());
    const a = loadAttempt(meta.paperId);
    setPhase(a ? a.phase : null);
    setReady(true);
  }, [meta.paperId]);

  const startFresh = () => {
    const n = getName().trim();
    if (!n) {
      router.replace(`/start/?next=${encodeURIComponent(`/paper/${meta.paperId}/`)}`);
      return;
    }
    clearAttempt(meta.paperId);
    saveAttempt(newAttempt(meta.paperId, n, meta.part1));
    router.push(`/paper/${meta.paperId}/test/`);
  };

  if (!ready) return <div className="h-24 animate-pulse rounded-xl bg-mist" aria-hidden />;

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
      <p className="text-sm text-inksoft">
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
            You have a completed attempt of this paper in this tab.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/paper/${meta.paperId}/analysis/`}
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
            An attempt of this paper is in progress in this tab
            {phase === 'break' ? ' — Part I is submitted, Part II is waiting.' : '.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/paper/${meta.paperId}/test/`}
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
            Part I ({meta.part1} questions · 150 minutes) begin.
          </p>
        </>
      )}
    </div>
  );
}
