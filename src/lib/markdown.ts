// Minimal, safe markdown renderer for blog articles (V5).
// Content is authored in-house (src/data/blog/*.json), but we still
// escape all HTML first and only re-introduce known constructs:
// ## / ### headings, - and 1. lists, > quotes, **bold**, *italic*,
// `code`, and [text](/path) links. Element classes are baked in so
// articles match the site's clinical design without a typography plugin.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  let out = escapeHtml(s);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" class="font-medium text-med-deep underline underline-offset-2 hover:text-med">$1</a>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/`([^`]+)`/g, '<code class="rounded bg-mist px-1.5 py-0.5 text-[0.9em] text-ink">$1</code>');
  return out;
}

const H2 = 'mb-4 mt-10 text-2xl font-bold leading-snug tracking-tight text-ink';
const H3 = 'mb-3 mt-8 text-xl font-semibold leading-snug text-ink';
const P = 'mb-4 leading-relaxed text-inksoft';
const UL = 'mb-4 list-disc space-y-1.5 pl-6 leading-relaxed text-inksoft';
const OL = 'mb-4 list-decimal space-y-1.5 pl-6 leading-relaxed text-inksoft';
const BQ = 'mb-4 border-l-4 border-med bg-mist/60 px-4 py-3 leading-relaxed text-inksoft';

export function renderMarkdown(md: string): string {
  const blocks = md.replace(/\r\n/g, '\n').split(/\n{2,}/);
  const html: string[] = [];
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    if (block.startsWith('### ')) {
      html.push(`<h3 class="${H3}">${inline(block.slice(4))}</h3>`);
    } else if (block.startsWith('## ')) {
      html.push(`<h2 class="${H2}">${inline(block.slice(3))}</h2>`);
    } else if (block.split('\n').every((l) => l.trim().startsWith('- '))) {
      const items = block.split('\n').map((l) => `<li>${inline(l.trim().slice(2))}</li>`).join('');
      html.push(`<ul class="${UL}">${items}</ul>`);
    } else if (block.split('\n').every((l) => /^\d+\.\s/.test(l.trim()))) {
      const items = block.split('\n').map((l) => `<li>${inline(l.trim().replace(/^\d+\.\s/, ''))}</li>`).join('');
      html.push(`<ol class="${OL}">${items}</ol>`);
    } else if (block.split('\n').every((l) => l.trim().startsWith('> '))) {
      const text = block.split('\n').map((l) => l.trim().slice(2)).join(' ');
      html.push(`<blockquote class="${BQ}">${inline(text)}</blockquote>`);
    } else {
      html.push(`<p class="${P}">${inline(block.replace(/\n/g, ' '))}</p>`);
    }
  }
  return html.join('\n');
}
