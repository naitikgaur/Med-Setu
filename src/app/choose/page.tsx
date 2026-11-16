import { SiteFooter } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';
import ChooseGate from './ChooseGate';

export const metadata = {
  title: 'Choose your practice — MedSetu by Naitik Library',
  description:
    'Previous-year FMGE papers as full mock tests, subject-wise tests one subject at a time, or the question bank — practise question by question. Free, on your device, nothing stored.',
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
