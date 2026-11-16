import type { Metadata } from 'next';
import PlayGate from './PlayGate';

export const metadata: Metadata = {
  title: 'Practice — Question Bank · MedSetu',
  description: 'A question-bank session on MedSetu, in the FMGE exam window.',
  robots: { index: false, follow: false },
};

export default function QBankPlayPage() {
  return <PlayGate />;
}
