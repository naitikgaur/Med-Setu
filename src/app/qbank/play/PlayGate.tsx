'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RequireName from '../../../components/RequireName';
import Runner from '../../../components/Runner';
import PracticeRunner from '../../../components/PracticeRunner';
import { loadQBankSession, qbankDescriptor } from '../../../lib/qbank';
import { getName, loadAttempt, newAttempt, saveAttempt } from '../../../lib/store';
import type { QBankSessionDef } from '../../../lib/types';

/**
 * The question-bank play page: reads the session definition the student
 * just created (subject panel, mistakes, bookmarks or mixed set) and opens
 * it in Practice mode (PracticeRunner) or Exam mode (the shared Runner,
 * with a fresh attempt at 1 minute per question).
 */
export default function PlayGate() {
  const [def, setDef] = useState<QBankSessionDef | null | undefined>(undefined);

  useEffect(() => {
    const d = loadQBankSession();
    if (d && d.mode === 'exam') {
      // Create the attempt up front so the shared Runner finds it.
      if (!loadAttempt(d.id)) {
        saveAttempt(newAttempt(d.id, getName(), d.total, { part1Sec: d.total * 60, part2Sec: 0 }));
      }
    }
    setDef(d);
  }, []);

  if (def === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EDF2F7] px-4 py-16">
        <p className="text-sm text-inksoft">Loading your session…</p>
      </div>
    );
  }

  if (!def) {
    return (
      <RequireName>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-ink">No question-bank session in progress</h1>
          <p className="mt-3 leading-relaxed text-inksoft">
            Sessions are created from the Question Bank — pick a subject, your mistakes, your
            bookmarks or a mixed set, and the session opens here. Nothing is kept after this tab
            closes.
          </p>
          <Link href="/qbank/" className="mt-6 inline-block rounded-md bg-med px-6 py-3 font-semibold text-white hover:bg-med-deep">
            Go to the Question Bank
          </Link>
        </div>
      </RequireName>
    );
  }

  if (def.mode === 'practice') {
    return (
      <RequireName>
        <PracticeRunner def={def} />
      </RequireName>
    );
  }

  return (
    <RequireName>
      <Runner desc={qbankDescriptor(def)} />
    </RequireName>
  );
}
