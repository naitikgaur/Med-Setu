import Link from 'next/link';
import CopyUpi from './CopyUpi';

export const CREDIT_LINE =
  'Made by the efforts of Naitik Library, founded by Naitik Gaur, Gautam Nagar, New Delhi — free for FMGE students.';
export const PHONES = '8920922167';

/**
 * The one brand lockup used everywhere MedSetu's brand is displayed:
 * "MedSetu" in large type with "by Naitik Library" in clearly smaller
 * type beneath it.
 */
export function BrandLockup({
  light = false,
  size = 'md',
  className = '',
}: {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const big = size === 'lg' ? 'text-[26px]' : size === 'sm' ? 'text-[17px]' : 'text-[19px]';
  const small = size === 'lg' ? 'text-xs' : 'text-[11px]';
  return (
    <span data-brand-lockup className={`inline-flex flex-col leading-none ${className}`}>
      <span className={`${big} font-bold tracking-tight ${light ? 'text-white' : 'text-med-deep'}`}>
        Med<span className={light ? 'text-white' : 'text-med'}>Setu</span>
      </span>
      <span
        className={`${small} mt-1 font-medium tracking-[0.08em] ${light ? 'text-white/75' : 'text-inksoft'}`}
      >
        by Naitik Library
      </span>
    </span>
  );
}

export function DonateBlock({ id = 'donate' }: { id?: string }) {
  return (
    <section id={id} className="no-print rounded-2xl border border-line/70 bg-white px-6 py-6 shadow-card sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-ink">Donate something if you like</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
            MedSetu is free — every paper, every test, every question in the bank, every note and
            flashcard, no sign-up. If MedSetu helped your preparation, a small contribution helps
            Naitik Library keep it free for the next student. Voluntary only; the site works fully whether you donate
            or not.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-inksoft">UPI</span>
          <CopyUpi />
        </div>
      </div>
    </section>
  );
}

/**
 * Primary donate appeal for the landing page: a restrained amber-accented
 * strip asking students to contribute to MedSetu's betterment and upkeep.
 */
export function DonateStrip() {
  return (
    <section
      id="donate-top"
      aria-label="Support MedSetu"
      className="no-print flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/40 bg-accent-soft px-6 py-5 shadow-card"
    >
      <div className="max-w-2xl">
        <h2 className="text-lg font-bold text-accent-deep">Support MedSetu</h2>
        <p className="mt-1 text-sm leading-relaxed text-ink">
          MedSetu is free for every FMGE student. If it helps your preparation, you can contribute
          to its betterment and upkeep — a small, voluntary contribution to Naitik Library, which
          keeps MedSetu free.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent-deep">UPI</span>
        <CopyUpi />
      </div>
    </section>
  );
}

const FOOTER_COLS: { title: string; links: [string, string][] }[] = [
  {
    title: 'Prepare',
    links: [
      ['Test Series — 30 grand tests', '/tests/'],
      ['PYP Tests — previous-year papers', '/papers/'],
      ['Subject-wise Tests', '/subjects/'],
      ['Question Bank', '/qbank/'],
      ["Let's Start", '/start/'],
    ],
  },
  {
    title: 'Revise & Learn',
    links: [
      ['Short Notes — rapid revision', '/notes/'],
      ['Flashcards — active recall', '/flashcards/'],
      ['Blog — guides for medical students', '/blog/'],
      ['Resources', '/resources/'],
    ],
  },
  {
    title: 'MedSetu',
    links: [
      ['About MedSetu', '/about/'],
      ['Naitik Library', '/naitik-library/'],
      ['Contact us', '/contact/'],
      ['Privacy Policy', '/privacy/'],
    ],
  },
  {
    title: 'Policies',
    links: [
      ['Privacy Policy', '/privacy/'],
      ['Terms of Use', '/terms/'],
      ['Disclaimer', '/disclaimer/'],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="no-print mt-0 bg-med-abyss text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-md">
            <BrandLockup light />
            <p className="mt-3 text-sm leading-relaxed text-white/75">{CREDIT_LINE}</p>
            <p className="mt-2 text-sm text-white/75">
              Questions or help: <span className="font-semibold tabular-nums text-white">{PHONES}</span>
            </p>
            <p className="mt-4 text-sm font-semibold text-white">Join the MedSetu community</p>
            <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
              <a
                href="https://chat.whatsapp.com/BAxhL36HFnvC3o8Rqp7q07"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-1.5 text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                WhatsApp group
              </a>
              <a
                href="https://www.instagram.com/naitiklibrary/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-1.5 text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                Instagram — @naitiklibrary
              </a>
            </p>
            <div className="mt-5 text-sm leading-relaxed text-white/75">
              <p className="font-semibold text-white">Support Naitik Library</p>
              <div className="mt-2">
                <CopyUpi dark />
              </div>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-8 lg:grid-cols-4" aria-label="Footer">
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/60">{col.title}</p>
                <ul className="mt-2 space-y-0.5 text-sm font-medium">
                  {col.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="block py-2 text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-white/65">
          Disclaimer: MedSetu is not affiliated with NBEMS or NMC. NBEMS never releases official
          FMGE question papers; the papers here are recall-based editions for practice only.
          MedSetu is a free preparation resource — it is not medical advice and not a substitute for
          your own teachers and textbooks.
        </p>
        <div className="mt-4 border-t border-white/15 pt-4 text-xs text-white/65">
          Your name and answers never leave your device. No accounts, no tracking of your practice,
          no data collected.
          <span className="mt-1 block">MedSetu v7 · Made by Naitik Library, Gautam Nagar, New Delhi</span>
        </div>
      </div>
    </footer>
  );
}
