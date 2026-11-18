'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BrandLockup } from './SiteChrome';
import { getName } from '../lib/store';

/**
 * Site header. A slim trust strip sits above it (Naitik Library, free
 * for every FMGE student). Before a student has entered (no name in
 * this tab) the nav is About / Privacy / Contact / Donate plus one
 * prominent "Let's Start" button. Once entered, the nav gains the four
 * practice sections: Test Series, PYP Tests, Subject-wise Tests and
 * Question Bank.
 */
export function SiteHeader() {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    setEntered(!!getName().trim());
  }, []);

  return (
    <>
      <div className="no-print bg-med-deep text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 py-1.5 text-[12px] font-medium sm:px-6">
          <p>
            By <span className="font-bold">Naitik Library</span>, Gautam Nagar, New Delhi
          </p>
          <p className="hidden sm:block">Free for every FMGE student · No sign-up · No data collected</p>
          <p className="sm:hidden">Free · No sign-up</p>
        </div>
      </div>
      <header className="no-print border-b border-line bg-white">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="MedSetu home">
            <BrandLockup />
            <span className="hidden border-l border-line pl-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-inksoft sm:inline">
              FMGE Practice Package
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm font-medium" aria-label="Main">
            {entered && (
              <>
                <Link
                  href="/tests/"
                  className="rounded-md px-3 py-1.5 font-semibold text-med-deep transition-colors hover:bg-mist"
                >
                  Test Series
                </Link>
                <Link
                  href="/papers/"
                  className="rounded-md px-3 py-1.5 font-semibold text-med-deep transition-colors hover:bg-mist"
                >
                  PYP Tests
                </Link>
                <Link
                  href="/subjects/"
                  className="rounded-md px-3 py-1.5 font-semibold text-med-deep transition-colors hover:bg-mist"
                >
                  Subject-wise Tests
                </Link>
                <Link
                  href="/qbank/"
                  className="rounded-md px-3 py-1.5 font-semibold text-med-deep transition-colors hover:bg-mist"
                >
                  Question Bank
                </Link>
              </>
            )}
            <Link href="/about/" className="rounded-md px-3 py-1.5 text-ink transition-colors hover:bg-mist">
              About
            </Link>
            <Link href="/resources/" className="rounded-md px-3 py-1.5 text-ink transition-colors hover:bg-mist">
              Resources
            </Link>
            <Link
              href="/naitik-library/"
              className="hidden rounded-md px-3 py-1.5 text-ink transition-colors hover:bg-mist lg:inline-block"
            >
              Naitik Library
            </Link>
            <Link href="/privacy/" className="rounded-md px-3 py-1.5 text-ink transition-colors hover:bg-mist">
              Privacy
            </Link>
            <Link href="/contact/" className="hidden rounded-md px-3 py-1.5 text-ink transition-colors hover:bg-mist sm:inline-block">
              Contact
            </Link>
            <a
              href="#donate"
              className="ml-1 rounded-md border border-accent/40 bg-accent-soft px-3 py-1.5 font-semibold text-accent-deep transition-colors hover:bg-accent hover:text-white"
            >
              Donate
            </a>
            {!entered && (
              <Link
                href="/start/"
                className="ml-2 rounded-md bg-med px-4 py-2 font-semibold text-white shadow-card transition-colors hover:bg-med-deep"
              >
                Let&apos;s Start
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
