import dims from '../data/imgdims.json';

/** Real pixel dimensions for a shipped figure URL (e.g. /qimg/a.jpg),
 *  measured from the image files at build time by scripts/imgdims.mjs.
 *  Returns undefined for the handful of files whose headers don't parse —
 *  those <img> simply render as before. */
export function imgDims(src: string): { width: number; height: number } | undefined {
  const v = (dims as Record<string, string>)[src];
  if (!v) return undefined;
  const [w, h] = v.split('x').map(Number);
  return w && h ? { width: w, height: h } : undefined;
}
