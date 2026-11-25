import Link from 'next/link';
import type { PaperMeta } from '../lib/types';

export default function PaperCard({ p }: { p: PaperMeta }) {
  return (
    <Link
      href={`/paper/${p.paperId}/`}
      className="group flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition hover:border-med-line hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-subtitle font-bold leading-tight text-ink group-hover:text-med-deep">
          FMGE {p.label}
        </h3>
        <span className="rounded bg-mist px-2 py-0.5 text-xs font-bold tabular-nums text-ink">
          {p.total} Qs
        </span>
      </div>
      <p className="mt-1 text-caption text-inksoft">
        {p.session} · held {p.examDate}
      </p>
      <p className="mt-2 text-caption text-inksoft">
        Part I {p.part1} · Part II {p.part2} · 150 min each
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.hasExplanations ? (
          <span className="rounded bg-med-soft px-2 py-0.5 text-micro font-semibold text-med-deep">
            Full explanations
          </span>
        ) : (
          <span className="rounded bg-accent-soft px-2 py-0.5 text-micro font-semibold text-accent-deep">
            Answers only · 2026 recall
          </span>
        )}
        {p.addedCount > 0 && (
          <span className="rounded bg-mist px-2 py-0.5 text-micro font-semibold text-inksoft">
            {p.addedCount} added to complete 300
          </span>
        )}
        {p.addedCount === 0 && p.sourceTotal < 300 && (
          <span className="rounded bg-mist px-2 py-0.5 text-micro font-semibold text-inksoft">
            {p.sourceTotal} of 300 in source
          </span>
        )}
        {p.imgCount > 0 && (
          <span className="rounded bg-mist px-2 py-0.5 text-micro font-semibold text-inksoft">
            {p.imgCount} image Qs{p.imgUnmatched > 0 ? ` · ${p.imgUnmatched} images not in recall` : ' · images included'}
          </span>
        )}
      </div>
      <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-med">
        View paper &amp; instructions
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}
