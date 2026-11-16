import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PAPERS_META, getMeta, paperDescriptor } from '../../../../lib/papers';
import Runner from '../../../../components/Runner';

export function generateStaticParams() {
  return PAPERS_META.map((p) => ({ id: p.paperId }));
}

export default function TestPage({ params }: { params: { id: string } }) {
  const meta = getMeta(params.id);
  if (!meta) notFound();
  return <Runner desc={paperDescriptor(meta)} />;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };
