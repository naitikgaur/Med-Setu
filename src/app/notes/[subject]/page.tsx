import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteChrome';
import { MindMap } from '../../../components/MindMap';
import { REVISE_SUBJECTS, getNotes, cardCount } from '../../../lib/notes';

export function generateStaticParams() {
  return REVISE_SUBJECTS.map((s) => ({ subject: s.slug }));
}

export function generateMetadata({ params }: { params: { subject: string } }): Metadata {
  const meta = REVISE_SUBJECTS.find((s) => s.slug === params.subject);
  const notes = getNotes(params.subject);
  if (!meta || !notes) return {};
  return {
    title: `${meta.name} Short Notes for FMGE — Rapid Revision | MedSetu`,
    description: `${meta.name} FMGE short notes: ${notes.topics.length} high-yield topics built from previous-year papers — key facts, comparison tables, exam traps, golden points and a mind map. ${meta.weight} of 300 questions. Free on MedSetu.`,
    alternates: { canonical: `/notes/${params.subject}/` },
  };
}

export default function SubjectNotesPage({ params }: { params: { subject: string } }) {
  const meta = REVISE_SUBJECTS.find((s) => s.slug === params.subject);
  const notes = getNotes(params.subject);
  if (!meta || !notes) notFound();
  const cards = cardCount(params.subject);
  const idx = REVISE_SUBJECTS.findIndex((s) => s.slug === params.subject);
  const next = REVISE_SUBJECTS[(idx + 1) % REVISE_SUBJECTS.length];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="print-note">
        <p><strong>MedSetu — {meta.name} short notes</strong></p>
        <p>
          These notes are free to read and revise online at med-setu.netlify.app/notes/{params.subject}/ —
          they are designed to be used on the site, alongside the flashcards, question bank and mock
          tests, so printing keeps only this pointer.
        </p>
      </div>
      <main className="web-only mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        {/* header */}
        <section className="pt-10 lg:pt-14">
          <nav aria-label="Breadcrumb" className="text-[13px] font-medium text-inksoft">
            <Link href="/notes/" className="text-med hover:underline">Short Notes</Link>
            <span aria-hidden> / </span>
            <span className="text-ink">{meta.name}</span>
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-ink sm:text-[40px]">
              {meta.name} — short notes
            </h1>
            <span className="rounded bg-med-soft px-2.5 py-1 text-[13px] font-bold tabular-nums text-med-deep">
              {meta.weight} of 300 questions
            </span>
          </div>
          <p className="mt-2 text-[17px] font-semibold text-med-deep">{notes.tagline}</p>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-inksoft">{notes.intro}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {cards > 0 && (
              <Link href={`/flashcards/${params.subject}/`} className="rounded-lg bg-med px-5 py-2.5 text-sm font-bold text-white shadow-card transition-colors hover:bg-med-deep">
                Revise with {cards} flashcards →
              </Link>
            )}
            <Link href={`/qbank/${params.subject}/`} className="rounded-lg border border-line bg-white px-5 py-2.5 text-sm font-bold text-med-deep transition-colors hover:bg-mist">
              Practise {meta.name} questions
            </Link>
          </div>
          {/* topic jump chips */}
          <div className="mt-7 flex flex-wrap gap-2">
            {notes.topics.map((t, i) => (
              <a
                key={t.title}
                href={`#topic-${i + 1}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-med/50 hover:text-med-deep"
              >
                {t.title}
              </a>
            ))}
            <a href="#mindmap" className="rounded-full bg-med-deep px-3 py-1.5 text-[13px] font-semibold text-white">
              Mind map ↓
            </a>
            <a href="#golden" className="rounded-full bg-accent px-3 py-1.5 text-[13px] font-semibold text-white">
              Golden points ↓
            </a>
          </div>
        </section>

        {/* golden points */}
        <section id="golden" className="mt-12 scroll-mt-8 rounded-2xl bg-med-abyss p-6 text-white sm:p-8">
          <h2 className="text-[22px] font-bold tracking-tight">Night-before golden points</h2>
          <p className="mt-1 text-sm text-white/75">
            If you read nothing else in {meta.name}, read these — the highest-yield lines in the subject.
          </p>
          <ul className="mt-5 grid gap-x-8 gap-y-2.5 md:grid-cols-2">
            {notes.goldenPoints.map((g) => (
              <li key={g} className="flex gap-2.5 text-[15px] leading-relaxed">
                <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* topics */}
        <section className="mt-12 space-y-6">
          {notes.topics.map((t, i) => (
            <article key={t.title} id={`topic-${i + 1}`} className="scroll-mt-8 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-8">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-[13px] font-bold tabular-nums text-med">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="text-[21px] font-bold tracking-tight text-ink">{t.title}</h2>
                {t.askedAs && (
                  <span className="rounded bg-mist px-2 py-0.5 text-[12px] font-semibold text-inksoft">
                    Asked as: {t.askedAs}
                  </span>
                )}
              </div>
              <ul className="mt-4 grid gap-x-8 gap-y-2 lg:grid-cols-2">
                {t.points.map((p) => (
                  <li key={p} className="flex gap-2.5 text-[15px] leading-relaxed text-ink">
                    <svg viewBox="0 0 12 12" className="mt-[7px] h-3 w-3 shrink-0" fill="none" aria-hidden>
                      <path d="M2 6.5 4.8 9 10 3" stroke="#006D77" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {t.table && (
                <div className="mt-5 overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[480px] text-sm">
                    <thead>
                      <tr className="border-b border-line bg-mist text-left">
                        {t.table.head.map((h) => (
                          <th key={h} className="px-4 py-2.5 font-bold text-ink">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.table.rows.map((row, ri) => (
                        <tr key={ri} className="border-b border-line/60 last:border-0">
                          {row.map((cell, ci) => (
                            <td key={ci} className={`px-4 py-2.5 ${ci === 0 ? 'font-semibold text-ink' : 'text-inksoft'}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {t.oneLiner && (
                  <div className="rounded-xl bg-med-soft px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-med-deep">Remember this line</p>
                    <p className="mt-1 text-[15px] font-semibold leading-relaxed text-ink">{t.oneLiner}</p>
                  </div>
                )}
                {t.trap && (
                  <div className="rounded-xl bg-accent-soft px-4 py-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-accent-deep">Exam trap</p>
                    <p className="mt-1 text-[15px] leading-relaxed text-ink">{t.trap}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* mind map */}
        <section id="mindmap" className="mt-14 scroll-mt-8">
          <h2 className="text-[28px] font-bold tracking-tight text-ink">{meta.name} on one screen</h2>
          <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-inksoft">
            The whole subject as a map. Read each branch, say its leaves out loud from memory, and
            the ones that will not come are the topics to reopen above.
          </p>
          <div className="mt-8">
            <MindMap notes={notes} />
          </div>
        </section>

        {/* next steps */}
        <section className="my-14 grid gap-4 sm:grid-cols-3">
          {cards > 0 && (
            <Link href={`/flashcards/${params.subject}/`} className="group rounded-xl bg-med-deep p-6 text-white shadow-card transition-all hover:-translate-y-0.5">
              <h3 className="text-[17px] font-bold">Now recall it</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                {cards} {meta.name} flashcards — flip, sort, and shrink the still-learning pile.
              </p>
              <p className="mt-3 text-sm font-bold">Open flashcards →</p>
            </Link>
          )}
          <Link href={`/qbank/${params.subject}/`} className="group rounded-xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-med/40">
            <h3 className="text-[17px] font-bold text-ink group-hover:text-med-deep">Then test it</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
              {meta.name} questions from the bank, topic by topic, with full explanations.
            </p>
            <p className="mt-3 text-sm font-bold text-med">Open the question bank →</p>
          </Link>
          <Link href={`/notes/${next.slug}/`} className="group rounded-xl border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-med/40">
            <h3 className="text-[17px] font-bold text-ink group-hover:text-med-deep">Next subject</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
              Continue the revision circuit with {next.name} — {next.weight} of 300 questions.
            </p>
            <p className="mt-3 text-sm font-bold text-med">Open {next.name} notes →</p>
          </Link>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: `${meta.name} Short Notes for FMGE`,
            description: notes.tagline,
            author: { '@type': 'Organization', name: 'MedSetu by Naitik Library' },
            about: meta.name,
          }),
        }}
      />
    </div>
  );
}
