import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter, DonateStrip, CREDIT_LINE, PHONES } from '../components/SiteChrome';
import { AdSenseLoader, AdUnit } from '../components/AdSense';
import HeroVisual from '../components/HeroVisual';

export const metadata: Metadata = {
  title: 'MedSetu — Complete FMGE Preparation for Medical Students',
  description:
    'Free FMGE preparation by Naitik Library: previous-year papers as full mocks, 30 grand tests, 13,934 explained questions, short notes and 950 flashcards.',
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

const FEATURES: { title: string; body: string; icon: React.ReactNode; cluster: number; lead?: boolean }[] = [
  {
    title: 'The real exam window',
    cluster: 0,
    lead: true,
    body: 'Tests open in a window modelled on the TCS iON screen the FMGE is held on — same palette, same buttons, same two-part rhythm. On exam day, nothing about the screen is new to you.',
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
    cluster: 0,
    body: 'December 2020 to June 2026, every paper a full 300 questions. Where a recall source runs short, added questions are flagged with the paper they came from.',
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
    cluster: 0,
    body: 'One subject at a time — 19 to 50 questions in the same exam window, every question explained, scored against the 50% FMGE pass proportion.',
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
    cluster: 2,
    body: '13,934 questions across all 19 subjects, organised by topic, every one with its answer and explanation. Practise in sets of 20, 50 or a whole subject.',
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
    cluster: 2,
    body: 'Check each answer as you go and read the explanation straight away. Wrong answers are saved to My Mistakes — replay one, answer it right, and it clears.',
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12.2 2.4 2.4 4.6-5" />
      </>
    ),
  },
  {
    title: 'The book’s explanations',
    cluster: 1,
    body: 'The ten book papers carry the explanations printed in the FMGE previous-year book — word for word. The two 2026 papers carry answers only, and say so plainly.',
    icon: (
      <>
        <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2Z" />
        <path d="M12 6.5v13" />
      </>
    ),
  },
  {
    title: 'Click a question, read its solution',
    cluster: 1,
    body: 'Your analysis lists all 300 questions — open any one to see the correct option, your answer, and the full explanation.',
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
    cluster: 1,
    body: 'Every question with the correct option, its explanation and your answer beside it — a revision document you keep. A one-page key is there too, for a fast count.',
    icon: (
      <>
        <path d="M12 4v9.5m0 0L8.5 10M12 13.5l3.5-3.5" />
        <path d="M4.5 16.5v2A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-2" />
      </>
    ),
  },
  {
    title: 'The images are in',
    cluster: 1,
    body: 'Image-based questions carry the actual X-ray, slide, ECG or diagram from the source book. Where an image could not be recovered, the question tells you instead of guessing.',
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
    cluster: 0,
    body: '9,000 questions across 30 tests of 300 — no repeats — in the official subject mix. Finish the series and you have covered the entire syllabus, topic by topic.',
    icon: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
        <path d="M4 10l6-6 6 8" />
      </>
    ),
  },
  {
    title: 'A learning for every question',
    cluster: 1,
    body: 'Every Test Series question carries a short learning point — the one fact it was really testing — inside the solution and the printed key.',
    icon: (
      <>
        <path d="M9 18h6M10 21h4" />
        <path d="M12 3a6 6 0 0 0-3.5 10.9c.7.5 1 1.2 1 2.1h5c0-.9.3-1.6 1-2.1A6 6 0 0 0 12 3Z" />
      </>
    ),
  },
  {
    title: 'Analysis in eight parts',
    cluster: 1,
    lead: true,
    body: 'Every attempt ends in an eight-part analysis — performance, time, topics, question journey and every solution — with a matching downloadable PDF.',
    icon: (
      <>
        <path d="M4 4h16M4 9.3h16M4 14.6h16M4 20h16" />
        <path d="M8.5 4v5.3M15 9.3v5.3M11 14.6V20" />
      </>
    ),
  },
  {
    title: 'Short notes built from PYQs',
    cluster: 2,
    lead: true,
    body: 'Rapid-revision notes for all 19 subjects, built from five years of FMGE papers — crisp fact lines, comparison tables, marked exam traps and night-before golden points.',
    icon: (
      <>
        <path d="M6 3.5h9L19 7.5v13H6v-17Z" />
        <path d="M14.5 3.5v4.5H19M9 12h6M9 15.5h6M9 8.5h2.5" />
      </>
    ),
  },
  {
    title: 'Flashcards & mind maps',
    cluster: 2,
    body: '950 flashcards — 50 per subject — for active recall, plus a one-screen mind map per subject, so the whole subject sits in your head as one picture.',
    icon: (
      <>
        <rect x="3" y="6" width="13" height="13" rx="2" />
        <path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h9A1.5 1.5 0 0 1 20 4.5v9a1.5 1.5 0 0 1-1.5 1.5H16" />
        <path d="M6.5 10.5h6M6.5 14h4" />
      </>
    ),
  },
  {
    title: 'Guides that teach the method',
    cluster: 2,
    body: '150 free guides — preparation strategy, subject methods, books, MBBS abroad, research, careers and clinical skills.',
    icon: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
        <path d="M4 18V5.5M20 18H6.5" />
        <path d="M8.5 7.5h7M8.5 11h5" />
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
    body: 'Previous-year papers as full mock tests in the real exam window — two parts, the real clock, the real pass mark of 150.',
    href: '/papers/',
  },
  {
    title: 'Test Series',
    count: '30 grand tests · 9,000 questions',
    body: 'Grand tests in the official subject mix, every question with a learning point. Together they cover almost the entire syllabus.',
    href: '/tests/',
  },
  {
    title: 'Subject-wise Tests',
    count: '16 subjects · 30 tests',
    body: 'One subject at a time, in the same exam window, every question explained — measured against the 50% pass proportion.',
    href: '/subjects/',
  },
  {
    title: 'Question Bank',
    count: '19 subjects · 13,934 questions',
    body: 'Topic-by-topic daily practice in sets of 20, 50 or a whole subject — with Practice mode, My Mistakes and Bookmarks.',
    href: '/qbank/',
  },
  {
    title: 'Short Notes',
    count: '19 subjects · rapid revision',
    body: 'The topics previous-year papers actually ask — key facts, comparison tables, exam traps, golden points and a mind map per subject.',
    href: '/notes/',
  },
  {
    title: 'Flashcards',
    count: '19 subjects · 950 cards',
    body: 'Flip, answer from memory, sort into “got it” and “still learning”, and shrink the pile round by round.',
    href: '/flashcards/',
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
    a: 'Yes — everything on MedSetu is free, with no account and no paid tier. It is made by Naitik Library, New Delhi, and runs on voluntary donations.',
  },
  {
    q: 'What is the FMGE pass mark?',
    a: '150 out of 300. The FMGE has 300 multiple-choice questions in two parts of 150, each correct answer scores +1, and there is no negative marking — so attempting every question can only help you.',
  },
  {
    q: 'Are these the official FMGE question papers?',
    a: 'No — NBEMS never releases official papers or keys. MedSetu’s papers are recall-based editions, labelled as such wherever they appear, with explanations from the published previous-year book.',
  },
  {
    q: 'What is the MedSetu Test Series?',
    a: 'Thirty grand tests of 300 questions each, in the official NBEMS subject mix, built from the question bank and previous-year questions. No question repeats, every question carries a learning point, and together they touch all 697 bank topics — the whole syllabus.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. Enter your name once, in this tab only, and start. Everything stays in your tab and disappears when you close it — MedSetu has no server, no database, and collects nothing.',
  },
  {
    q: 'What are the short notes and flashcards?',
    a: 'Rapid revision for all 19 subjects, built from what previous-year papers actually ask: short notes with comparison tables, exam traps and golden points, a one-screen mind map, and 50 flashcards per subject. Free on the site, not downloadable.',
  },
];

const CLUSTERS = [
  { name: 'Sit the exam before the exam', line: 'The full paper, in the real window, on the real clock.' },
  { name: 'Know where every mark went', line: 'After every test, the analysis shows exactly how your marks moved.' },
  { name: 'Revise until it sticks', line: 'Short notes, flashcards and guided practice for daily revision.' },
];

const STEPS = [
  {
    n: '1',
    title: 'Let’s Start',
    body: 'Your name and one quick human check. No account is created.',
  },
  {
    n: '2',
    title: 'Pick your preparation',
    body: 'A previous-year paper, a grand test, a subject-wise test, the question bank — or revise with short notes, mind maps and flashcards.',
  },
  {
    n: '3',
    title: 'Attempt it, or practise it',
    body: 'Tests open in the exam window — parts, palette, mark-for-review, the clock. In the bank, Practice mode explains each answer as you go.',
  },
  {
    n: '4',
    title: 'Read the analysis',
    body: 'An eight-part analysis: your score against the pass mark, where marks leaked, how you spent your time, and every solution — with a PDF to download.',
  },
];

const ANALYSIS_POINTS = [
  'Your score against the real pass mark of 150 — and the gap, stated plainly.',
  'Subject-wise accuracy against the official NBEMS blueprint, so effort goes where the marks are.',
  'Every question classified — Perfect, Overtime, Confused, Wasted or Painful — so you can see exactly how marks leaked.',
  'Your question journey: every answer you changed, and what it gained or cost.',
  'No rank or percentile: MedSetu has no cohort to rank you against, so it does not invent one.',
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {/* AdSense loads on this page only, and only once configured in
          src/lib/ads.ts — inert (renders nothing) until then. */}
      <AdSenseLoader />

      {/* ---------- Hero: deep teal band, the product shown, one CTA ---------- */}
      <section id="content" className="hero-band text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-28 pt-14 sm:px-6 lg:grid-cols-[1.02fr_1fr] lg:pb-32 lg:pt-20">
          <div className="rise-in">
            <h1 className="text-display text-white">
              The complete preparation platform for medical students.
            </h1>
            <p className="mt-5 max-w-xl text-subtitle leading-relaxed text-white/85">
              Everything an FMGE student needs, in one place and free: previous-year papers as full
              mock tests, a 30-test grand series, a 13,934-question bank with explanations — and
              short notes, mind maps and flashcards for all 19 subjects.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/start/"
                className="rounded-full bg-white px-8 py-4 text-base font-bold text-med-deep shadow-lift transition hover:-translate-y-0.5 hover:bg-med-soft"
              >
                Let&apos;s Start →
              </Link>
              <Link
                href="/notes/"
                className="rounded-full border border-white/35 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Revise with Short Notes
              </Link>
              <Link
                href="/flashcards/"
                className="rounded-full border border-white/35 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Try the flashcards
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/70">
              Free for every student · no sign-up · your name and answers never leave this tab
            </p>
          </div>
          <div className="rise-in" style={{ animationDelay: '140ms' }}><HeroVisual /></div>
        </div>
      </section>

      {/* ---------- Facts strip ---------- */}
      <section aria-label="The FMGE pattern" className="relative z-10 mx-auto -mt-16 w-full max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 rounded-3xl border border-line/60 bg-white px-6 py-7 shadow-lift md:grid-cols-5">
          {FACTS.map(([big, small]) => (
            <div key={small}>
              <p className="text-3xl font-extrabold tabular-nums leading-none tracking-tight text-med-deep">{big}</p>
              <p className="mt-1.5 text-caption leading-snug text-inksoft">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Four ways to practise ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6 lg:pt-16">
        <h2 className="text-h2 text-ink">Prepare every way that works</h2>
        <p className="mt-2 max-w-3xl text-body2 leading-relaxed text-inksoft">
          Learn it, revise it, recall it, then prove it under exam conditions.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODES.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className="group relative overflow-hidden rounded-2xl border border-line/70 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-med/40 hover:shadow-lift"
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-med-bright via-med to-med-deep opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              {m.badge && (
                <span className="absolute right-4 top-4 rounded-full bg-accent px-2.5 py-0.5 text-micro font-bold uppercase tracking-wide text-white shadow-card">
                  {m.badge}
                </span>
              )}
              <h3 className="text-subtitle font-bold text-ink group-hover:text-med-deep">{m.title}</h3>
              <p className="mt-1 text-caption font-semibold tabular-nums text-med-deep">{m.count}</p>
              <p className="mt-2 text-sm leading-relaxed text-inksoft">{m.body}</p>
              <p className="mt-3 text-sm font-bold text-med">Open →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- What you get ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <h2 className="text-h2 text-ink">What you get</h2>
        <p className="mt-2 max-w-3xl text-body2 leading-relaxed text-inksoft">
          Everything below is free — no courses, no paid add-ons waiting behind it.
        </p>
        <div className="mt-10 space-y-12">
          {CLUSTERS.map((c, ci) => (
            <div key={c.name}>
              <h3 className="text-h3 text-ink">{c.name}</h3>
              <p className="mt-1 text-body2 text-inksoft">{c.line}</p>
              <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
                {FEATURES.filter((f) => f.cluster === ci && f.lead).map((f) => (
                  <article key={f.title} className="rounded-2xl border border-med-line/70 bg-med-soft/30 p-6 shadow-card sm:p-7">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-med-deep shadow-card ring-1 ring-med-line/60">
                      <Icon d={f.icon} />
                    </span>
                    <h4 className="mt-4 text-lg font-bold text-ink">{f.title}</h4>
                    <p className="mt-1.5 text-body2 leading-relaxed text-inksoft">{f.body}</p>
                  </article>
                ))}
                <ul className="divide-y divide-line/70 rounded-2xl border border-line/70 bg-white px-6 shadow-card">
                  {FEATURES.filter((f) => f.cluster === ci && !f.lead).map((f) => (
                    <li key={f.title} className="flex gap-4 py-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-med-soft text-med-deep ring-1 ring-med-line/50">
                        <Icon d={f.icon} />
                      </span>
                      <span>
                        <span className="block text-body2 font-bold text-ink">{f.title}</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-inksoft">{f.body}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Inside a solution: the artefact, shown ---------- */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-16">
          <div>
            <h2 className="text-h2 text-ink">
              See exactly where a mark went
            </h2>
            <p className="mt-2 max-w-3xl text-body2 leading-relaxed text-inksoft">
              A real question from the January 2024 paper, with the explanation as printed in the
              book. After a test, every question opens like this.
            </p>
            <div className="mt-6 rounded-2xl border border-line/70 bg-paper p-5 shadow-card sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-inksoft">
                  FMGE January 2024 · Question 115 · Community Medicine
                </p>
                <span className="rounded bg-med-soft px-2 py-0.5 text-micro font-semibold text-med-deep">
                  From the book
                </span>
              </div>
              <p className="mt-3 text-body2 font-semibold text-ink">
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
              </div>
            </div>
          </div>
          <div className="lg:pt-[104px]">
            <h3 className="text-lg font-bold text-ink">And around every answer, the full picture</h3>
            <ul className="mt-4 space-y-3.5">
              {ANALYSIS_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-body2 leading-relaxed text-ink">
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
        <h2 className="text-h2 text-ink">
          The FMGE pattern — and where the marks are
        </h2>
        <p className="mt-2 max-w-3xl text-body2 leading-relaxed text-inksoft">
          One paper of <strong className="text-ink">300 multiple-choice questions</strong> in two
          parts of 150. Every correct answer scores +1, there is{' '}
          <strong className="text-ink">no negative marking</strong>, and you pass at{' '}
          <strong className="text-ink">150 out of 300</strong>. The table is the official NBEMS
          subject distribution — the same mix MedSetu’s mocks are built to.
        </p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-line/70 bg-white shadow-card">
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
                      <span className="block h-2 rounded bg-gradient-to-r from-med-bright to-med-deep" style={{ width: `${(n / 33) * 100}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-caption leading-relaxed text-inksoft">
          Per the NBEMS FMGE information bulletin (Radiology combines Radio-diagnosis and Radiotherapy).
        </p>
      </section>

      {/* ---------- Ad: mid-page unit (homepage only, when configured) ---------- */}
      <AdUnit slot="homeMid" />

      {/* ---------- How it works ---------- */}
      <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-8 px-4 py-14 sm:px-6 lg:py-16">
        <h2 className="text-h2 text-ink">How it works</h2>
        <p className="mt-2 max-w-3xl text-body2 leading-relaxed text-inksoft">
          Four steps — under a minute to your first test.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-line/70 bg-white p-6 shadow-card">
              <span className="step-num flex h-9 w-9 items-center justify-center rounded-full text-body2 font-bold tabular-nums text-white">
                {s.n}
              </span>
              <h3 className="mt-4 text-base font-bold text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Questions students ask ---------- */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <h2 className="text-h2 text-ink">Questions students ask</h2>
          <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {HOME_FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-bold text-ink">{f.q}</h3>
                <p className="mt-1.5 text-body2 leading-relaxed text-inksoft">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- About / where MedSetu comes from ---------- */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
          <div className="max-w-3xl">
            <h2 className="text-h2 text-ink">
              Built by a study hall in Gautam Nagar
            </h2>
            <p className="mt-3 text-body2 leading-relaxed text-ink">
              MedSetu was made by the efforts of Naitik Library — a study hall for medical students
              in Gautam Nagar, New Delhi, founded by Naitik Gaur — so its students could sit
              previous-year papers under real exam conditions, with the book’s explanations
              attached. It is now online for every FMGE student, free.
            </p>
            <p className="mt-3 text-body2 leading-relaxed text-ink">
              It is built honestly: NBEMS never releases official papers, so MedSetu’s are
              recall-based editions, labelled as such. Nothing here is dressed up as something it
              is not.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-body2 font-semibold">
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
          <div className="hero-band mt-6 rounded-[28px] px-6 py-12 text-center text-white shadow-lift sm:px-10">
            <h2 className="text-title font-bold tracking-tight sm:text-3xl">
              Your complete preparation is one click away.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-body2 leading-relaxed text-white/85">
              The real window, the real pass mark — under a minute to start.
            </p>
            <Link
              href="/start/"
              className="mt-6 inline-block rounded-full bg-white px-9 py-4 text-base font-bold text-med-deep shadow-lift transition hover:-translate-y-0.5 hover:bg-med-soft"
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
