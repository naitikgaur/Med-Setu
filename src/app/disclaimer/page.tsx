import Link from 'next/link';
import { SiteFooter } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';

export const metadata = {
  title: 'Disclaimer — MedSetu by Naitik Library',
  description:
    'MedSetu is a free educational practice resource by Naitik Library. It is not affiliated with NBEMS or NMC, its papers are recall-based editions, and its content is study material — not medical advice. Last updated 16 November 2026.',
  alternates: { canonical: '/disclaimer/' },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-bold text-ink">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2.5 text-body2 leading-relaxed text-inksoft">{children}</p>;
}

export default function DisclaimerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <h1 className="text-4xl font-bold leading-snug tracking-tight text-ink sm:text-h1">
            Disclaimer
          </h1>
          <p className="mt-3 text-sm text-inksoft">Last updated: 16 November 2026</p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            The plain facts about what MedSetu is — and what it is not.
          </p>
        </section>

        <section className="pb-12">
          <H2>Not affiliated with NBEMS or NMC</H2>
          <P>
            MedSetu is published by Naitik Library, a private study hall in Gautam Nagar, New
            Delhi. It is <strong className="text-ink">not affiliated with, endorsed by, or
            connected to</strong> the National Board of Examinations in Medical Sciences (NBEMS),
            the National Medical Commission (NMC), or any government body. “FMGE” is used only to
            describe the examination this site helps students prepare for.
          </P>

          <H2>The papers are recall-based editions</H2>
          <P>
            NBEMS never releases official FMGE question papers or answer keys — the examination’s
            content is confidential. Every “previous-year paper” on MedSetu is therefore a
            recall-based edition, compiled from published compilations and the memory of students
            who sat the exam. We cross-check answers carefully, but a recall-based paper is not
            an official document and may contain errors. The two most recent papers on the site
            carry answers without explanations, and the site says so wherever they appear.
          </P>

          <H2>Educational content only — not medical advice</H2>
          <P>
            Everything on MedSetu — questions, explanations, analysis — is study material for an
            examination. It is <strong className="text-ink">not medical advice</strong>, not a
            clinical reference, and must never be used to diagnose or treat any person. Clinical
            decisions belong to qualified practitioners using current guidelines and their own
            judgement.
          </P>

          <H2>No results are promised</H2>
          <P>
            Scores on MedSetu are practice scores. The pass mark shown (150 of 300) and the 50%
            benchmark used for subject tests and the test series follow the FMGE pass proportion,
            but no MedSetu score guarantees any result in the real examination, and MedSetu
            publishes no ranks or percentiles — it has no cohort of other students to rank you
            against, so it does not invent one.
          </P>

          <H2>Accuracy and corrections</H2>
          <P>
            We correct errors when they are pointed out. If you believe a question, answer or
            explanation on MedSetu is wrong, contact us through the{' '}
            <Link href="/contact/" className="font-semibold text-med hover:underline">Contact page</Link>{' '}
            with the paper or test name and the question number, and we will check it against the
            source.
          </P>

          <H2>External facts</H2>
          <P>
            Statements about the FMGE pattern — 300 questions, two parts, no negative marking,
            pass mark 150 — follow the NBEMS information bulletin. NBEMS can change the pattern;
            the bulletin for your session is always the authority.
          </P>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
