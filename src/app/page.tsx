import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter, DonateStrip, CREDIT_LINE, PHONES } from '../components/SiteChrome';
import { AdSenseLoader, AdUnit } from '../components/AdSense';
import HeroVisual from '../components/HeroVisual';

export const metadata: Metadata = {
  title: 'MedSetu — the complete FMGE practice package, free',
  description:
    'MedSetu is the complete FMGE practice package: twelve previous-year papers as full mock tests in the real exam window (300 questions, two parts, pass mark 150), the MedSetu Test Series of 30 grand tests with a learning point on every question, 30 subject-wise tests, and a question bank of 15,607 questions with an explanation for every answer. Free, no sign-up, by Naitik Library, New Delhi.',
  alternates: { canonical: '/' },
};

/* Inline icons: one stroke style (1.7, round caps) across all feature cards. */
function Icon({ d }: { d: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden
    >
      {d}
    </svg>
  );
}

const FEATURES: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: 'The real exam window',
    body: 'The test opens in a window modelled on the TCS iON screen the FMGE is actually held on — the same palette symbols, the same buttons in the same order, the same two-part rhythm with a break in between. On exam day, nothing about the screen is new to you.',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M15 9v11" />
        <path d="M6.5 13h5M6.5 16.5h3.5" />
      </>
    ),
  },
  {
    title: 'All twelve papers, complete',
    body: 'December 2020 to June 2026, every paper a full 300 questions. Where a recall source itself runs short, the mock is completed with questions from other years’ papers — and every added question is flagged with the paper it came from.',
    icon: (
      <>
        <path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" />
        <path d="m3 12.5 9 4.5 9-4.5" />
        <path d="m3 17 9 4.5 9-4.5" />
      </>
    ),
  },
  {
    title: 'Subject-wise tests',
    body: 'Sixteen subjects, two tests each where the series has them — 19 to 50 questions on one subject at a time, in the same exam window, every question with its full explanation. Your score is measured against the 50% mark, the FMGE pass proportion.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 12h.01" />
      </>
    ),
  },
  {
    title: 'The Question Bank',
    body: '15,607 questions across all 19 FMGE subjects, organised by topic, every one with its answer and explanation. Practise a topic at a time in sets of 20, 50 or the whole subject — the bank is where daily revision happens.',
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
        <path d="M3.5 9.5h17M9.5 9.5v11" />
        <path d="M13 13.5h4.5M13 17h3" />
      </>
    ),
  },
  {
    title: 'Practice mode, and mistakes that clear',
    body: 'In Practice mode you check each answer as you go and read the explanation straight away. Every wrong answer — in the bank or in a test — is saved to My Mistakes in this tab; replay it, answer it right, and it clears. Bookmarks work the same way.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12.2 2.4 2.4 4.6-5" />
      </>
    ),
  },
  {
    title: 'The book’s explanations',
    body: 'For the ten book papers, every question carries the explanation printed in the FMGE previous-year book — word for word, not a paraphrase and not written by a machine. The two 2026 papers carry answers only, and the site says so plainly.',
    icon: (
      <>
        <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2Z" />
        <path d="M12 6.5v13" />
      </>
    ),
  },
  {
    title: 'Click a question, read its solution',
    body: 'After the test, your analysis lists all 300 questions. Open any one and you see the correct option, the option you chose, and the full explanation — so revision starts from the exact questions that cost you marks.',
    icon: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.3 15.3 5.2 5.2" />
        <path d="M8 10.5h5M10.5 8v5" />
      </>
    ),
  },
  {
    title: 'An answer key worth downloading',
    body: 'The detailed answer key prints every question with the correct option, its explanation and your answer beside it — a revision document you keep, not just a score you glance at. A one-page key is there too, for a fast count.',
    icon: (
      <>
        <path d="M12 4v9.5m0 0L8.5 10M12 13.5l3.5-3.5" />
        <path d="M4.5 16.5v2A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
      </>
    ),
  },
  {
    title: 'The images are in',
    body: 'Image-based questions carry the actual X-ray, slide, ECG or diagram, reproduced from the book the paper was taken from. Where an image could not be recovered from the source, the question tells you instead of guessing.',
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.6" />
        <path d="m4.5 17.5 5-4.5 3.5 3.5 3.5-4 3 2.7" />
      </>
    ),
  },
  {
    title: '30 grand tests, one series',
    body: 'The MedSetu Test Series deals 9,000 questions across 30 tests of 300 — no question repeats — in the official subject mix, about a third of them previous-year questions. Finish the series and you have worked through the entire syllabus, topic by topic.',
    icon: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
        <path d="M4 10l6-6 6 8" />
      </>
    ),
  },
  {
    title: 'A learning for every question',
    body: 'Every question in the Test Series carries a short learning point drawn from its own explanation — the one fact the question was really testing. It sits inside the solution and in the printed answer key, so a finished test becomes a revision sheet.',
    icon: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.2 1 2.1h5c0-.9.3-1.6 1-2.1A6 6 0 0 0 12 3Z" />
      </>
    ),
  },
  {
    title: 'Analysis in eight parts',
    body: 'Every attempt ends in an eight-part analysis: overview, subject-by-subject performance, the score you left on the table, how each question was attempted, your time, your topics, your question journey, and every solution. The downloadable PDF is structured the same way.',
    icon: (
      <>
        <path d="M4 4h16M4 9.3h16M4 14.6h16M4 20h16" />
        <path d="M8.5 4v5.3M15 9.3v5.3M11 14.6V20" />
      </>
    ),
  },
];

const FACTS = [
  ['300', 'MCQs · English · computer-based'],
  ['2 × 150', 'Part I and Part II, with a break'],
  ['150 min', 'per part, on the clock'],
  ['+1 / 0', 'per answer · no negative marking'],
  ['150', 'out of 300 to pass'],
];

const MODES: { title: string; count: string; body: string; href: string; badge?: string }[] = [
  {
    title: 'PYP Tests',
    count: '12 papers · 3,600 questions',
    body: 'Previous-year FMGE papers as full mock tests in the real exam window — two parts, the real clock, marked against the real pass mark of 150.',
    href: '/papers/',
  },
  {
    title: 'Test Series',
    count: '30 grand tests · 9,000 questions',
    body: 'Grand tests built from the question bank and previous-year questions in the official subject mix. Every question carries a learning point, and together the 30 tests cover almost the entire syllabus.',
    href: '/tests/',
    badge: 'New',
  },
  {
    title: 'Subject-wise Tests',
    count: '16 subjects · 30 tests',
    body: 'One subject at a time, in the same exam window, every question with its full explanation — measured against the 50% FMGE pass proportion.',
    href: '/subjects/',
  },
  {
    title: 'Question Bank',
    count: '19 subjects · 15,607 questions',
    body: 'Topic-by-topic daily practice in sets of 20, 50 or a whole subject — with Practice mode, My Mistakes and Bookmarks.',
    href: '/qbank/',
  },
];

/* Official NBEMS blueprint: questions per subject in a 300-question paper. */
const WEIGHTAGE: [string, number][] = [
  ['Medicine', 33],
  ['Surgery', 32],
  ['Obstetrics & Gynaecology', 30],
  ['Community Medicine', 30],
  ['Anatomy', 17],
  ['Physiology', 17],
  ['Biochemistry', 17],
  ['Paediatrics', 15],
  ['Ophthalmology', 15],
  ['ENT', 15],
  ['Pathology', 13],
  ['Microbiology', 13],
  ['Pharmacology', 13],
  ['Radiology', 10],
  ['Forensic Medicine', 10],
  ['Psychiatry', 5],
  ['Dermatology', 5],
  ['Anaesthesia', 5],
  ['Orthopaedics', 5],
];

const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: 'Is MedSetu really free?',
    a: 'Yes — every paper, test and question on MedSetu is free, with no account and no paid tier. MedSetu is made by Naitik Library, a study hall in Gautam Nagar, New Delhi, and runs on voluntary donations from students and well-wishers.',
  },
  {
    q: 'What is the FMGE pass mark?',
    a: '150 out of 300. The FMGE has 300 multiple-choice questions in two parts of 150, each correct answer scores +1, and there is no negative marking — so attempting every question can only help you.',
  },
  {
    q: 'Are these the official FMGE question papers?',
    a: 'No — NBEMS never releases official FMGE papers or answer keys. MedSetu’s papers are recall-based editions compiled from published compilations and student memory, and they are labelled as such wherever they appear. The explanations come from the published previous-year book the papers were compiled from.',
  },
  {
    q: 'What is the MedSetu Test Series?',
    a: 'Thirty grand tests of 300 questions each — a full FMGE paper, in two parts of 150 — built from MedSetu’s question bank and previous-year questions in the official NBEMS subject mix. Every question carries a short learning point drawn from its explanation, no question repeats across the series, and together the 30 tests touch all 699 of the question bank’s topics — the whole syllabus.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. You enter your name once, in this browser tab only, and start. Your name, answers, mistakes and bookmarks are stored only in your tab and disappear when you close it — MedSetu has no server and no database, and collects nothing.',
  },
  {
    q: 'Who makes MedSetu?',
    a: 'Naitik Library — a study hall for medical students in Gautam Nagar, New Delhi, founded by Naitik Gaur — built MedSetu so its students could sit previous-year papers under real exam conditions, and then put it online free for every FMGE student.',
  },
];

const STEPS = [
  {
    n: '1',
    title: 'Let’s Start',
    body: 'The button takes you to a short gate: your name and one quick human check. The gate creates no account, and your name stays in this tab.',
  },
  {
    n: '2',
    title: 'Pick your practice',
    body: 'Choose a full previous-year paper — twelve of them, December 2020 to June 2026 — a grand test from the 30-test series, a subject-wise test on one subject at a time, or the question bank, topic by topic.',
  },
  {
    n: '3',
    title: 'Attempt it, or practise it',
    body: 'Papers and tests open in the exam window — parts, palette, mark-for-review, the clock. In the question bank you can also choose Practice mode: check each answer and read its explanation as you go.',
  },
  {
    n: '4',
    title: 'Read the analysis',
    body: 'An eight-part analysis: your score against the 150 pass mark — or the 50% benchmark for a subject test, grand test or bank set — where the marks leaked, how you spent your time, and every solution a click away, with a structured PDF to download.',
  },
];

const ANALYSIS_POINTS = [
  'Your score against the real pass mark of 150 — and the gap, stated plainly.',
  'Subject-wise accuracy set against the official NBEMS blueprint, so effort goes where the marks are.',
  'Every question classified — Perfect, Overtime, Confused, Wasted or Painful — with the reason for the label written out, so you can see exactly how marks leaked.',
  'Your question journey: every answer you changed, what it gained or cost, and the questions you kept coming back to.',
  'You will not be given a rank or a percentile: MedSetu has no cohort of other students to rank you against, so it does not invent one.',
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {/* AdSense loads on this page only, and only once configured in
          src/lib/ads.ts — inert (renders nothing) until then. */}
      <AdSenseLoader />

      {/* ---------- Hero: deep teal band, the product shown, one CTA ---------- */}
      <section className="bg-med-abyss text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:pb-20 lg:pt-16">
          <div>
            <h1 className="text-[40px] font-bold leading-[1.08] tracking-tight sm:text-5xl">
              The complete FMGE practice package.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
              Twelve previous-year papers as full mock tests in the window you will face on exam
              day — two parts of 150 questions, 150 minutes a part, marked against the real pass
              mark of 150. A test series of 30 grand tests where every question carries a learning
              point. Subject-wise tests, one subject at a time. And a question bank of 15,607
              questions, every one with its explanation, so daily practice sits behind the mocks.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/start/"
                className="rounded-lg bg-white px-7 py-3.5 text-base font-bold text-med-deep shadow-lift transition-colors hover:bg-med-soft"
              >
                Let&apos;s Start →
              </Link>
              <Link
                href="/tests/"
                className="text-[15px] font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
              >
                Explore the Test Series
              </Link>
              <a
                href="#how"
                className="text-[15px] font-semibold text-white underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Free for every student · no sign-up · your name and answers never leave this tab
            </p>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* ---------- Facts strip ---------- */}
      <section aria-label="The FMGE pattern" className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-7 sm:px-6 md:grid-cols-5">
          {FACTS.map(([big, small]) => (
            <div key={small}>
              <p className="text-[26px] font-bold tabular-nums leading-none text-med-deep">{big}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-inksoft">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Four ways to practise ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:pt-16">
        <h2 className="text-[28px] font-bold tracking-tight text-ink">Four ways to practise</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
          Pick the shape of practice your preparation needs today — a full paper, a grand test, one
          subject, or a topic at a time. Everything opens in the same exam window and ends in the
          same detailed analysis.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODES.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className="group relative rounded-xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-med/40 hover:shadow-lift"
            >
              {m.badge && (
                <span className="absolute right-4 top-4 rounded bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  {m.badge}
                </span>
              )}
              <h3 className="text-[17px] font-bold text-ink group-hover:text-med-deep">{m.title}</h3>
              <p className="mt-1 text-[13px] font-semibold tabular-nums text-med-deep">{m.count}</p>
              <p className="mt-2 text-sm leading-relaxed text-inksoft">{m.body}</p>
              <p className="mt-3 text-sm font-bold text-med">Open →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- What you get ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <h2 className="text-[28px] font-bold tracking-tight text-ink">What you get</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
          MedSetu does one thing, completely: FMGE practice, sat properly and marked honestly —
          previous-year papers as full mocks, subject-wise tests one subject at a time, and a
          question bank for daily practice. There are no courses or add-ons waiting behind it.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-xl border border-line bg-white p-6 shadow-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-med-soft text-med-deep">
                <Icon d={f.icon} />
              </span>
              <h3 className="mt-4 text-[17px] font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Inside a solution: the artefact, shown ---------- */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-16">
          <div>
            <h2 className="text-[28px] font-bold tracking-tight text-ink">
              See exactly where a mark went
            </h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
              This is a real question from the January 2024 paper, with the explanation as it is
              printed in the book MedSetu is built from. After a test, every one of your questions
              opens like this — and in the bank’s Practice mode, the explanation is there the
              moment you check your answer.
            </p>
            <div className="mt-6 rounded-xl border border-line bg-paper p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-inksoft">
                  FMGE January 2024 · Question 115 · Community Medicine
                </p>
                <span className="rounded bg-med-soft px-2 py-0.5 text-[11px] font-semibold text-med-deep">
                  From the book
                </span>
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink">
                Mid-year population is the denominator in?
              </p>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li className="flex items-center justify-between rounded-lg border border-ok bg-ok-soft px-3 py-2 font-semibold text-ink">
                  <span>A. CDR</span>
                  <span className="text-xs font-bold text-ok">Correct answer</span>
                </li>
                {['B. CFR', 'C. MMR', 'D. NMR'].map((o) => (
                  <li key={o} className="rounded-lg border border-line bg-white px-3 py-2 text-inksoft">
                    {o}
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-line pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-inksoft">
                  Explanation — as printed in the book
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">
                  “The mid-year population is commonly used as the denominator in rates that measure
                  events occurring in the entire population over a year. The best example is the
                  Crude Death Rate (CDR). The mid-year population (usually estimated on 1st July)
                  represents the average population at risk during the year, making it the most
                  appropriate denominator.”
                </p>
                <p className="mt-1.5 text-sm text-inksoft">
                  The book’s note goes on to show why each of the other three options is wrong —
                  and on MedSetu, it is all there under the question.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:pt-[104px]">
            <h3 className="text-lg font-bold text-ink">And around every answer, the full picture</h3>
            <ul className="mt-4 space-y-3.5">
              {ANALYSIS_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-ink">
                  <svg viewBox="0 0 12 12" className="mt-[7px] h-3 w-3 shrink-0" fill="none" aria-hidden>
                    <path d="M2 6.5 4.8 9 10 3" stroke="#006D77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- The FMGE pattern & subject weightage ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <h2 className="text-[28px] font-bold tracking-tight text-ink">
          The FMGE pattern — and where the marks are
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
          The FMGE is a single paper of <strong className="text-ink">300 multiple-choice
          questions</strong>, sat in two parts of 150 with a break between them. Every correct
          answer scores +1, a wrong or skipped answer scores 0 — there is{' '}
          <strong className="text-ink">no negative marking</strong> — and you pass at{' '}
          <strong className="text-ink">150 out of 300</strong>. The parts are not divided by
          subject; the table below is the official NBEMS subject distribution across the whole
          paper, which is also the mix MedSetu’s mocks and grand tests are built to.
        </p>
        <div className="mt-8 overflow-hidden rounded-xl border border-line bg-white shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-mist text-left">
                <th className="px-4 py-3 font-bold text-ink">Subject</th>
                <th className="px-4 py-3 text-right font-bold text-ink">Questions in 300</th>
                <th className="hidden px-4 py-3 font-bold text-ink sm:table-cell">Share</th>
              </tr>
            </thead>
            <tbody>
              {WEIGHTAGE.map(([subject, n]) => (
                <tr key={subject} className="border-b border-line/60 last:border-0">
                  <td className="px-4 py-2.5 font-medium text-ink">{subject}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-med-deep">{n}</td>
                  <td className="hidden px-4 py-2.5 sm:table-cell">
                    <span className="block h-2 rounded bg-med-soft">
                      <span className="block h-2 rounded bg-med" style={{ width: `${(n / 33) * 100}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-inksoft">
          Subject distribution per the NBEMS FMGE information bulletin (Radiology combines
          Radio-diagnosis and Radiotherapy). Four subjects — Medicine, Surgery, Obstetrics &amp;
          Gynaecology and Community Medicine — carry 125 of the 300 marks between them; MedSetu’s
          analysis measures your accuracy subject by subject against this same blueprint.
        </p>
      </section>

      {/* ---------- Ad: mid-page unit (homepage only, when configured) ---------- */}
      <AdUnit slot="homeMid" />

      {/* ---------- How it works ---------- */}
      <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-14 sm:px-6 lg:py-16">
        <h2 className="text-[28px] font-bold tracking-tight text-ink">How it works</h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
          From this page to a marked paper in four steps — under a minute to be inside your first
          test.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-xl border border-line bg-white p-6 shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-med text-[15px] font-bold tabular-nums text-white">
                {s.n}
              </span>
              <h3 className="mt-4 text-[16px] font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Questions students ask ---------- */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <h2 className="text-[28px] font-bold tracking-tight text-ink">Questions students ask</h2>
          <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {HOME_FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-[16px] font-bold text-ink">{f.q}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-inksoft">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- About / where MedSetu comes from ---------- */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <div className="max-w-3xl">
            <h2 className="text-[28px] font-bold tracking-tight text-ink">
              Built by a study hall in Gautam Nagar
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">
              MedSetu was made by the efforts of Naitik Library — a study hall for medical students
              in Gautam Nagar, New Delhi, founded by Naitik Gaur. Students preparing there needed
              previous-year papers they could sit under real exam conditions, with the book’s
              explanations attached. MedSetu is that, put online for every FMGE student, free.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">
              It is built honestly: NBEMS never releases official papers, so MedSetu’s are
              recall-based editions and are labelled as such wherever they appear. The ten book
              papers carry the book’s own explanations; the two 2026 papers carry answers only,
              and say so. The question bank is compiled from published FMGE and entrance-exam
              compilations, organised by subject and topic. Nothing here is dressed up as
              something it is not.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[15px] font-semibold">
              <Link href="/about/" className="text-med hover:underline">
                About MedSetu &amp; the full method →
              </Link>
              <Link href="/naitik-library/" className="text-med hover:underline">
                About Naitik Library →
              </Link>
            </div>
            <p className="mt-4 text-sm text-inksoft">
              Questions or help: <span className="font-semibold tabular-nums text-ink">{PHONES}</span>
            </p>
          </div>

          <div className="mt-10">
            <DonateStrip />
          </div>

          {/* Final call to action */}
          <div className="mt-6 rounded-2xl bg-med-deep px-6 py-10 text-center text-white sm:px-10">
            <h2 className="text-[26px] font-bold tracking-tight sm:text-3xl">
              Your next mock is one click away.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-[15px] leading-relaxed text-white/85">
              Twelve papers, thirty grand tests, thirty subject-wise tests and a question bank of
              15,607 are waiting — the real window, the real pass mark. It takes under a minute to
              be inside the first one.
            </p>
            <Link
              href="/start/"
              className="mt-6 inline-block rounded-lg bg-white px-8 py-3.5 text-base font-bold text-med-deep shadow-lift transition-colors hover:bg-med-soft"
            >
              Let&apos;s Start →
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-white/70">{CREDIT_LINE}</p>
          </div>
        </div>
      </section>

      {/* ---------- Ad: bottom unit, just above the footer (homepage only) ---------- */}
      <AdUnit slot="homeBottom" />

      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: HOME_FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
    </div>
  );
}
