import Link from 'next/link';
import { SiteFooter, DonateBlock } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';

export const metadata = {
  title: 'Resources — MedSetu by Naitik Library',
  description:
    'Free FMGE study resources from MedSetu by Naitik Library: subject-wise weightage counted from 9,000 practice questions, a 300-question grand-test strategy guide, and a 30-day revision plan for the next sitting.',
  alternates: { canonical: '/resources/' },
};

const ARTICLES = [
  {
    href: '/resources/fmge-subject-wise-weightage/',
    title: 'FMGE Subject-Wise Weightage: What 9,000 Practice Questions Reveal',
    description:
      'The exact subject-wise split behind MedSetu\u2019s 9,000-question FMGE grand-test bank \u2014 all 19 subjects counted, so you can plan revision by weight, not by guesswork.',
  },
  {
    href: '/resources/how-to-attempt-grand-test/',
    title: 'How to Attempt a 300-Question FMGE Grand Test: A Two-Part Strategy Guide',
    description:
      'A practical, minute-by-minute strategy for attempting a 300-question FMGE grand test \u2014 pacing for Part A and Part B, when to guess, and how to mine the analysis afterwards.',
  },
  {
    href: '/resources/fmge-30-day-revision-plan/',
    title: 'FMGE Next Sitting: A 30-Day Revision Plan Using Grand Tests',
    description:
      'A week-by-week 30-day FMGE revision plan for the next sitting \u2014 grand tests as the spine, subject weightage as the map, and Topic Analysis as the steering wheel.',
  },
];

export default function Resources() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <h1 className="max-w-2xl text-4xl font-bold leading-snug tracking-tight text-ink sm:text-h1">
            Resources for the FMGE.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            Study guides written from MedSetu&apos;s own practice data \u2014 counted, not copied.
            Every number in these articles is either counted from the MedSetu question bank or
            cited from NBEMS. Free, like everything else here.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Study guides</h2>
          <div className="mt-4 space-y-4">
            {ARTICLES.map((a) => (
              <article key={a.href} className="rounded-xl border border-line bg-white px-5 py-5 shadow-card">
                <h3 className="mt-1.5 text-lg font-bold leading-snug text-ink">
                  <Link href={a.href} className="hover:text-med hover:underline">
                    {a.title}
                  </Link>
                </h3>
                <p className="mt-1.5 leading-relaxed text-inksoft">{a.description}</p>
                <p className="mt-3">
                  <Link href={a.href} className="font-semibold text-med hover:underline">
                    Read the guide \u2192
                  </Link>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Practise with MedSetu</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            The guides point at the practice they are built on. Everything below is free and
            needs no sign-up.
          </p>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <Link href="/tests/" className="font-semibold text-med hover:underline">
                Grand Test series
              </Link>{' '}
              \u2014 30 full-length tests of 300 questions each (9,000 questions, 697 topics),
              in the real two-part FMGE format.
            </li>
            <li>
              <Link href="/subjects/" className="font-semibold text-med hover:underline">
                Subject-wise tests
              </Link>{' '}
              \u2014 30 tests across 16 subjects, one subject at a time, every question with
              its full explanation.
            </li>
            <li>
              <Link href="/qbank/" className="font-semibold text-med hover:underline">
                Question Bank
              </Link>{' '}
              \u2014 13,934 questions across all 19 subjects, in Practice and Exam modes.
            </li>
            <li>
              <Link href="/papers/" className="font-semibold text-med hover:underline">
                Previous-year papers
              </Link>{' '}
              \u2014 twelve papers, December 2020 to June 2026, as full mock tests.
            </li>
          </ul>
        </section>

        <div className="mt-10">
          <DonateBlock />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
