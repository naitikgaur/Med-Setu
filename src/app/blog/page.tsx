import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteFooter, DonateBlock } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';
import { BLOG_CATEGORIES, formatBlogDate, getAllPosts, readingMinutes } from '../../lib/blog';

export const metadata: Metadata = {
  title: 'Blog — Guides for FMGE & Medical Students — MedSetu',
  description:
    'The MedSetu blog: 150 free guides for FMGE aspirants and medical students — preparation plans, subject-wise strategy, standard books, revision science, MBBS abroad, new medical research explained, and clinical skills. By Naitik Library, New Delhi.',
  alternates: { canonical: '/blog/' },
  openGraph: {
    title: 'MedSetu Blog — Guides for FMGE & Medical Students',
    description:
      'Preparation plans, subject guides, book guides, revision methods, MBBS abroad and medical research explained — free, by Naitik Library.',
    type: 'website',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const byCategory = BLOG_CATEGORIES.map((cat) => ({
    cat,
    posts: posts.filter((p) => p.category === cat.slug),
  })).filter((g) => g.posts.length > 0);

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'MedSetu Blog — guides for FMGE and medical students',
    numberOfItems: posts.length,
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://med-setu.netlify.app/blog/${p.slug}/`,
      name: p.title,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">MedSetu · Blog</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            Guides for FMGE aspirants &amp; medical students
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            {posts.length} free, in-depth guides from Naitik Library — preparation plans built on the
            real FMGE pattern, subject-by-subject strategy, the standard textbooks explained, revision
            methods backed by research, honest MBBS-abroad guidance, and new medical research made
            readable. No hype, no invented numbers — and every guide points you to free practice.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {byCategory.map(({ cat, posts: ps }) => (
              <a
                key={cat.slug}
                href={`#${cat.slug}`}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm font-medium text-ink shadow-card transition-colors hover:border-med hover:text-med-deep"
              >
                {cat.name} <span className="text-inksoft">({ps.length})</span>
              </a>
            ))}
          </div>
        </section>

        {byCategory.map(({ cat, posts: ps }) => (
          <section key={cat.slug} id={cat.slug} className="scroll-mt-24 border-b border-line py-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink">{cat.name}</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-inksoft">{cat.blurb}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ps.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}/`}
                  className="group flex flex-col rounded-xl border border-line bg-white p-5 shadow-card transition-colors hover:border-med"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">{cat.name}</p>
                  <h3 className="mt-2 font-semibold leading-snug text-ink group-hover:text-med-deep">
                    {p.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-inksoft">{p.excerpt}</p>
                  <p className="mt-4 text-xs text-inksoft">
                    {formatBlogDate(p.datePublished)} · {readingMinutes(p)} min read
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <DonateBlock />
      </main>
      <SiteFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
    </div>
  );
}
