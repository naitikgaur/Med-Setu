import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SERIES_META, getSeriesTest } from '../../../lib/series';
import { SiteFooter } from '../../../components/SiteChrome';
import { SiteHeader } from '../../../components/SiteHeader';
import { LEGEND_ITEMS, LegendSwatch } from '../../../components/TcsPalette';
import RequireName from '../../../components/RequireName';
import SeriesStartPanel from './SeriesStartPanel';

export function generateStaticParams() {
  return SERIES_META.map((t) => ({ id: t.testId }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const test = getSeriesTest(params.id);
  if (!test) return {};
  return {
    title: `${test.title} — MedSetu Test Series | 300 FMGE questions, free mock`,
    description: `${test.title} of the MedSetu Test Series: a full 300-question FMGE paper across all 19 subjects in the official NBEMS mix, ${test.pyqCount} from previous-year papers, two parts of 150, full explanations, a learning for every question and a detailed analysis. Free.`,
    alternates: { canonical: `/tests/${params.id}/` },
  };
}

export default function SeriesTestPage({ params }: { params: { id: string } }) {
  const test = getSeriesTest(params.id);
  if (!test) notFound();
  const bankCount = test.total - test.pyqCount;
  const subjectRows = Object.entries(test.subjects).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <RequireName>
          <Link href="/tests/" className="mt-6 inline-block text-sm font-semibold text-med hover:underline">
            ← All grand tests
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-med">
            MedSetu Test Series
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {test.title}
          </h1>
          <p className="mt-1.5 text-[15px] text-inksoft">
            A full FMGE paper — all 19 subjects in the official NBEMS proportions, in two parts of 150 with a break between them.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            {[
              [`${test.total}`, 'questions'],
              ['2 × 150 min', 'two parts, with a break'],
              [`${test.pyqCount}`, 'from previous-year papers'],
              [`${bankCount}`, 'from the question bank'],
            ].map(([big, small]) => (
              <div key={small} className="bg-white px-4 py-3.5 text-center">
                <p className="text-[22px] font-bold tabular-nums text-med-deep">{big}</p>
                <p className="mt-0.5 text-xs font-medium text-inksoft">{small}</p>
              </div>
            ))}
          </div>

          <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-lg font-bold text-ink">What&apos;s inside</h2>
            <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-inksoft">
              <li>
                <strong className="text-ink">The real exam&apos;s mix.</strong> Subjects follow the
                official NBEMS blueprint for a 300-question paper — Medicine, Surgery, Obstetrics &amp; Gynaecology
                and Community Medicine carry the most questions, just as they do in FMGE.
              </li>
              <li>
                <strong className="text-ink">A learning for every question.</strong> In the review,
                each question shows the one-line fact it was testing, taken from its own
                explanation — 300 learnings per test, written for fast revision.
              </li>
              <li>
                <strong className="text-ink">An eight-part analysis.</strong> Overview, performance,
                score potential, attempt, time and topic analysis, your question journey, and a
                question-by-question review — downloadable as a structured report.
              </li>
              <li>
                <strong className="text-ink">Measured against the pass proportion.</strong> FMGE
                passes at 150 of 300 — and this full-length test is measured against that same real pass mark of 150.
              </li>
            </ul>
          </section>

          <div className="mt-6">
            <SeriesStartPanel test={test} />
          </div>

          <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-lg font-bold text-ink">Subject mix in this test</h2>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
              {subjectRows.map(([s, n]) => (
                <p key={s} className="flex items-baseline justify-between gap-2 text-sm text-inksoft">
                  <span>{s}</span>
                  <span className="font-semibold tabular-nums text-ink">{n}</span>
                </p>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-lg font-bold text-ink">The question palette</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
              The test window uses the same palette as the real exam software:
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {LEGEND_ITEMS.map((item) => (
                <li key={item.state} className="flex items-center gap-2.5 text-sm text-inksoft">
                  <LegendSwatch state={item.state} />
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
        </RequireName>
      </main>
      <SiteFooter />
    </div>
  );
}
