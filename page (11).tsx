import { notFound } from 'next/navigation';
import { SUBJECTS_META, getSubject, getSubjectTest, subjectDescriptor } from '../../../../../lib/subjects';
import AnalysisView from '../../../../../components/AnalysisView';

export function generateStaticParams() {
  const out: { slug: string; test: string }[] = [];
  for (const s of SUBJECTS_META) {
    for (const t of s.tests) out.push({ slug: s.slug, test: `test-${t.testNo}` });
  }
  return out;
}

export default function SubjectAnalysisPage({ params }: { params: { slug: string; test: string } }) {
  const subject = getSubject(params.slug);
  const testNo = params.test === 'test-1' ? 1 : params.test === 'test-2' ? 2 : 0;
  const test = testNo ? getSubjectTest(params.slug, testNo) : undefined;
  if (!subject || !test) notFound();
  return <AnalysisView desc={subjectDescriptor(subject, test)} />;
}
