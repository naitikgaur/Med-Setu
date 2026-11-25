import type { Metadata } from 'next';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter, BrandLockup } from '../../components/SiteChrome';
import GateCard from './GateCard';

export const metadata: Metadata = {
  title: "Let's start — MedSetu",
  description:
    'Enter your name, pass a quick human check, and the whole MedSetu preparation platform is open: previous-year mock papers, the grand test series, subject-wise tests, the question bank, short notes and flashcards. No account, nothing collected.',
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-md">
          <div className="mb-5 flex justify-center text-center">
            <BrandLockup size="lg" />
          </div>
          <GateCard />
          <p className="mt-5 text-center text-xs leading-relaxed text-inksoft">
            Free for every FMGE student · 12 PYP papers · 30 subject-wise tests · a 13,934-question bank · no sign-up
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
