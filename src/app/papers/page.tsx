import type { Metadata } from 'next';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteChrome';
import LibraryGate from './LibraryGate';

export const metadata: Metadata = {
  title: 'PYP Tests — MedSetu',
  description:
    'All twelve FMGE previous-year papers on MedSetu as PYP mock tests, December 2020 to June 2026 — each a full 300 questions in the real two-part exam manner.',
};

export default function PapersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-4 pt-8 sm:px-6">
        <LibraryGate />
      </main>
      <SiteFooter />
    </div>
  );
}
