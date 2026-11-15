// Shared paper-data helpers for MedSetu's build scripts (prepare-data, topup).
// Kept in one place so the img-flag logic and playability rules are computed
// identically everywhere.

// Image-reference detector (Amendment D). The spec's draft regex used bare
// "marked" and bare "x-ray", which over-count (e.g. "markedly", theory X-ray
// questions). Tightened: qualified "marked <structure|arrow|…>", qualified
// "x-ray <film|image|shows|shown|below>", plus "graph(s) provided/shown".
// Resulting counts land within ±20% of the extraction report for all 12 papers.
export const IMG_RE =
  /image|figure|shown below|given below|radiograph|photograph|picture|diagram|illustration|marked (structure|arrow|area|region|label|in the|as)|x-?ray (film|image|shows|shown|below)|graphs? (provided|shown)|provided graphs?/i;

export function isPlayable(q) {
  if (q.broken) return false;
  if (Array.isArray(q.options) && q.options.length === 4 &&
      q.options.every((o) => typeof o === 'string' && o.trim().length > 0)) return true;
  // Image-options questions (e.g. jul-2025 Q107, whose four options are
  // pictures in the source book): playable when all four option images exist.
  return Array.isArray(q.optionImages) && q.optionImages.length === 4 &&
    q.optionImages.every((o) => typeof o === 'string' && o.trim().length > 0);
}

export function hasTextOptions(q) {
  return Array.isArray(q.options) && q.options.length === 4 &&
    q.options.every((o) => typeof o === 'string' && o.trim().length > 0);
}

const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

// "20 January 2024" -> epoch ms (UTC). Throws on an unrecognised format so a
// typo in the data fails the build loudly instead of skewing session distance.
export function parseExamDate(str) {
  const m = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(String(str).trim());
  if (!m || !(m[2].toLowerCase() in MONTHS)) throw new Error(`Unparseable examDate: ${str}`);
  return Date.UTC(Number(m[3]), MONTHS[m[2].toLowerCase()], Number(m[1]));
}

// Stem normalisation for duplicate detection: lowercase, strip punctuation,
// collapse whitespace.
export function normalizeStem(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenSet(text) {
  const norm = normalizeStem(text);
  return new Set(norm ? norm.split(' ') : []);
}

export function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  return inter / (a.size + b.size - inter);
}
