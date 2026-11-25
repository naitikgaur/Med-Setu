'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandLockup } from './SiteChrome';
import { getName } from '../lib/store';

/**
 * Site header. Before a student has entered (no name in this tab) the
 * nav is About / Resources / Blog / Contact / Donate plus one prominent
 * "Let's Start" button. Once entered, the nav gains the preparation
 * sections: Test Series, PYP Tests, Subject-wise Tests, Question Bank,
 * Short Notes and Flashcards. On phones the nav collapses behind a
 * Menu button instead of wrapping into rows.
 */
export function SiteHeader() {
  const [entered, setEntered] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setEntered(!!getName().trim());
  }, []);

  const prepLinks: [string, string][] = entered
    ? [
        ['Test Series', '/tests/'],
        ['PYP Tests', '/papers/'],
        ['Subject-wise Tests', '/subjects/'],
        ['Question Bank', '/qbank/'],
      ]
    : [];
  const links: [string, string][] = [
    ...prepLinks,
    ['Short Notes', '/notes/'],
    ['Flashcards', '/flashcards/'],
    ['About', '/about/'],
    ['Resources', '/resources/'],
    ['Blog', '/blog/'],
    ['Contact', '/contact/'],
  ];

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/70 bg-white/85 shadow-[0_1px_16px_rgba(16,42,50,0.06)] backdrop-blur-md">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-med-deep focus:shadow-lift"
      >
        Skip to content
      </a>
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-x-4 px-4 py-2 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" aria-label="MedSetu home">
          <span aria-hidden className="btn-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M2.5 12h4l2.2-5.5 3.6 10 2.7-4.5h6.5" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <BrandLockup />
          <span className="hidden border-l border-line pl-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-inksoft sm:inline">
            Complete FMGE Preparation
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-wrap items-center gap-1 text-sm font-medium lg:flex" aria-label="Main">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-3 py-2.5 transition-colors hover:bg-med-soft ${
                prepLinks.some(([, h]) => h === href) || href === '/notes/' || href === '/flashcards/'
                  ? 'font-semibold text-med-deep'
                  : 'text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href="#donate"
            className="ml-1 rounded-full border border-accent/40 bg-accent-soft px-3.5 py-2.5 font-semibold text-accent-deep transition-colors hover:bg-accent hover:text-white"
          >
            Donate
          </a>
          {!entered && (
            <Link href="/start/" className="btn-primary ml-2 rounded-full px-5 py-2.5 font-semibold text-white">
              Let&apos;s Start
            </Link>
          )}
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {!entered && (
            <Link href="/start/" className="btn-primary rounded-full px-4 py-2.5 text-sm font-semibold text-white">
              Let&apos;s Start
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-11 w-11 items-center justify-center rounded-full text-med-deep transition-colors hover:bg-med-soft"
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <nav id="mobile-nav" className="border-t border-line/70 bg-white/95 px-4 pb-4 pt-2 backdrop-blur-md lg:hidden" aria-label="Main">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-med-soft hover:text-med-deep"
            >
              {label}
            </Link>
          ))}
          <a
            href="#donate"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-xl bg-accent-soft px-4 py-3 text-[15px] font-semibold text-accent-deep"
          >
            Donate
          </a>
        </nav>
      )}
    </header>
  );
}
