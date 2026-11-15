import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SUBJECTS_META, getSubject } from '../../../lib/subjects';
import { SiteFooter } from '../../../components/SiteChrome';
import { SiteHeader } from '../../../components/SiteHeader';
import { LEGEND_ITEMS, LegendSwatch } from '../../../components/TcsPalette';
import RequireName from '../../../components/RequireName';
import SubjectStartPanel from './SubjectStartPanel';

export function generateStaticParams() {
  return SUBJECTS_META.map((s) => ({ slug: s.slug }));
}

export default function SubjectPage({ params }: { params: { slug: string } }) {
  const subject = getSubject(params.slug);
  if (!subject) notFound();

  const totalQuestions = subject.tests.reduce((n, t) => n + t.total, 0);
  const imgTotal = subject.tests.reduce((n, t) => n + t.imgCount, 0);
  const imgMatchedTotal = subject.tests.reduce((n, t) => n + t.imgMatched, 0);
  const explImgTotal = subject.tests.reduce((n, t) => n + t.explImgCount, 0);
  const explImgUnmatchedTotal = subject.tests.reduce((n, t) => n + t.explImgUnmatched, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
       <RequireName>
        <Link href="/subjects/" className="mt-6 inline-block text-sm font-semibold text-med hover:underline">
          ← All subjects
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {subject.name}
        </h1>
        {subject.descriptor && (
          <p className="mt-1.5 text-[15px] text-inksoft">{subject.descriptor}</p>
        )}

        {/* Facts */}
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {[
            [`${subject.tests.length}`, subject.tests.length === 1 ? 'test' : 'tests'],
            [`${totalQuestions}`, 'questions in total'],
            ['Single part', 'no second part, no break'],
            ['Yes', 'explanation for every question'],
          ].map(([big, small]) => (
            <div key={small} className="bg-white px-4 py-3.5 text-center">
              <p className="text-[22px] font-bold tabular-nums text-med-deep">{big}</p>
              <p className="mt-0.5 text-xs font-medium text-inksoft">{small}</p>
            </div>
          ))}
        </div>

        {/* What's inside */}
        <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold text-ink">What&apos;s inside</h2>
          <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">One subject, one sitting.</strong> Each test below is{' '}
              {subject.name} only, in the same exam-style window as the full papers — one part, the
              test&apos;s own time limit, and your full analysis the moment you submit.
            </li>
            <li>
              <strong className="text-ink">Measured against the 50% mark.</strong> A subject test is
              not a full FMGE paper, so there is no official pass here. Your analysis shows your
              score against 50% — the FMGE pass proportion — as a benchmark.
            </li>
            {(imgTotal > 0 || explImgTotal > 0) && (
              <li>
                <strong className="text-ink">Images included.</strong>{' '}
                {imgTotal > 0 && (
                  <>{imgMatchedTotal} of {imgTotal} question figure{imgTotal === 1 ? '' : 's'} from
                  the source {imgTotal === 1 ? 'is' : 'are'} included with{' '}
                  {imgTotal === 1 ? 'its' : 'their'} question{imgTotal === 1 ? '' : 's'}. </>
                )}
                {explImgTotal > 0 && (
                  <>The explanations carry their source images too, shown with the detailed
                  solution. </>
                )}
                {(imgTotal - imgMatchedTotal > 0 || explImgUnmatchedTotal > 0) && (
                  <>A few images could not be recovered — the question or explanation says so
                  where that happens.</>
                )}
              </li>
            )}
            <li>
              <strong className="text-ink">Your data stays on this device.</strong> Your name and
              answers live only in this browser tab; a refresh resumes your test, and closing the
              tab erases everything. Nothing is uploaded, ever.
            </li>
          </ul>
        </section>

        {/* Before you start */}
        <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold text-ink">Before you start</h2>
          <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed text-inksoft">
            <li>
              When you start a test, you will first see the full exam-style instructions screen,
              exactly as in the real test window; the clock starts only when the test opens.
            </li>
            <li>
              Marking: <strong className="text-ink">+1 for every correct answer, 0 for wrong or
              unattempted. There is no negative marking</strong> — a guess can never hurt you.
            </li>
            <li>
              The question palette shows where you stand, using the same symbols as the real exam:
            </li>
          </ol>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.state} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 shrink-0">
                  <LegendSwatch state={item.state} />
                </span>
                <p className="leading-snug text-inksoft">
                  <strong className="text-ink">{item.label}</strong>: {item.desc}
                </p>
              </div>
            ))}
          </div>
          <ol start={4} className="mt-3 list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed text-inksoft">
            <li>
              Optional but valuable: mark <strong className="text-ink">Sure / Unsure / Guessed</strong>{' '}
              under any question. Your analysis uses it to show how your guesses actually performed.
            </li>
          </ol>
        </section>

        <div className="mt-6 space-y-4">
          {subject.tests.map((t) => (
            <SubjectStartPanel key={t.testId} subject={subject} test={t} />
          ))}
        </div>
       </RequireName>
      </main>
      <SiteFooter />
    </div>
  );
}
