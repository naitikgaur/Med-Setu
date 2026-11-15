import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PAPERS_META, getMeta } from '../../../lib/papers';
import { SiteFooter } from '../../../components/SiteChrome';
import { SiteHeader } from '../../../components/SiteHeader';
import { LEGEND_ITEMS, LegendSwatch } from '../../../components/TcsPalette';
import RequireName from '../../../components/RequireName';
import StartPanel from './StartPanel';

export function generateStaticParams() {
  return PAPERS_META.map((p) => ({ id: p.paperId }));
}

export default function PaperPage({ params }: { params: { id: string } }) {
  const meta = getMeta(params.id);
  if (!meta) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
       <RequireName>
        <Link href="/papers/" className="mt-6 inline-block text-sm font-semibold text-med hover:underline">
          ← All papers
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          FMGE {meta.label}
        </h1>
        <p className="mt-1.5 text-[15px] text-inksoft">
          {meta.session} · held {meta.examDate}
        </p>

        {/* Facts */}
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {[
            [`${meta.total}`, 'questions in this edition'],
            [`${meta.part1} + ${meta.part2}`, 'Part I + Part II split'],
            ['150 min', 'per part'],
            [meta.hasExplanations ? 'Yes' : 'No', 'explanations included'],
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
              <strong className="text-ink">This is a recall-based edition.</strong> NBEMS never
              releases official FMGE papers; this paper was reconstructed from candidate recall
              {meta.hasExplanations
                ? ' and published with an answer key and full explanations in the FMGE previous-year book.'
                : ' compilations, with answers verified against the recall sources. It has no explanations and no subject tags in the source.'}
            </li>
            {meta.addedCount > 0 && (
              <li>
                <strong className="text-ink">Completed to 300.</strong> This paper&apos;s own source
                has {meta.ownTotal} questions; {meta.addedCount} questions from other years&apos;
                papers were added to complete the mock. See “Completed to 300 questions” below for
                exactly how they were chosen.
              </li>
            )}
            {meta.paperId === 'jun-2026' && meta.dropped > 0 && (
              <li>
                <strong className="text-ink">1 question dropped</strong>: its options were missing
                in the recall source, so it cannot be answered fairly here.
              </li>
            )}
            {meta.imgCount > 0 && (
              <li>
                {meta.imgUnmatched === 0 ? (
                  <>
                    <strong className="text-ink">{meta.imgCount} questions in this paper use an image</strong>{' '}
                    (an X-ray, slide or diagram). All {meta.imgCount} images are included,
                    reproduced from the book.
                  </>
                ) : (
                  <>
                    <strong className="text-ink">{meta.imgCount} questions in this paper use an image</strong>{' '}
                    (an X-ray, slide or diagram). {meta.imgMatched} of those images are included,
                    reproduced from the source; {meta.imgUnmatched} could not be recovered. Those
                    questions carry a note during the test, and you may skip them.
                  </>
                )}
              </li>
            )}
            {!meta.hasExplanations && (
              <li>
                <strong className="text-ink">Answers only.</strong> You still get the full analysis
                and the verified answer key; explanations and subject-wise analysis are not
                available for this paper because the source has neither.
              </li>
            )}
          </ul>
          {meta.hasSubjects && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink">Subjects covered (source book sections)</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {meta.subjectsPresent.map((s) => (
                  <span key={s.subject} className="rounded bg-mist px-2 py-0.5 text-xs font-medium tabular-nums text-ink">
                    {s.subject} · {s.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Completion disclosure */}
        {meta.addedCount > 0 && (
          <section className="mt-6 rounded-xl border border-med-line bg-med-soft/40 p-5 shadow-card sm:p-6">
            <h2 className="text-lg font-bold text-ink">Completed to 300 questions</h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-inksoft">
              This session&apos;s own recall source has <strong className="text-ink">{meta.ownTotal} questions</strong>
              {meta.dropped > 0
                ? <> (one further question could not be used: its options were missing or image-only in the source)</>
                : null}
              . To give you a full-size FMGE mock, MedSetu added{' '}
              <strong className="text-ink">{meta.addedCount} questions</strong> from other years&apos;
              papers in this library
              {meta.addedFrom.length > 0 && (
                <>: {meta.addedFrom.map((d) => `${d.label} (${d.count})`).join(', ')}</>
              )}
              . No question was invented, and no question already in this paper was repeated.
            </p>
            <p className="mt-2.5 text-[15px] leading-relaxed text-inksoft">
              How they were chosen: <strong className="text-ink">subject-weightage equalisation</strong>.
              The subjects furthest below their official NBEMS blueprint share in this paper were
              filled first, taking questions from the nearest sessions. Every added question is
              marked <strong className="text-ink">“Added · from …”</strong> with its source paper in
              the review after your test, and your analysis also shows your score on this
              paper&apos;s own {meta.ownTotal} questions alone.
            </p>
          </section>
        )}

        {/* Instructions summary */}
        <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-bold text-ink">Before you start</h2>
          <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed text-inksoft">
            <li>
              The test has <strong className="text-ink">two parts</strong>: Part I ({meta.part1}{' '}
              questions) and Part II ({meta.part2} questions), <strong className="text-ink">150
              minutes per part</strong>, with a break in between. When you start, you will first see
              the full exam-style instructions screen, exactly as in the real test window.
            </li>
            <li>
              The real FMGE parts are not split by subject. MedSetu&apos;s halves are simply the
              first and second halves of this paper <strong className="text-ink">in source
              order</strong>.
            </li>
            <li>
              Marking: <strong className="text-ink">+1 for every correct answer, 0 for wrong or
              unattempted. There is no negative marking</strong>. In FMGE a guess can never hurt
              you. The pass mark in the real exam is a fixed 150 of 300.
            </li>
            <li>
              The question palette on the right of the test window shows where you stand, using the
              same symbols as the real exam:
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
          <ol start={5} className="mt-3 list-decimal space-y-2.5 pl-5 text-[15px] leading-relaxed text-inksoft">
            <li>
              Optional but valuable: mark <strong className="text-ink">Sure / Unsure / Guessed</strong>{' '}
              under any question to record how confident you were. Your analysis uses it to show how
              your guesses actually performed.
            </li>
            <li>
              When Part I ends, you see only your attempt counts and{' '}
              <strong className="text-ink">no score</strong>, just like the real exam. Your full
              analysis unlocks after Part II.
            </li>
            <li>
              <strong className="text-ink">Your data stays on this device.</strong> Your name and
              answers live only in this browser tab; a refresh resumes your test, and closing the
              tab erases everything. Nothing is uploaded, ever.
            </li>
          </ol>
        </section>

        <div className="mt-6">
          <StartPanel meta={meta} />
        </div>
       </RequireName>
      </main>
      <SiteFooter />
    </div>
  );
}
