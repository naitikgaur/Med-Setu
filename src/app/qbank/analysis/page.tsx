import type { Metadata } from 'next';
import AnalysisGate from './AnalysisGate';

export const metadata: Metadata = {
  title: 'Session analysis — Question Bank · MedSetu',
  description: 'The detailed analysis of a question-bank Exam-mode session on MedSetu.',
};

export default function QBankAnalysisPage() {
  return <AnalysisGate />;
}
