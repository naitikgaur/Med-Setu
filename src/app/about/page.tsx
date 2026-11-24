import Link from 'next/link';
import { SiteFooter, DonateBlock, PHONES } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';

export const metadata = {
  title: 'About MedSetu — Naitik Library',
  description:
    'MedSetu is made by the efforts of Naitik Library, founded by Naitik Gaur, Gautam Nagar, New Delhi — the complete FMGE preparation platform for medical students: previous-year mock papers, a grand test series, subject-wise tests, a question bank, short notes, flashcards and guides, for every student.',
  alternates: { canonical: '/about/' },
};

export default function About() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <h1 className="max-w-2xl text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            A library&apos;s effort, for every FMGE student.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            MedSetu is made by the efforts of <strong className="text-ink">Naitik Library</strong>,
            founded by <strong className="text-ink">Naitik Gaur</strong>, Gautam Nagar, New Delhi, to
            help students prepare for their FMGE exam, completely free.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            Students at Naitik Library kept asking for the same thing: a way to sit a full
            previous-year FMGE paper the way the real exam feels (two parts, a running clock, a
            question palette) and afterwards understand <em>properly</em> how they did: which
            subjects held up, where time leaked, which guesses paid off, and which wrong answers are
            worth the most marks to fix. And around the mocks, a way to practise one subject, one
            topic, one question at a time. MedSetu is that complete preparation platform, open to every
            FMGE student anywhere, not just our own.
          </p>
          <div className="mt-6 rounded-xl border border-line bg-white px-5 py-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">Contact Naitik Library</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-ink">{PHONES}</p>
            <p className="mt-0.5 text-sm text-inksoft">Gautam Nagar, New Delhi</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-inksoft">
            Naitik Library itself is a study hall for medical students in Gautam Nagar.{' '}
            <Link href="/naitik-library/" className="font-semibold text-med hover:underline">
              Read more about Naitik Library →
            </Link>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">How MedSetu works</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>Pick any of the 12 previous-year papers (December 2020 – June 2026) and write it as a mock: Part I, a break, then Part II — 150 minutes per part, exactly the FMGE manner.</li>
            <li><strong className="text-ink">Subject-wise tests:</strong> 30 tests across 16 subjects (19–50 questions each), one subject at a time in a single sitting, every question with its full explanation. The analysis measures your score against the 50% mark — the FMGE pass proportion — as a benchmark; a subject test has no official pass.</li>
            <li><strong className="text-ink">New in MedSetu v3 — the Question Bank:</strong> 13,934 questions across all 19 subjects, organised by topic, every one with its answer and explanation. In Practice mode you check each answer as you go; in Exam mode a set is locked until you submit and then analysed like a test. Wrong answers collect in My Mistakes — replay one, answer it right, and it clears — and any question can be bookmarked for revision. All of it lives only in your browser tab.</li>
            <li><strong className="text-ink">New in MedSetu v6 — Short Notes, Flashcards &amp; Mind Maps:</strong> a rapid-revision layer for all 19 subjects, built backwards from five years of previous-year papers. Each subject’s short notes compress its high-yield topics into crisp facts, comparison tables, marked exam traps and night-before golden points; a one-screen mind map holds the whole subject; and 50 flashcards per subject turn it into active recall. The notes and flashcards are read and practised on MedSetu itself — they are not downloadable, which is part of how they stay free and current for every student.</li>
            <li><strong className="text-ink">The MedSetu Blog (v5):</strong> 150 free guides for medical students — FMGE preparation strategy, subject guides, books, notes and revision methods, MBBS abroad, research explained, careers and clinical skills.</li>
            <li>Marking is FMGE marking: <strong className="text-ink">+1 for a correct answer, 0 for wrong or skipped. There is no negative marking</strong>, and the pass mark is a fixed 150 of 300.</li>
            <li>After Part II you get a detailed analysis: pass verdict, subject-wise table, time and behaviour reports (answer changes, guesses, rushed mistakes), your biggest mark-recovery pools, a solutions explorer where every question opens its full book explanation, and the complete answer key.</li>
            <li>The full report and the detailed answer key &amp; solutions can be downloaded as print-ready PDFs, generated in your browser.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">The no-data promise</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            MedSetu has no backend and no database. There are no accounts, no logins, no analytics
            and no tracking. Your name and answers are kept only in your own browser tab
            (sessionStorage) so a refresh doesn&apos;t lose your test; your analysis is calculated on
            your device; and when you close the tab, everything is gone. We cannot see your score —
            by design, not just by policy.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Methodology &amp; honesty</h2>
          <div className="mt-3 max-w-3xl space-y-3 leading-relaxed text-inksoft">
            <p>
              <strong className="text-ink">There are no official FMGE papers.</strong> NBEMS does not
              release FMGE question papers or official answer keys: the exam content is confidential.
              Every paper on MedSetu is therefore a <strong className="text-ink">recall-based
              edition</strong>: the 2020–2025 papers come from a published FMGE previous-year book
              with answer keys and explanations; the two 2026 papers come from candidate-recall compilations whose answers
              were verified against the recall sources. Wording is as recalled, not verbatim from
              NBEMS, and a recalled answer key can occasionally be wrong.
            </p>
            <p>
              <strong className="text-ink">Short sources, stated plainly.</strong> Four book papers
              end before 300 in the source itself (294–298 questions), one June 2026 question was
              dropped because its options are missing in the source, and the 2026 recalls contain
              286 and 258 questions. (The July 2025 question whose options are images has been
              restored: its four option images are reproduced from the book.) MedSetu never
              invents a question, and every paper page states exactly how many questions are the
              paper&apos;s own.
            </p>
            <p>
              <strong className="text-ink">Completed papers.</strong> So that every mock is a
              full-size FMGE practice test, each short paper is completed to 300 with questions
              taken from other years&apos; papers in this same library. The added questions are
              chosen by subject-weightage equalisation: the subjects furthest below their official
              NBEMS blueprint share in that paper are filled first, with questions from the nearest
              sessions, never duplicating a question already in the paper, and no donor question is
              used in more than one paper. Each added question is flagged with its source paper in
              the review, the paper page states how many were added and from which years, and the
              analysis separately reports your score on the paper&apos;s own questions alone. Every
              paper is therefore scored against the real pass mark of 150.
            </p>
            <p>
              <strong className="text-ink">Image questions.</strong> Some questions refer to an image
              from the original exam (an X-ray, a slide, a marked diagram). For the book papers,
              the images are reproduced from the book itself and shown with the question in the
              test and the review. The few that could not be recovered, and the 2026 recall
              questions, whose images are not part of MedSetu&apos;s data, carry a note instead.
              You can skip them, or answer from the stem — in the analysis they are flagged so you
              can judge them fairly.
            </p>
            <p>
              <strong className="text-ink">Subject groups follow the source book.</strong> The
              subject-wise analysis uses the source book&apos;s own subject sections. Recall
              compilations group some questions differently from the official NBEMS blueprint, so
              treat subjects with very few questions as indicative only.
            </p>
            <p>
              <strong className="text-ink">Subject-wise tests.</strong> These come from a
              published FMGE subject test series: 16 subjects, two tests per subject where the
              series has them (Orthopaedics has one test; a combined Minor Subjects test covers
              Orthopaedics, Psychiatry, Dermatology, Radiology and Anaesthesia). Question wording,
              options and explanations are reproduced from the source without editing the medicine;
              each test&apos;s questions were lightly re-ordered for practice. The images the
              source refers to are included — question figures with their questions, explanation
              images with the detailed solutions; if an individual image could not be recovered,
              the question or explanation says so where it applies.
            </p>
            <p>
              <strong className="text-ink">The Question Bank (v3).</strong> The bank is compiled
              from three published compilations — an FMGE previous-year question set and two large
              question banks covering FMGE and other Indian entrance exams — merged into one bank:
              duplicate questions across the compilations were merged (the copy with the
              explanation and figure was kept), and the small number whose sources disagreed on
              the correct answer were left out entirely rather than guessed at. Questions are
              organised under the 19 FMGE subjects, topics as the sources name them. Most questions
              carry their figure with them; where a figure could not be included, the question
              says so.
            </p>
            <p>
              <strong className="text-ink">No ranks, no percentiles.</strong> MedSetu never shows a
              rank or percentile: with no cohort of test-takers, any such number would be invented.
              The analysis shows the real session&apos;s published pass percentage only as context.
            </p>
            <p>
              MedSetu is <strong className="text-ink">not affiliated with NBEMS or the National
              Medical Commission</strong>. It is a free practice tool. For the official exam
              interface, try the{' '}
              <a
                href="https://natboard.edu.in"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-med underline decoration-med/40 underline-offset-2 hover:decoration-med"
              >
                NBEMS demo test at natboard.edu.in
              </a>
              .
            </p>
          </div>
        </section>

        <div className="mt-10">
          <DonateBlock />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
