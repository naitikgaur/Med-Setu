import Link from 'next/link';
import { SiteFooter, PHONES } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';

export const metadata = {
  title: 'Terms of Use — MedSetu by Naitik Library',
  description:
    'The terms for using MedSetu, the complete free FMGE preparation platform by Naitik Library: what the site is, what you may do with it, and the limits that apply. Last updated 16 November 2026.',
  alternates: { canonical: '/terms/' },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-xl font-bold text-ink">{children}</h2>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2.5 text-body2 leading-relaxed text-inksoft">{children}</p>;
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <h1 className="text-4xl font-bold leading-snug tracking-tight text-ink sm:text-h1">
            Terms of Use
          </h1>
          <p className="mt-3 text-sm text-inksoft">Last updated: 16 November 2026</p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            MedSetu is a free FMGE practice website published by Naitik Library, Gautam Nagar, New
            Delhi. By using this site you accept these terms. They are short and written plainly,
            on purpose.
          </p>
        </section>

        <section className="pb-12">
          <H2>1. What MedSetu is</H2>
          <P>
            MedSetu provides practice material for the Foreign Medical Graduate Examination
            (FMGE): previous-year papers presented as mock tests, a test series, subject-wise
            tests, a question bank, and an analysis of each attempt. It is a study aid. It is not
            an examination body, not a coaching guarantee, and not affiliated with the National
            Board of Examinations in Medical Sciences (NBEMS) or the National Medical Commission
            (NMC).
          </P>

          <H2>2. Free use</H2>
          <P>
            MedSetu is free for students preparing for FMGE. There are no accounts, no
            subscriptions and no paid tiers. You may use every test, the question bank and the
            downloadable analysis and answer keys for your own preparation, and you may share
            links to pages on this site.
          </P>

          <H2>3. The papers are recall-based</H2>
          <P>
            NBEMS never releases official FMGE question papers or answer keys. The papers on
            MedSetu are recall-based editions compiled from published compilations and student
            memory, and they are labelled as such wherever they appear. We check them carefully,
            but a recall-based paper can contain an error. If you find one, tell us via the{' '}
            <Link href="/contact/" className="font-semibold text-med hover:underline">Contact page</Link>{' '}
            and we will check it against the source.
          </P>

          <H2>4. What you may not do</H2>
          <P>
            Do not scrape, bulk-download or republish the question bank, test series or papers as
            a competing product; do not present MedSetu content as official NBEMS material; and
            do not attempt to disrupt the site. Downloading your own analysis and answer keys for
            personal revision is, of course, allowed — that is what they are for.
          </P>

          <H2>5. Your data</H2>
          <P>
            MedSetu keeps no data about you. Your name and answers exist only in your own
            browser tab and disappear when it closes. The full position is in the{' '}
            <Link href="/privacy/" className="font-semibold text-med hover:underline">Privacy Policy</Link>.
          </P>

          <H2>6. No guarantee of results</H2>
          <P>
            Practising on MedSetu can help you prepare; it cannot promise a pass, a score, or any
            particular outcome in the FMGE. Exam patterns, schedules and rules are set by NBEMS —
            always confirm them from the official NBEMS information bulletin for your session.
          </P>

          <H2>7. Availability and changes</H2>
          <P>
            We work to keep MedSetu available and correct, but the site is provided “as is”,
            without warranties, and may change or be unavailable at times. We may update these
            terms; the date at the top of this page will change when we do.
          </P>

          <H2>8. Contact</H2>
          <P>
            Questions about these terms: call or WhatsApp{' '}
            <span className="font-semibold tabular-nums text-ink">{PHONES}</span>, or see the{' '}
            <Link href="/contact/" className="font-semibold text-med hover:underline">Contact page</Link>.
          </P>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
