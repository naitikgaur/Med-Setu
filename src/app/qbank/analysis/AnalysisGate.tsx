'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RequireName from '../../../components/RequireName';
import AnalysisView from '../../../components/AnalysisView';
import { loadQBankSession, qbankDescriptor } from '../../../lib/qbank';
import type { TestDescriptor } from '../../../lib/types';

/** Analysis of the current question-bank session (Exam mode). */
export default function AnalysisGate() {
  const [desc, setDesc] = useState<TestDescriptor | null | undefined>(undefined);

  useEffect(() => {
    const def = loadQBankSession();
    setDesc(def ? qbankDescriptor(def) : null);
  }, []);

  if (desc === undefined) {
    return (
      <div className="flex min-h-[38vh] items-center justify-center px-4 py-16">
        <p className="text-sm text-inksoft">Preparing your analysis…</p>
      </div>
    );
  }

  if (!desc) {
    return (
      <RequireName>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-ink">No question-bank session found</h1>
          <p className="mt-3 text-inksoft">
            Analysis appears here after you submit a question-bank set in Exam mode in this tab.
          </p>
          <Link href="/qbank/" className="mt-6 inline-block rounded-md bg-med px-6 py-3 font-semibold text-white hover:bg-med-deep">
            Go to the Question Bank
          </Link>
        </div>
      </RequireName>
    );
  }

  return (
    <RequireName>
      <AnalysisView desc={desc} />
    </RequireName>
  );
}
