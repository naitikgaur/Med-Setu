import { SiteFooter } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';
import ChooseGate from './ChooseGate';

export const metadata = {
  title: 'Choose how to prepare — MedSetu by Naitik Library',
  description:
    'Grand tests, previous-year FMGE papers, subject-wise tests and the question bank — or revise fast with short notes, mind maps and flashcards. Free, on your device, nothing stored.',
  robots: { index: false, follow: false },
};

export default function ChoosePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <ChooseGate />
      </main>
      <SiteFooter />
    </div>
  );
}
