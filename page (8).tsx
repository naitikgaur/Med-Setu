import { SiteFooter } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';
import SubjectsGate from './SubjectsGate';

export const metadata = {
  title: 'Subject-wise FMGE tests — MedSetu by Naitik Library',
  description:
    'FMGE subject-wise tests: one subject at a time, 19–50 questions per test, full explanations and a detailed analysis against the 50% mark. Free, on your device.',
};

export default function SubjectsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <SubjectsGate />
      </main>
      <SiteFooter />
    </div>
  );
}
