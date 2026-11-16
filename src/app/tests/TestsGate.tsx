'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import RequireName from '../../components/RequireName';
import { SERIES_META } from '../../lib/series';
import { getName } from '../../lib/store';

/**
 * The Test Series library, behind the same name gate as the other
 * libraries: the 30 grand-test cards render only after the gate has
 * passed on the device. The page around this component carries the
 * series' full public description for readers and search engines.
 */
export default function TestsGate() {
  const [name, setNameState] = useState('');
  useEffect(() => {
    setNameState(getName());
  }, []);

  return (
    <RequireName>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">The 30 grand tests</h2>
          <p className="mt-1.5 text-[15px] text-inksoft">
            {name ? (
              <>
                Hi, <span className="font-semibold text-ink">{name}</span> — pick a grand test.
                Each one is a full FMGE paper: 300 questions, two parts of 150, 150 minutes a part.
              </>
            ) : (
              'Pick a grand test. Each one is a full FMGE paper: 300 questions, two parts of 150, 150 minutes a part.'
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
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERIES_META.map((t) => {
          const top = Object.entries(t.subjects)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([s]) => s)
            .join(' · ');
          return (
            <Link
              key={t.testId}
              href={`/tests/${t.testId}/`}
              className="group flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition hover:border-med-line hover:shadow-lift"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-med">
                MedSetu Test Series
              </p>
              <h3 className="mt-1 text-lg font-bold leading-snug text-ink">{t.title}</h3>
              <p className="mt-2 text-sm tabular-nums text-inksoft">
                {t.total} questions · two parts of 150 · {t.pyqCount} from previous years
              </p>
              <p className="mt-1 text-xs leading-relaxed text-inksoft">
                Heaviest in {top} — all 19 subjects in NBEMS proportions.
              </p>
              <span className="mt-auto pt-4 text-sm font-bold text-med group-hover:underline">
                Open {t.title} →
              </span>
            </Link>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-inksoft">
        30 tests · 9,000 questions · no question repeats anywhere in the series · every question
        carries an explanation and a one-line learning.
      </p>
    </RequireName>
  );
}
