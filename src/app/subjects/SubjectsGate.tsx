'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RequireName from '../../components/RequireName';
import { SUBJECTS_META } from '../../lib/subjects';
import { getName } from '../../lib/store';

/**
 * The subject-wise library, behind the same name gate as the paper
 * library: cards render only after the gate has passed on the device, so
 * the exported /subjects page itself carries no list.
 */
export default function SubjectsGate() {
  const [name, setNameState] = useState('');
  useEffect(() => {
    setNameState(getName());
  }, []);

  return (
    <RequireName>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Subject-wise Tests</h1>
          <p className="mt-1.5 text-[15px] text-inksoft">
            {name ? (
              <>
                Hi, <span className="font-semibold text-ink">{name}</span> — pick a subject. Each
                test is one subject only, in a single sitting.
              </>
            ) : (
              'Pick a subject. Each test is one subject only, in a single sitting.'
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
        Every test carries a full explanation for every question, with the source&apos;s images
        included — question figures with their questions, explanation images with the detailed
        solutions. Your analysis measures your score against the 50% mark — the FMGE pass
        proportion.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUBJECTS_META.map((s) => (
          <Link
            key={s.slug}
            href={`/subject/${s.slug}/`}
            className="group flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition hover:border-med-line hover:shadow-lift"
          >
            <h2 className="text-lg font-bold leading-snug text-ink">{s.name}</h2>
            {s.descriptor && <p className="mt-0.5 text-xs text-inksoft">{s.descriptor}</p>}
            <div className="mt-3 space-y-1.5">
              {s.tests.map((t) => (
                <p
                  key={t.testNo}
                  className="flex items-center justify-between rounded-md bg-paper px-3 py-2 text-sm tabular-nums text-ink"
                >
                  <span className="font-semibold">Test {t.testNo}</span>
                  <span className="text-inksoft">{t.total} questions · {t.durationMin} min</span>
                </p>
              ))}
            </div>
            <span className="mt-auto pt-4 text-sm font-bold text-med group-hover:underline">
              Open {s.name} →
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-inksoft">
        16 subjects · 30 tests · 1,059 questions · every question with its explanation.
      </p>
    </RequireName>
  );
}
