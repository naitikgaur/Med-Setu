import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteChrome';
import { PAPERS_META } from '../../lib/papers';
import LibraryGate from './LibraryGate';

export const metadata: Metadata = {
  title: 'FMGE Previous Year Papers as Mock Tests (PYP Tests) — MedSetu',
  description:
    'All twelve FMGE previous-year papers as full mock tests — 300 questions in the real two-part manner, with explanations, analysis and an answer key. Free.',
  alternates: { canonical: '/papers/' },
};

const SITE = 'https://med-setu.netlify.app';

export default function PapersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-4 pt-8 sm:px-6">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-h1">
            FMGE previous-year papers, as full mock tests
          </h1>
          <p className="mt-3 text-body2 leading-relaxed text-inksoft sm:text-base">
            Twelve papers, December 2020 to June 2026 — every one a complete{' '}
            <strong className="text-ink">300 questions</strong> in the real FMGE manner: two parts
            of 150, 150 minutes a part, no negative marking, marked against the real pass mark of{' '}
            <strong className="text-ink">150</strong>. The ten book papers carry the book’s own
            explanations; the two 2026 papers carry answers only, and say so. After each paper you
            get an eight-part analysis and a downloadable answer key.
          </p>
          <p className="mt-2 text-body2 leading-relaxed text-inksoft sm:text-base">
            NBEMS never releases official FMGE papers, so these are recall-based editions —
            labelled as such on every paper page. Where a recall source runs short of 300, the
            mock is completed with questions from other years’ papers, and every added question is
            flagged with the paper it came from.
          </p>
        </section>

        <section aria-label="The twelve papers" className="mt-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PAPERS_META.map((p) => (
              <Link
                key={p.paperId}
                href={`/paper/${p.paperId}/`}
                className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-card transition-colors hover:border-med/40"
              >
                <span className="font-semibold text-ink">{p.label}</span>
                <span className="tabular-nums text-inksoft">300 Qs</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 border-t border-line pt-6">
          <LibraryGate />
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'FMGE previous-year papers on MedSetu',
            numberOfItems: PAPERS_META.length,
            itemListElement: PAPERS_META.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `FMGE ${p.label} — full mock test`,
              url: `${SITE}/paper/${p.paperId}/`,
            })),
          }),
        }}
      />
    </div>
  );
}
