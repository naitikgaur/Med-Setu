// Formats a book explanation for reading: the source text is usually one
// long paragraph, so it is split into sentences and grouped into short
// paragraphs. The words themselves are never altered — only whitespace
// and paragraph breaks are added. Pure component, safe for print views.

import type { ExplBlock } from '../lib/types';
import { imgDims } from '../lib/imgdims';

export function explanationParagraphs(text: string): string[] {
  const raw = String(text || '');
  if (!raw.trim()) return [];
  // Structured text (subject-wise test explanations carry paragraph breaks
  // and list lines from their source) is honoured as authored. Book-paper
  // explanations contain no line breaks at all, so they always take the
  // sentence-grouping path below — unchanged behaviour for them.
  if (raw.includes('\n')) {
    const blocks = raw
      .split(/\n\s*\n/)
      .map((b) => b.replace(/[ \t]+/g, ' ').trim())
      .filter(Boolean);
    if (blocks.length) return blocks;
  }
  const clean = raw.replace(/\s+/g, ' ').trim();
  const sentences = clean.match(/[^.!?]+[.!?]+["')\]]*\s*/g) || [clean];
  const paras: string[] = [];
  let cur = '';
  for (const s of sentences) {
    cur += s;
    const words = cur.split(' ').length;
    if (words >= 55) {
      paras.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) paras.push(cur.trim());
  return paras.length ? paras : [clean];
}

export default function ExplanationText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const paras = explanationParagraphs(text);
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i} className={`whitespace-pre-wrap ${i > 0 ? 'mt-2' : ''}`}>
          {p}
        </p>
      ))}
    </div>
  );
}

/**
 * A subject-test explanation rendered as its ordered blocks: the text
 * (from `text`, exactly as ExplanationText renders it), then the recovered
 * source images in the source's order, with an honest note in place of any
 * image that could not be recovered. Text is rendered through React (never
 * raw HTML) — the image is the only non-text block.
 */
export function ExplanationBlocks({
  text,
  blocks,
  className = '',
}: {
  text: string;
  blocks: ExplBlock[];
  className?: string;
}) {
  return (
    <div className={className}>
      {blocks.map((b, i) => {
        if (b.t === 'text') return <ExplanationText key={i} text={text} />;
        if (b.t === 'img')
          return (
            <img
              key={i}
              src={b.src}
              alt="Figure from the source explanation"
              loading="lazy"
              width={imgDims(b.src)?.width}
              height={imgDims(b.src)?.height}
              className="mt-3 max-h-[440px] w-auto max-w-full rounded-md border border-line bg-white object-contain"
            />
          );
        return (
          <p
            key={i}
            className="mt-3 rounded-md bg-paper px-3.5 py-3 text-sm leading-relaxed text-inksoft"
          >
            The source explanation for this question also includes{' '}
            {b.count === 1 ? 'an image' : `${b.count} images`} that could not be recovered
            for this edition.
          </p>
        );
      })}
    </div>
  );
}
