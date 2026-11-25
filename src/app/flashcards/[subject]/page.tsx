import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteChrome';
import { FlashDeck } from '../../../components/FlashDeck';
import { REVISE_SUBJECTS, getCards, getNotes } from '../../../lib/notes';

export function generateStaticParams() {
  return REVISE_SUBJECTS.map((s) => ({ subject: s.slug }));
}

export function generateMetadata({ params }: { params: { subject: string } }): Metadata {
  const meta = REVISE_SUBJECTS.find((s) => s.slug === params.subject);
  const deck = getCards(params.subject);
  if (!meta || !deck) return {};
  return {
    title: `${meta.name} Flashcards — FMGE Active Recall Deck | MedSetu`,
    description: `${deck.cards.length} ${meta.name} flashcards for FMGE revision: previous-year facts as active recall — most commons, drugs of choice, signs, values and exceptions. Free on MedSetu, no sign-up.`,
    alternates: { canonical: `/flashcards/${params.subject}/` },
  };
}

export default function SubjectFlashcardsPage({ params }: { params: { subject: string } }) {
  const meta = REVISE_SUBJECTS.find((s) => s.slug === params.subject);
  const deck = getCards(params.subject);
  if (!meta || !deck) notFound();
  const notes = getNotes(params.subject);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="print-note">
        <p><strong>MedSetu — {meta.name} flashcards</strong></p>
        <p>
          Flashcards work by recalling on screen — they are free to use any time at
          med-setu.netlify.app/flashcards/{params.subject}/, so printing keeps only this pointer.
        </p>
      </div>
      <main id="content" className="web-only mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="pt-10 lg:pt-14">
          <nav aria-label="Breadcrumb" className="text-[13px] font-medium text-inksoft">
            <Link href="/flashcards/" className="text-med hover:underline">Flashcards</Link>
            <span aria-hidden> / </span>
            <span className="text-ink">{meta.name}</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
              {meta.name} flashcards
            </h1>
            <span className="rounded bg-med-soft px-2.5 py-1 text-[13px] font-bold tabular-nums text-med-deep">
              {deck.cards.length} cards
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-inksoft">
            Say the answer in your head <em>before</em> you flip — the effort of recalling is the
            whole point. Sort honestly: a card you nearly knew is still learning.
            {notes && (
              <>
                {' '}New to a fact? It is explained in the{' '}
                <Link href={`/notes/${params.subject}/`} className="font-semibold text-med hover:underline">
                  {meta.name} short notes
                </Link>
                .
              </>
            )}
          </p>
        </section>

        <section className="py-10">
          <FlashDeck cards={deck.cards} subject={meta.name} />
        </section>

        <section className="mb-14 grid gap-4 sm:grid-cols-2">
          {notes && (
            <Link href={`/notes/${params.subject}/`} className="group rounded-xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-med/40">
              <h3 className="text-[17px] font-bold text-ink group-hover:text-med-deep">Back to the notes</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
                Re-read the {meta.name} short notes — topics, tables, traps and the mind map.
              </p>
              <p className="mt-3 text-sm font-bold text-med">Open notes →</p>
            </Link>
          )}
          <Link href={`/qbank/${params.subject}/`} className="group rounded-xl bg-med-deep p-6 text-white shadow-card transition-all hover:-translate-y-0.5">
            <h3 className="text-[17px] font-bold">Prove it in questions</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85">
              {meta.name} questions from the bank with full explanations — recall under exam conditions.
            </p>
            <p className="mt-3 text-sm font-bold">Open the question bank →</p>
          </Link>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'MedSetu', item: 'https://med-setu.netlify.app/' },
              { '@type': 'ListItem', position: 2, name: 'Flashcards', item: 'https://med-setu.netlify.app/flashcards/' },
              { '@type': 'ListItem', position: 3, name: `${meta.name} flashcards`, item: `https://med-setu.netlify.app/flashcards/${params.subject}/` },
            ],
          }),
        }}
      />
    </div>
  );
}
