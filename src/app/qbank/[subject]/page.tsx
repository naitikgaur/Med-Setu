import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '../../../components/SiteHeader';
import { SiteFooter } from '../../../components/SiteChrome';
import { QBANK_META, getQBankSubject } from '../../../lib/qbank';
import SubjectPanel from './SubjectPanel';

export function generateStaticParams() {
  return QBANK_META.subjects.map((s) => ({ subject: s.slug }));
}

export function generateMetadata({ params }: { params: { subject: string } }): Metadata {
  const s = getQBankSubject(params.subject);
  if (!s) return { title: 'Question Bank — MedSetu' };
  return {
    title: `${s.name} — Question Bank · MedSetu`,
    description: `${s.total} ${s.name} questions for FMGE practice on MedSetu, organised by topic with full explanations — practise in Practice mode or sit a set in Exam mode.`,
    alternates: { canonical: `/qbank/${params.subject}/` },
  };
}

export default function QBankSubjectPage({ params }: { params: { subject: string } }) {
  const s = getQBankSubject(params.subject);
  if (!s) notFound();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-4 pt-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-5 text-caption font-medium text-inksoft">
          <Link href="/qbank/" className="text-med hover:underline">Question Bank</Link>
          <span aria-hidden> / </span>
          <span className="text-ink">{s.name}</span>
        </nav>
        <SubjectPanel slug={s.slug} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'MedSetu', item: 'https://med-setu.netlify.app/' },
              { '@type': 'ListItem', position: 2, name: 'Question Bank', item: 'https://med-setu.netlify.app/qbank/' },
              { '@type': 'ListItem', position: 3, name: `${s.name} questions`, item: `https://med-setu.netlify.app/qbank/${s.slug}/` },
            ],
          }),
        }}
      />
    </div>
  );
}
