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
};

const WHY = [
  {
    title: 'Recall beats re-reading',
    body: 'Testing yourself is one of the two study methods research consistently rates highest. A flashcard forces the answer out of memory before showing it — that effort is what makes it stick.',
  },
  {
    title: 'Asked the way the exam asks',
    body: 'Every card is built from a previous-year question style: most common, drug of choice, nerve injured, value, sign, exception. The front is the cue the examiner gives; the back is the one fact that earns the mark.',
  },
  {
    title: 'The pile that shrinks',
    body: 'Sort each card into "got it" or "still learning". Finish a deck, then re-run only the still-learning pile. Two or three rounds and a subject’s weak facts are isolated and fixed.',
  },
  {
    title: 'Nothing stored, ever',
    body: 'Your sorting lives only in the tab you are using — MedSetu has no accounts and no database. Close the tab and the deck resets, ready for tomorrow’s spaced round.',
  },
];

const FAQ = [
  {
    q: 'How many flashcards are there?',
    a: '50 per subject across all 19 FMGE subjects — 950 cards in total, each one a single high-yield fact drawn from what previous-year papers actually ask.',
  },
  {
    q: 'How should I use the decks?',
    a: 'One subject at a time. Flip each card only after you have said the answer in your head, sort honestly, then re-run the still-learning pile until it is empty. Come back the next day and do it again — the spacing is what moves facts into long-term memory.',
  },
  {
    q: 'Are flashcards a replacement for mock tests?',
    a: 'No — they are the recall layer of a complete preparation. Flashcards fix individual facts; the question bank builds topic strength; full mock tests build the stamina and judgement for 300 questions. MedSetu has all three, free.',
  },
];

export default function FlashcardsIndex() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="pt-12 lg:pt-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-med">Active recall</p>
          <h1 className="mt-2 max-w-3xl text-[36px] font-bold leading-[1.1] tracking-tight text-ink sm:text-[44px]">
            Flashcards that make it stick.
          </h1>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-inksoft">
            {totalCards().toLocaleString('en-IN')} cards, 50 per subject, each one a fact the FMGE
            has asked before in some form. Flip, recall, sort — and watch the still-learning pile
            shrink round by round.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/notes/" className="rounded-lg bg-med px-6 py-3 text-[15px] font-bold text-white shadow-card transition-colors hover:bg-med-deep">
              Read the short notes first →
            </Link>
            <Link href="/tests/" className="rounded-lg border border-line bg-white px-6 py-3 text-[15px] font-bold text-med-deep transition-colors hover:bg-mist">
              Sit a full grand test
            </Link>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map((h) => (
            <article key={h.title} className="rounded-xl border border-line bg-white p-6 shadow-card">
              <h2 className="text-[16px] font-bold text-ink">{h.title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{h.body}</p>
            </article>
          ))}
        </section>

        <section className="py-14">
          <h2 className="text-[28px] font-bold tracking-tight text-ink">Pick a deck</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
            Ordered by weight in the paper. Each deck pairs with the same subject’s short notes —
            read the notes, then make the facts yours here.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVISE_SUBJECTS.map((s) => {
              const n = cardCount(s.slug);
              const notes = getNotes(s.slug);
              return (
                <Link
                  key={s.slug}
                  href={`/flashcards/${s.slug}/`}
                  className="group rounded-xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-med/40 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-[17px] font-bold text-ink group-hover:text-med-deep">{s.name}</h3>
                    <span className="shrink-0 rounded bg-med-soft px-2 py-0.5 text-[12px] font-bold tabular-nums text-med-deep">
                      {s.weight} / 300
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{notes ? notes.tagline : s.blurb}</p>
                  <p className="mt-3 text-[13px] font-semibold tabular-nums text-med-deep">{n} flashcards</p>
                  <p className="mt-1 text-sm font-bold text-med">Start the deck →</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="border-t border-line py-14">
          <h2 className="text-[28px] font-bold tracking-tight text-ink">Questions students ask</h2>
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
    </div>
  );
}
