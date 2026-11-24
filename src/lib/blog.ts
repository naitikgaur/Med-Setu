// Blog data layer (V5). Articles live as one markdown file per post in
// src/data/blog/ (frontmatter + body + a <!--faqs--> section) and are
// parsed at build time — the site stays fully static, no backend, no
// database, exactly like the rest of MedSetu.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string; // category slug, see BLOG_CATEGORIES
  tags: string[];
  keyword: string;
  excerpt: string;
  datePublished: string;
  dateModified: string;
  bodyMd: string;
  faqs: BlogFaq[];
}

export interface BlogCategory {
  slug: string;
  name: string;
  blurb: string;
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  { slug: 'fmge-preparation', name: 'FMGE Preparation Strategy', blurb: 'Plans, timetables and attempt strategy for the FMGE — built around the real pattern: 300 questions, pass mark 150, no negative marking.' },
  { slug: 'subject-guides', name: 'Subject Guides & High-Yield Topics', blurb: 'How to study each of the 19 FMGE subjects, plus the high-yield topics the paper returns to again and again.' },
  { slug: 'books-resources', name: 'Books & Resources', blurb: 'The standard textbooks of MBBS — what each one is for, and how students should actually study from them.' },
  { slug: 'notes-revision', name: 'Notes & Revision Methods', blurb: 'Evidence-based study methods: spaced repetition, active recall, mistake notebooks and revision systems that hold 19 subjects together.' },
  { slug: 'colleges-abroad', name: 'Medical Colleges & MBBS Abroad', blurb: 'Honest guides to studying MBBS abroad — countries, NMC rules, recognition, costs and the FMGE that follows.' },
  { slug: 'research-advances', name: 'Research & Medical Advances', blurb: 'New research and medical technology, explained plainly for students: mRNA, CRISPR, immunotherapy, AI in medicine and more.' },
  { slug: 'exam-skills-mindset', name: 'Exam Skills, Mindset & Health', blurb: 'MCQ technique, focus, sleep, anxiety and the long-game mindset that carries a year of preparation.' },
  { slug: 'career', name: 'Career After FMGE & MBBS', blurb: 'Internship, registration, NEET PG, government jobs and the many roads after the degree.' },
  { slug: 'clinical-skills', name: 'Clinical Skills & Practical Knowledge', blurb: 'History taking, examination, ECGs, X-rays, lab reports — the practical craft of being a doctor, from student level up.' },
];

const CATEGORY_ORDER = new Map(BLOG_CATEGORIES.map((c, i) => [c.slug, i]));

const BLOG_DIR = join(process.cwd(), 'src', 'data', 'blog');

function parsePost(raw: string): BlogPost {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('blog: file missing frontmatter block');
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  let body = m[2];
  const faqs: BlogFaq[] = [];
  const parts = body.split(/\n<!--faqs-->\n/);
  if (parts.length > 1) {
    body = parts[0];
    const faqText = parts.slice(1).join('\n');
    for (const block of faqText.split(/\n(?=Q: )/)) {
      const qm = block.match(/^Q: (.+)\nA: ([\s\S]+)$/);
      if (qm) faqs.push({ q: qm[1].trim(), a: qm[2].trim().replace(/\n/g, ' ') });
    }
  }
  return {
    slug: fm.slug,
    title: fm.title,
    metaTitle: fm.metaTitle,
    metaDescription: fm.metaDescription,
    category: fm.category,
    tags: (fm.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    keyword: fm.keyword,
    excerpt: fm.excerpt,
    datePublished: fm.datePublished || '2026-11-24',
    dateModified: fm.dateModified || fm.datePublished || '2026-11-24',
    bodyMd: body.trim(),
    faqs,
  };
}

let cache: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (cache) return cache;
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
  const posts = files.map((f) => parsePost(readFileSync(join(BLOG_DIR, f), 'utf8')));
  posts.sort((a, b) =>
    (CATEGORY_ORDER.get(a.category) ?? 99) - (CATEGORY_ORDER.get(b.category) ?? 99) ||
    a.title.localeCompare(b.title));
  cache = posts;
  return posts;
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getCategory(slug: string): BlogCategory {
  return BLOG_CATEGORIES.find((c) => c.slug === slug) || BLOG_CATEGORIES[0];
}

export function getRelatedPosts(post: BlogPost, count = 3): BlogPost[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aScore = (a.category === post.category ? 0 : 1) + (a.tags.some((t) => post.tags.includes(t)) ? 0 : 0.5);
      const bScore = (b.category === post.category ? 0 : 1) + (b.tags.some((t) => post.tags.includes(t)) ? 0 : 0.5);
      return aScore - bScore || a.title.localeCompare(b.title);
    })
    .slice(0, count);
}

export function readingMinutes(post: BlogPost): number {
  const words = post.bodyMd.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200));
}

export function formatBlogDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
