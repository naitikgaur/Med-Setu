import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteChrome';
import { REVISE_SUBJECTS, getNotes, cardCount, totalCards } from '../../lib/notes';

export const metadata: Metadata = {
  title: 'FMGE Flashcards — Active Recall Decks for All 19 Subjects | MedSetu',
  description:
    'Free FMGE flashcards for all 19 subjects: flip, recall, sort into "got it" and "still learning", and shrink the pile. Built from previous-year papers. No sign-up, nothing stored — MedSetu.',
  alternates: { canonical: '/flashcards/' },
  openGraph: {
    title: 'FMGE Flashcards — Active Recall Decks for All 19 Subjects | MedSetu',
    description:
      '950 flashcards built from previous-year FMGE papers: flip, recall, sort into got it and still learning, and shrink the pile. Free, no sign-up.',
    type: 'website',
  },
};

const WHY = [
  {
    title: 'Recall beats re-reading',
    body: 'A flashcard forces the answer out of memory before showing it — that effort is what makes it stick.',
  },
  {
    title: 'Asked the way the exam asks',
    body: 'Built from previous-year question styles: most common, drug of choice, nerve injured, value, sign, exception.',
  },
  {
    title: 'The pile that shrinks',
    body: 'Sort each card into "got it" or "still learning", then re-run only the still-learning pile until it is empty.',
  },
  {
    title: 'Nothing stored, ever',
    body: 'Your sorting lives only in this tab — no accounts, no database. Close the tab and the deck resets.',
  },
];

const FAQ = [
  {
    q: 'How many flashcards are there?',
    a: '50 per subject across all 19 FMGE subjects — 950 cards in total, each one a single high-yield fact drawn from what previous-year papers actually ask.',
  },
  {
    q: 'How should I use the decks?',
    a: 'One subject at a time. Say the answer in your head before flipping, sort honestly, then re-run the still-learning pile until it is empty. Repeat the next day — the spacing moves facts into long-term memory.',
  },
  {
    q: 'Are flashcards a replacement for mock tests?',
    a: 'No — they are the recall layer. Flashcards fix individual facts; the question bank builds topic strength; mock tests build stamina for 300 questions. MedSetu has all three, free.',
  },
];

export default function FlashcardsIndex() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="soft-band mt-8 rounded-[28px] px-6 py-10 shadow-card ring-1 ring-med-line/40 sm:px-10 lg:mt-10 lg:py-12">
          <h1 className="mt-2 max-w-3xl text-4xl text-ink sm:text-h1">
            Flashcards that make it stick.
          </h1>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-inksoft">
            {totalCards().toLocaleString('en-IN')} cards, 50 per subject, each one a fact the FMGE
            has asked before in some form. Flip, recall, sort — and watch the still-learning pile
            shrink round by round.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/notes/" className="btn-primary rounded-full px-7 py-3.5 text-[15px] font-bold text-white">
              Read the short notes first →
            </Link>
            <Link href="/tests/" className="rounded-full border border-line/80 bg-white px-7 py-3.5 text-[15px] font-bold text-med-deep shadow-card transition hover:bg-mist">
              Sit a full grand test
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((h) => (
            <article key={h.title} className="rounded-2xl border border-line/70 bg-white p-6 shadow-card">
              <h2 className="text-[16px] font-bold text-ink">{h.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{h.body}</p>
            </article>
          ))}
        </section>

        <section className="py-14">
          <h2 className="text-h2 text-ink">Pick a deck</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
            Ordered by weight in the paper. Each deck pairs with the same subject’s short notes.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVISE_SUBJECTS.map((s) => {
              const n = cardCount(s.slug);
              const notes = getNotes(s.slug);
              return (
                <Link
                  key={s.slug}
                  href={`/flashcards/${s.slug}/`}
                  className="group rounded-2xl border border-line/70 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-med/40 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[17px] font-bold text-ink group-hover:text-med-deep">{s.name}</h3>
                    <span className="shrink-0 rounded-full bg-med-soft px-2.5 py-0.5 text-[12px] font-bold tabular-nums text-med-deep">
                      {s.weight} / 300
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{notes ? notes.tagline : s.blurb}</p>
                  <p className="mt-3 text-[13px] font-semibold tabular-nums text-med-deep">{n} flashcards</p>
                  <span aria-hidden className="mt-4 block h-1.5 overflow-hidden rounded-full bg-mist">
                    <span className="block h-full rounded-full bg-gradient-to-r from-med-bright to-med-deep" style={{ width: `${(s.weight / 33) * 100}%` }} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-med">Start the deck →</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-line py-14">
          <h2 className="text-h2 text-ink">Questions students ask</h2>
          <div className="mt-8 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {FAQ.map((f) => (
              <div key={f.q}>
                <h3 className="text-[16px] font-bold text-ink">{f.q}</h3>
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
            '@type': 'ItemList',
            name: 'MedSetu Flashcards — FMGE active recall decks by subject',
            numberOfItems: REVISE_SUBJECTS.length,
            itemListElement: REVISE_SUBJECTS.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://med-setu.netlify.app/flashcards/${s.slug}/`,
              name: `${s.name} — FMGE flashcards`,
            })),
          }),
        }}
      />
    </div>
  );
}
