import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter, DonateBlock } from '../../../components/SiteChrome';
import { SiteHeader } from '../../../components/SiteHeader';
import {
  formatBlogDate,
  getAllPosts,
  getCategory,
  getPost,
  getRelatedPosts,
  readingMinutes,
} from '../../../lib/blog';
import { renderMarkdown } from '../../../lib/markdown';

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  const url = `/blog/${post.slug}/`;
  return {
    title: `${post.metaTitle} — MedSetu`,
    description: post.metaDescription,
    keywords: [post.keyword, ...post.tags],
    alternates: { canonical: url },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: 'article',
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      section: getCategory(post.category).name,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
    },
  };
}

export default function BlogArticle({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const cat = getCategory(post.category);
  const related = getRelatedPosts(post, 3);
  const pageUrl = `https://med-setu.netlify.app/blog/${post.slug}/`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.metaDescription,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      mainEntityOfPage: pageUrl,
      keywords: post.keyword,
      articleSection: cat.name,
      author: { '@type': 'Organization', name: 'Naitik Library', url: 'https://med-setu.netlify.app/naitik-library/' },
      publisher: { '@type': 'Organization', name: 'MedSetu by Naitik Library', url: 'https://med-setu.netlify.app/' },
      inLanguage: 'en-IN',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://med-setu.netlify.app/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://med-setu.netlify.app/blog/' },
        { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl },
      ],
    },
    ...(post.faqs.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <article className="pb-4 pt-8 sm:pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">
            <Link href="/blog/" className="hover:underline">Blog</Link> · {cat.name}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-inksoft sm:text-lg">{post.excerpt}</p>
          <p className="mt-4 border-b border-line pb-6 text-sm text-inksoft">
            By Naitik Library · {formatBlogDate(post.datePublished)} · {readingMinutes(post)} min read
          </p>

          <div className="pt-2" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.bodyMd) }} />

          {post.faqs.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-2xl font-bold leading-snug tracking-tight text-ink">
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                {post.faqs.map((f) => (
                  <details key={f.q} className="rounded-xl border border-line bg-white px-5 py-4 shadow-card">
                    <summary className="cursor-pointer font-semibold text-ink">{f.q}</summary>
                    <p className="mt-2 leading-relaxed text-inksoft">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <section className="mt-10 rounded-xl border border-med/40 bg-mist/60 px-5 py-5">
            <h2 className="text-xl font-semibold text-ink">Practise free on MedSetu</h2>
            <p className="mt-2 leading-relaxed text-inksoft">
              Reading is only half of preparation. MedSetu gives you previous-year FMGE papers as full
              mock tests, a 30-test grand series, subject-wise tests and a 13,934-question bank — free,
              no sign-up, and nothing you do here is stored anywhere.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/tests/" className="rounded-md bg-med px-4 py-2 font-semibold text-white shadow-card transition-colors hover:bg-med-deep">
                Take a grand test
              </Link>
              <Link href="/qbank/" className="rounded-md border border-line bg-white px-4 py-2 font-semibold text-med-deep transition-colors hover:border-med">
                Practise the question bank
              </Link>
              <Link href="/papers/" className="rounded-md border border-line bg-white px-4 py-2 font-semibold text-med-deep transition-colors hover:border-med">
                Previous-year papers
              </Link>
            </div>
          </section>
        </article>

        {related.length > 0 && (
          <section className="border-t border-line py-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink">Keep reading</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  className="group flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-med"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">
                    {getCategory(p.category).name}
                  </p>
                  <h3 className="mt-2 font-semibold leading-snug text-ink group-hover:text-med-deep">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-inksoft">{p.excerpt}</p>
                  <p className="mt-4 text-xs text-inksoft">{readingMinutes(p)} min read</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <DonateBlock />
      </main>
      <SiteFooter />
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
      ))}
    </div>
  );
}
