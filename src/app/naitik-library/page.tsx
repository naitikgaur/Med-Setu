import Link from 'next/link';
import { SiteFooter, DonateBlock, PHONES } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';

export const metadata = {
  title: 'Naitik Library — a study hall for medical students, Gautam Nagar, New Delhi',
  description:
    'Naitik Library is a study hall for medical students in Gautam Nagar, New Delhi, founded by Naitik Gaur. It is the library behind MedSetu, the free FMGE mock-test site.',
  alternates: { canonical: '/naitik-library/' },
};

export default function NaitikLibrary() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-med">
            Gautam Nagar · New Delhi
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            Naitik Library
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            Naitik Library is a study hall for medical students — a quiet place where students
            come to sit and study. It was founded by{' '}
            <strong className="text-ink">Naitik Gaur</strong> in Gautam Nagar, New Delhi.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            Preparing for an exam like FMGE takes long, regular hours of study. The library
            exists to give medical students a steady place for that: a seat, a quiet room, and
            the routine of studying alongside others who are working toward the same goal.
          </p>
          <div className="mt-6 rounded-xl border border-line bg-white px-5 py-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">Contact</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-ink">{PHONES}</p>
            <p className="mt-0.5 text-sm text-inksoft">Naitik Library, Gautam Nagar, New Delhi</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-ink">Why MedSetu exists</h2>
          <div className="mt-3 max-w-3xl space-y-3 leading-relaxed text-inksoft">
            <p>
              Students at the library who were preparing for FMGE needed a way to practise full
              previous-year papers the way the real exam feels — two parts, a running clock, a
              question palette — and to understand afterwards how they had done. MedSetu was made
              by the efforts of Naitik Library to give them that, for free.
            </p>
            <p>
              MedSetu is the library&apos;s effort extended online, for the many FMGE students
              who cannot come to Gautam Nagar in person. Anyone can open it, write a full mock
              test, and read a detailed analysis with the complete answer key and explanations —
              no sign-up, and nothing about the student is collected.
            </p>
          </div>
          <p className="mt-5">
            <Link
              href="/"
              className="inline-block rounded-md bg-med px-6 py-3 font-semibold text-white hover:bg-med-deep"
            >
              Try a free mock test
            </Link>
          </p>
        </section>

        <div className="mt-10">
          <DonateBlock />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
