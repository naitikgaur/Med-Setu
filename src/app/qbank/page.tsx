import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteChrome';
import { QBANK_META } from '../../lib/qbank';
import QBankGate from './QBankGate';

export const metadata: Metadata = {
  title: 'FMGE Question Bank — 13,934 Questions by Subject & Topic — MedSetu',
  description:
    '13,934 FMGE practice questions across all 19 subjects, organised by topic, every one with its answer and explanation. Practice and Exam modes. Free.',
  alternates: { canonical: '/qbank/' },
};

const SITE = 'https://med-setu.netlify.app';

export default function QBankPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-4 pt-8 sm:px-6">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-h1">
            The FMGE question bank
          </h1>
          <p className="mt-3 text-body2 leading-relaxed text-inksoft sm:text-base">
            <strong className="text-ink">{QBANK_META.total.toLocaleString('en-IN')} questions</strong>{' '}
            across all 19 FMGE subjects, organised by topic, every question with its answer and
            explanation. Practise a topic at a time in sets of 20, 50 or the whole subject — in{' '}
            <strong className="text-ink">Practice mode</strong> you check each answer and read the
            explanation straight away; in <strong className="text-ink">Exam mode</strong> the set
            opens in the real exam window and ends in the eight-part analysis.
          </p>
          <p className="mt-2 text-body2 leading-relaxed text-inksoft sm:text-base">
            Every wrong answer is saved to <strong className="text-ink">My Mistakes</strong> in
            this tab — replay it, answer it right, and it clears.
          </p>
        </section>

        <section aria-label="Subjects in the bank" className="mt-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {QBANK_META.subjects.map((s) => (
              <Link
                key={s.slug}
                href={`/qbank/${s.slug}/`}
                className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-card transition-colors hover:border-med/40"
              >
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="tabular-nums text-inksoft">
                  {s.total.toLocaleString('en-IN')} Qs · {s.topics.length} topics
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 border-t border-line pt-6">
          <QBankGate />
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'MedSetu FMGE question bank subjects',
            numberOfItems: QBANK_META.subjects.length,
            itemListElement: QBANK_META.subjects.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${s.name} questions`,
              url: `${SITE}/qbank/${s.slug}/`,
            })),
          }),
        }}
      />
    </div>
  );
}
