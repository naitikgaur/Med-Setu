import { notFound } from 'next/navigation';
import { PAPERS_META, getMeta, paperDescriptor } from '../../../../lib/papers';
import AnalysisView from '../../../../components/AnalysisView';

export function generateStaticParams() {
  return PAPERS_META.map((p) => ({ id: p.paperId }));
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const meta = getMeta(params.id);
  if (!meta) notFound();
  return <AnalysisView desc={paperDescriptor(meta)} />;
}
