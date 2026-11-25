import Link from 'next/link';
import { SiteFooter } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';
import { SUBJECTS_META } from '../../lib/subjects';
import SubjectsGate from './SubjectsGate';

export const metadata = {
  title: 'FMGE Subject-wise Tests — MedSetu by Naitik Library',
  description:
    'FMGE subject-wise tests: 16 subjects, 30 tests, every question explained, with a detailed analysis against the 50% FMGE pass proportion. Free, no sign-up.',
  alternates: { canonical: '/subjects/' },
};

const SITE = 'https://med-setu.netlify.app';
const TOTAL_TESTS = SUBJECTS_META.reduce((n, s) => n + s.tests.length, 0);
const TOTAL_QS = SUBJECTS_META.reduce(
  (n, s) => n + s.tests.reduce((m, t) => m + t.total, 0),
  0,
);

export default function SubjectsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <section className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-h1">
            Subject-wise FMGE tests
          </h1>
          <p className="mt-3 text-body2 leading-relaxed text-inksoft sm:text-base">
            {SUBJECTS_META.length} subjects, {TOTAL_TESTS} tests, {TOTAL_QS.toLocaleString('en-IN')}{' '}
            questions — one subject at a time, in the same exam window as the full papers, every
            question with its full explanation. Your score is measured against the{' '}
            <strong className="text-ink">50% mark</strong>, the FMGE pass proportion, and every
            test ends in the same eight-part analysis as a full paper.
          </p>
          <p className="mt-2 text-body2 leading-relaxed text-inksoft sm:text-base">
            Use these to find the subject that is quietly costing you marks: a weak subject at 17
            or 30 questions in the paper is worth more than a strong one at 5.
          </p>
        </section>

        <section aria-label="The subjects" className="mt-6">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {SUBJECTS_META.map((s) => (
              <Link
                key={s.slug}
                href={`/subject/${s.slug}/`}
                className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3 text-sm shadow-card transition-colors hover:border-med/40"
              >
                <span className="font-semibold text-ink">{s.name}</span>
                <span className="tabular-nums text-inksoft">
                  {s.tests.length} test{s.tests.length === 1 ? '' : 's'} ·{' '}
                  {s.tests.reduce((m, t) => m + t.total, 0)} Qs
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-8 border-t border-line pt-6">
          <SubjectsGate />
        </div>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'FMGE subject-wise tests on MedSetu',
            numberOfItems: SUBJECTS_META.length,
            itemListElement: SUBJECTS_META.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${s.name} — subject-wise tests`,
              url: `${SITE}/subject/${s.slug}/`,
            })),
          }),
        }}
      />
    </div>
  );
}
