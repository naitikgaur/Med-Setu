import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERIES_META, getSeriesTest, seriesDescriptor } from '../../../../lib/series';
import AnalysisView from '../../../../components/AnalysisView';

export function generateStaticParams() {
  return SERIES_META.map((t) => ({ id: t.testId }));
}

export default function SeriesAnalysisPage({ params }: { params: { id: string } }) {
  const test = getSeriesTest(params.id);
  if (!test) notFound();
  return <AnalysisView desc={seriesDescriptor(test)} />;
}

export const metadata: Metadata = { robots: { index: false, follow: false } };
