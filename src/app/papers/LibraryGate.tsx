'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RequireName from '../../components/RequireName';
import PaperCard from '../../components/PaperCard';
import { PAPERS_META } from '../../lib/papers';
import { getName } from '../../lib/store';

/**
 * The entered-student library: the name gate (shared with the paper pages)
 * plus everything behind it — greeting, honesty note and the card grid.
 * All of it is rendered only after the gate has passed on the device, so
 * the exported /papers page itself carries no library at all.
 */
export default function LibraryGate() {
  const [name, setNameState] = useState('');
  useEffect(() => {
    setNameState(getName());
  }, []);

  return (
    <RequireName>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">PYP Tests</h1>
          <p className="mt-1.5 text-body2 text-inksoft">
            {name ? (
              <>
                Hi, <span className="font-semibold text-ink">{name}</span> — pick a paper to
                attempt. Your progress in this tab is kept as you go.
              </>
            ) : (
              'Pick a paper to attempt.'
            )}
          </p>
        </div>
        <Link
          href="/start/"
          className="rounded-md border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink shadow-card transition-colors hover:border-med-line hover:text-med-deep"
        >
          Change name
        </Link>
      </div>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-inksoft">
        NBEMS never releases official FMGE papers, so every paper here is a recall-based edition
        built from candidate memory and published compilations, labelled honestly. Where a source
        itself is short of 300, the mock is completed with questions from other years&apos; papers,
        and the card says how many were added.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAPERS_META.map((p) => (
          <PaperCard key={p.paperId} p={p} />
        ))}
      </div>
      <p className="mt-6 text-sm text-inksoft">
        12 papers · December 2020 – June 2026 · every paper a full 300 questions.
      </p>
    </RequireName>
  );
}
