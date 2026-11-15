import type { Metadata } from 'next';
import PlayGate from './PlayGate';

export const metadata: Metadata = {
  title: 'Practice — Question Bank · MedSetu',
  description: 'A question-bank session on MedSetu, in the FMGE exam window.',
};

export default function QBankPlayPage() {
  return <PlayGate />;
}
