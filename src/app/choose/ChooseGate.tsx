'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RequireName from '../../components/RequireName';
import { QBANK_META } from '../../lib/qbank';
import { getName } from '../../lib/store';

/**
 * The post-gate choice: full previous-year papers, one subject at a time,
 * or the question bank. Rendered only after the name gate has passed on
 * the device, so the exported /choose page itself carries nothing.
 */
export default function ChooseGate() {
  const [name, setNameState] = useState('');
  useEffect(() => {
    setNameState(getName());
  }, []);

  return (
    <RequireName>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">What will you practise?</h1>
          <p className="mt-1.5 text-[15px] text-inksoft">
            {name ? (
              <>
                Hi, <span className="font-semibold text-ink">{name}</span> — three ways to practise,
                all free, all in the FMGE manner.
              </>
            ) : (
              'Three ways to practise, all free, all in the FMGE manner.'
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

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link
          href="/papers/"
          className="group flex flex-col rounded-xl border border-line bg-white p-6 shadow-card transition hover:border-med-line hover:shadow-lift"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-med">Full mocks</p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">PYP Tests</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
            Complete previous-year FMGE papers as full mock tests — 300 questions, Part I + Part II,
            150 minutes per part, the fixed pass mark of 150.
          </p>
          <p className="mt-4 text-sm font-semibold tabular-nums text-inksoft">
            12 papers · 3,600 questions
          </p>
          <span className="mt-auto pt-5 text-[15px] font-bold text-med group-hover:underline">
            Go to PYP Tests →
          </span>
        </Link>

        <Link
          href="/subjects/"
          className="group flex flex-col rounded-xl border border-line bg-white p-6 shadow-card transition hover:border-med-line hover:shadow-lift"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-med">One subject at a time</p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">Subject-wise Tests</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
            A single subject per test — 19 to 50 questions in one sitting, with the same exam
            window, the same +1 / 0 marking and a full analysis measured against the 50% mark.
          </p>
          <p className="mt-4 text-sm font-semibold tabular-nums text-inksoft">
            16 subjects · 30 tests · 1,059 questions
          </p>
          <span className="mt-auto pt-5 text-[15px] font-bold text-med group-hover:underline">
            Go to Subject-wise Tests →
          </span>
        </Link>

        <Link
          href="/qbank/"
          className="group flex flex-col rounded-xl border border-line bg-white p-6 shadow-card transition hover:border-med-line hover:shadow-lift"
        >
          <p className="text-xs font-bold uppercase tracking-wide text-med">Question by question</p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-ink">Question Bank</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
            Practise question by question, by subject and topic. Practice mode checks each answer
            and explains it straight away; Exam mode locks answers until you submit, then analyses
            the set. Your mistakes and bookmarks are kept for revision.
          </p>
          <p className="mt-4 text-sm font-semibold tabular-nums text-inksoft">
            19 subjects · {QBANK_META.total.toLocaleString('en-IN')} questions
          </p>
          <span className="mt-auto pt-5 text-[15px] font-bold text-med group-hover:underline">
            Go to the Question Bank →
          </span>
        </Link>
      </div>
    </RequireName>
  );
}
