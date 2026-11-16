import { SiteFooter } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';
import { SERIES_META } from '../../lib/series';
import TestsGate from './TestsGate';

export const metadata = {
  title: 'MedSetu Test Series — 30 free FMGE grand tests of 300 questions',
  description:
    'The MedSetu Test Series: 30 full-syllabus FMGE grand tests, 300 questions each in the official NBEMS mix — a full paper in two parts of 150 — drawn from previous-year papers and the MedSetu question bank. Every question carries an explanation and a one-line learning. Free, with a detailed 8-part analysis after every test.',
  alternates: { canonical: '/tests/' },
};

const FAQS = [
  {
    q: 'What is the MedSetu Test Series?',
    a: 'A set of 30 grand tests for FMGE preparation. Each test is a full FMGE paper: 300 questions across all 19 subjects in the official NBEMS proportions, sat in two parts of 150 with 150 minutes a part, in the same exam-style window as the real test — and measured against the real pass mark of 150.',
  },
  {
    q: 'Where do the questions come from?',
    a: 'Every question is drawn from MedSetu\u2019s own material: about a third of each test comes from previous-year FMGE papers, and the rest from the MedSetu question bank of 15,607 questions. No question repeats anywhere across the 30 tests, so the series gives you 9,000 distinct questions.',
  },
  {
    q: 'What is the "learning" attached to every question?',
    a: 'After you submit, every question\u2019s review shows a one-line learning — the key fact that question was testing, taken from its own explanation — alongside the full explanation. Reading the 150 learnings of a test is a fast revision of everything that test covered.',
  },
  {
    q: 'How much of the FMGE syllabus do the 30 tests cover?',
    a: 'Questions are dealt across topics in rotation, so the 30 tests together touch 698 of the 699 topic groups in the question bank — effectively the whole broad FMGE syllabus, most of it several times over.',
  },
  {
    q: 'How is a grand test marked?',
    a: '+1 for a correct answer, 0 for a wrong or skipped answer — there is no negative marking in FMGE. Each grand test is a full 300-question paper, so your analysis measures you against the real pass mark itself: 150 of 300.',
  },
  {
    q: 'Is the Test Series free?',
    a: 'Yes — completely free, like everything on MedSetu. There is no account and no sign-up; your name and attempts stay in your own browser tab and are never sent anywhere.',
  },
];

export default function TestsPage() {
  const totalPyq = SERIES_META.reduce((n, t) => n + t.pyqCount, 0);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-wide text-med">MedSetu Test Series</p>
        <h1 className="mt-1.5 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          30 grand tests. The whole FMGE syllabus, one paper at a time.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft">
          Each grand test is a complete FMGE paper: <strong className="text-ink">300
          questions in two parts of 150</strong>, every one of the 19 subjects present in the official
          NBEMS proportions — Medicine, Surgery, Obstetrics &amp; Gynaecology and Community
          Medicine heaviest, exactly as the real exam weights them. About a third of every test is
          previous-year FMGE questions; the rest comes from the MedSetu question bank. No question
          repeats anywhere in the series.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
          What makes the series different is what happens after you submit. Every question carries
          a <strong className="text-ink">one-line learning</strong> — the key fact it was testing —
          inside a detailed eight-part analysis: overview, performance, score potential, attempt
          analysis, time analysis, topic analysis, your question journey, and a question-by-question
          review you can download and re-read.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {[
            ['30', 'grand tests'],
            ['9,000', 'questions, zero repeats'],
            [`${totalPyq.toLocaleString('en-IN')}`, 'from previous-year papers'],
            ['698 / 699', 'syllabus topics covered'],
          ].map(([big, small]) => (
            <div key={small} className="bg-white px-4 py-3.5 text-center">
              <p className="text-[22px] font-bold tabular-nums text-med-deep">{big}</p>
              <p className="mt-0.5 text-xs font-medium text-inksoft">{small}</p>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <TestsGate />
        </div>

        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Questions about the Test Series
          </h2>
          <div className="mt-4 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-xl border border-line bg-white p-5 shadow-card">
                <h3 className="font-bold text-ink">{f.q}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-inksoft">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'MedSetu Test Series — 30 FMGE grand tests',
            numberOfItems: SERIES_META.length,
            itemListElement: SERIES_META.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${t.title} — MedSetu Test Series`,
              url: `https://med-setu.netlify.app/tests/${t.testId}/`,
            })),
          }),
        }}
      />
    </div>
  );
}
