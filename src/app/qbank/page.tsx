import type { Metadata } from 'next';
import { SiteHeader } from '../../components/SiteHeader';
import { SiteFooter } from '../../components/SiteChrome';
import QBankGate from './QBankGate';

export const metadata: Metadata = {
  title: 'Question Bank — MedSetu',
  description:
    'The MedSetu question bank for FMGE: thousands of practice questions across all 19 subjects, organised by topic, with full explanations — practise question by question in Practice mode, or sit a set in Exam mode.',
};

export default function QBankPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-4 pt-8 sm:px-6">
        <QBankGate />
      </main>
      <SiteFooter />
    </div>
  );
}
