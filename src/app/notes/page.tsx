import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteChrome';
import { REVISE_SUBJECTS, getNotes, notesStats, totalNotePoints } from '../../lib/notes';

export const metadata: Metadata = {
  title: 'FMGE Short Notes — Rapid Revision Notes for All 19 Subjects | MedSetu',
  description:
    'Free FMGE short notes for rapid revision: every subject distilled into the topics previous-year papers actually ask, with comparison tables, exam traps, mind maps and night-before golden points. Read online on MedSetu — no sign-up.',
  alternates: { canonical: '/notes/' },
  openGraph: {
    title: 'FMGE Short Notes — Rapid Revision for All 19 Subjects | MedSetu',
    description:
      'Short notes distilled from previous-year FMGE papers: high-yield facts, comparison tables, exam traps, mind maps and golden points for all 19 subjects.',
    type: 'website',
  },
};

const HOW = [
  {
    title: 'Built from previous-year papers',
    body: 'Notes start from what the last five years of FMGE papers actually asked — then keep only the facts those questions are made of.',
  },
  {
    title: 'Facts, not paragraphs',
    body: 'Tight mark-earning lines: most commons, drugs of choice, values, signs, exceptions. If a line would not earn a mark, it is not here.',
  },
  {
    title: 'Traps marked honestly',
    body: 'Where students reliably pick the wrong option, the note shows the distinction the examiner is testing.',
  },
  {
    title: 'A mind map per subject',
    body: 'Every subject ends in a one-screen mind map, so the structure is in your head before the details hang on it.',
  },
];

const FAQ = [
  {
    q: 'Are these short notes enough to pass the FMGE on their own?',
    a: 'They are revision notes, not a first read. Use them after studying a subject once — they compress it into the facts previous-year questions are built from. Pair them with the question bank and mock tests.',
  },
  {
    q: 'How are the topics in each subject chosen?',
    a: 'From the topics and question styles in the twelve previous-year FMGE papers and the 13,934-question bank, weighted by the NBEMS distribution. Topics the paper returns to every session lead.',
  },
  {
    q: 'Can I download or print the notes?',
    a: 'No — the notes and flashcards are made to be read and revised on MedSetu itself, free, as often as you like. Keeping them on the site is what keeps them free for every student and always up to date.',
  },
  {
    q: 'Do the notes cover all 19 FMGE subjects?',
    a: 'Yes — all 19 subjects, from Medicine’s 33 questions down to the five-question subjects, each with its own topics, comparison tables, golden points and mind map.',
  },
];

export default function NotesIndex() {
  const totalPoints = totalNotePoints();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="soft-band mt-8 rounded-[28px] px-6 py-10 shadow-card ring-1 ring-med-line/40 sm:px-10 lg:mt-10 lg:py-12">
          <h1 className="mt-2 max-w-3xl text-4xl text-ink sm:text-h1">
            Short notes that remember the subject for you.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft">
            Every FMGE subject, distilled into the topics previous-year papers actually ask —{' '}
            {totalPoints.toLocaleString('en-IN')}+ mark-earning facts, comparison tables, exam traps
            and a mind map per subject. Made for the last weeks before the exam, when recall is
            everything.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/flashcards/" className="btn-primary rounded-full px-7 py-3.5 text-body2 font-bold text-white">
              Practise with flashcards →
            </Link>
            <Link href="/qbank/" className="rounded-full border border-line/80 bg-white px-7 py-3.5 text-body2 font-bold text-med-deep shadow-card transition hover:bg-mist">
              Test yourself in the question bank
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <article className="rounded-2xl border border-line/70 bg-white p-6 shadow-card sm:p-8">
            <h2 className="text-h3 text-ink">{HOW[0].title}</h2>
            <p className="mt-2 max-w-3xl text-body2 leading-relaxed text-inksoft">{HOW[0].body}</p>
          </article>
          <div className="mt-4 divide-y divide-line/70 rounded-2xl border border-line/70 bg-white px-6 shadow-card sm:px-8">
            {HOW.slice(1).map((h) => (
              <article key={h.title} className="py-5">
                <h2 className="text-base font-bold text-ink">{h.title}</h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-inksoft">{h.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-14">
          <h2 className="text-h2 text-ink">Choose your subject</h2>
          <p className="mt-2 max-w-3xl text-body2 leading-relaxed text-inksoft">
            Ordered by weight in the paper — the number beside each subject is its questions out of
            300 in the official NBEMS distribution.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVISE_SUBJECTS.map((s) => {
              const notes = getNotes(s.slug);
              const stats = notesStats(s.slug);
              return (
                <Link
                  key={s.slug}
                  href={`/notes/${s.slug}/`}
                  className="group rounded-2xl border border-line/70 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-med/40 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-subtitle font-bold text-ink group-hover:text-med-deep">{s.name}</h3>
                    <span className="shrink-0 rounded-full bg-med-soft px-2.5 py-0.5 text-xs font-bold tabular-nums text-med-deep">
                      {s.weight} / 300
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
                    {notes ? notes.tagline : s.blurb}
                  </p>
                  <p className="mt-3 text-caption font-semibold tabular-nums text-med-deep">
                    {stats.topics} topics · {stats.points} facts · mind map
                  </p>
                  <span aria-hidden className="mt-4 block h-1.5 overflow-hidden rounded-full bg-mist">
                    <span className="block h-full rounded-full bg-gradient-to-r from-med-bright to-med-deep" style={{ width: `${(s.weight / 33) * 100}%` }} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-med">Revise →</p>
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
                <h3 className="text-base font-bold text-ink">{f.q}</h3>
                <p className="mt-1.5 text-body2 leading-relaxed text-inksoft">{f.a}</p>
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
            name: 'MedSetu Short Notes — FMGE rapid revision by subject',
            numberOfItems: REVISE_SUBJECTS.length,
            itemListElement: REVISE_SUBJECTS.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://med-setu.netlify.app/notes/${s.slug}/`,
              name: `${s.name} — FMGE short notes`,
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
            name: 'FMGE Short Notes by Subject',
            itemListElement: REVISE_SUBJECTS.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${s.name} — FMGE short notes`,
              url: `https://med-setu.netlify.app/notes/${s.slug}/`,
            })),
          }),
        }}
      />
    </div>
  );
}
