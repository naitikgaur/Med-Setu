// MedSetu data preparation.
// Reads the raw extracted papers from src/data/raw/, applies the locked rules:
//  - EXCLUDE any question with "broken": true OR options that are not exactly
//    4 non-empty strings (Amendment A). Dropped counts are disclosed in meta.
//  - COMPLETE every paper short of 300 to a full 300 with questions from
//    other years' book papers, chosen by subject-weightage equalisation
//    (scripts/topup.mjs — locked strategy, user order 2026-11-12). Added
//    questions keep full provenance (added / fromPaper / fromLabel / fromN).
//  - Compute `img: true` when the stem references an image (Amendment D regex,
//    tuned so every paper lands within ±20% of the extraction-report counts).
//  - Part split: Part I = first ceil(n/2) playable questions, Part II = rest.
// Writes processed papers to src/data/papers/, meta to src/lib/papers-meta.json
// and the top-up audit trail to topup-report.json (repo root).
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, copyFileSync, cpSync, linkSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IMG_RE, isPlayable } from './paperlib.mjs';
import { applyTopUp } from './topup.mjs';
import { buildSubjectTests } from './subjects.mjs';
import { buildQBank } from './qbank.mjs';

/**
 * Mirror an image directory into public/ using hardlinks where possible:
 * a hardlink is the same inode, so it costs no extra disk quota on this
 * machine (whose home quota is nearly full); fall back to a real copy.
 */
export function copyLinked(src, dst) {
  rmSync(dst, { recursive: true, force: true });
  if (!existsSync(src)) return;
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dst, name);
    if (statSync(s).isDirectory()) { copyLinked(s, d); continue; }
    try { linkSync(s, d); } catch { copyFileSync(s, d); }
  }
}

export { IMG_RE, isPlayable };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = join(root, 'src', 'data', 'raw');
const outDir = join(root, 'src', 'data', 'papers');
mkdirSync(outDir, { recursive: true });

// ---- question images extracted from the source book -----------------------
// Source of truth: src/data/image-map.json + src/data/qimg/ (mirrored from
// ~/workspace/medsetu-data, see medsetu-data/IMAGE-REPORT.md). The map gives,
// per book paper, the figure file(s) printed with each question in the book.
// Files are copied into public/qimg/ so they ship with the static export.
const imageMapPath = join(root, 'src', 'data', 'image-map.json');
const imageMap = existsSync(imageMapPath) ? JSON.parse(readFileSync(imageMapPath, 'utf8')) : {};
const qimgSrc = join(root, 'src', 'data', 'qimg');
const qimgDst = join(root, 'public', 'qimg');
copyLinked(qimgSrc, qimgDst);

// Subject-test figures recovered from the publisher URLs in the source
// (scripts/subjects-images.mjs). Same pattern: src/data/simg/ is the source
// of truth, mirrored into public/simg/ so the static export ships them.
const simgSrc = join(root, 'src', 'data', 'simg');
const simgDst = join(root, 'public', 'simg');
copyLinked(simgSrc, simgDst);

// Question-bank figures (scripts/qbank-images.mjs, capped by the machine's
// disk quota — see QBANK-REPORT.md). Same mirroring into public/bimg/.
const bimgSrc = join(root, 'src', 'data', 'bimg');
const bimgDst = join(root, 'public', 'bimg');
copyLinked(bimgSrc, bimgDst);

// Real pixel dimensions for every shipped figure, so the runners can set
// width/height on <img> and the browser reserves the box before load (CLS).
{
  const { scanDirs } = await import('./imgdims.mjs');
  const { out, found, missed } = scanDirs(root, ['qimg', 'simg', 'bimg']);
  writeFileSync(join(root, 'src', 'data', 'imgdims.json'), JSON.stringify(out));
  console.log(`imgdims: ${found} measured, ${missed} skipped`);
}

// Real-session pass percentages (NBEMS-published results, from FMGE-RESEARCH.md).
// dec-2020 is approximate in the sources and labelled as such wherever shown.
const PASS_PCT = {
  'dec-2020': { pct: 19.5, approx: true },
  'jun-2021': { pct: 23.7, approx: false },
  'dec-2021': { pct: 24.3, approx: false },
  'jun-2022': { pct: 10.6, approx: false },
  'jan-2023': { pct: 32.2, approx: false },
  'jul-2023': { pct: 10.2, approx: false },
  'jan-2024': { pct: 20.6, approx: false },
  'jun-2024': { pct: 20.9, approx: false },
  'jan-2025': { pct: 29.6, approx: false },
  'jul-2025': { pct: 18.6, approx: false },
  'jan-2026': { pct: 23.4, approx: false },
  'jun-2026': { pct: 12.8, approx: false },
};

// Papers are presented oldest-first in the library.
const ORDER = [
  'dec-2020', 'jun-2021', 'dec-2021', 'jun-2022', 'jan-2023', 'jul-2023',
  'jan-2024', 'jun-2024', 'jan-2025', 'jul-2025', 'jan-2026', 'jun-2026',
];

// ---- load every paper and apply the Amendment A exclusion ----------------
const papers = new Map(); // paperId -> { raw, playable }
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.json'))) {
  const raw = JSON.parse(readFileSync(join(rawDir, file), 'utf8'));
  papers.set(raw.paperId, { raw, playable: raw.questions.filter(isPlayable) });
}

// ---- complete short papers to 300 (locked top-up strategy) ---------------
const topupInput = new Map();
for (const [id, { raw, playable }] of papers) {
  topupInput.set(id, { label: raw.label, examDate: raw.examDate, playable });
}
const { additions, report: topupReport } = applyTopUp(topupInput);
writeFileSync(join(root, 'topup-report.json'), JSON.stringify(topupReport, null, 1));

// ---- write processed papers + meta ---------------------------------------
const processQuestion = (q, paperId, isOwn) => {
  // A few recall questions were image-only in the source (jan-2026 Q232, Q240,
  // Q248): options survived extraction, the stem did not. Keep them (they are
  // part of the locked playable count) with an honest placeholder stem; the
  // placeholder itself trips the image detector, so they carry the img chip.
  const emptyStem = !q.text || !q.text.trim();
  const text = emptyStem
    ? 'Image-based question — in the original paper this question was an image, and its stem text is not available in this recall edition. The four options below are as recalled.'
    : q.text;
  // Book figures extracted for this question (own questions only — completion
  // donors are never image questions). `img` then means "the stem references
  // an image that could NOT be recovered", so the unavailable banner shows
  // only where no figure was matched.
  const files = isOwn && imageMap[paperId] ? imageMap[paperId][String(q.n)] || [] : [];
  const images = files.map((f) => `/qimg/${f}`);
  const out = {
    n: q.n,
    subject: q.subject ?? null,
    text,
    options: q.options,
    correct: q.correct,
    explanation: q.explanation ?? '',
    img: IMG_RE.test(text) && images.length === 0,
  };
  if (images.length > 0) out.images = images;
  if (Array.isArray(q.optionImages) && q.optionImages.length === 4) {
    out.optionImages = q.optionImages.map((f) => `/qimg/${f}`);
  }
  if (q.added) {
    out.added = true;
    out.fromPaper = q.fromPaper;
    out.fromLabel = q.fromLabel;
    out.fromN = q.fromN;
  }
  return out;
};

const meta = [];
for (const [paperId, { raw, playable }] of papers) {
  const file = `${paperId}.json`;
  const own = playable.map((q) => processQuestion(q, paperId, true));
  const addedRaw = additions.get(paperId) || [];
  const added = addedRaw.map((q) => processQuestion(q, paperId, false));
  const questions = [...own, ...added];
  const out = {
    paperId: raw.paperId,
    label: raw.label,
    session: raw.session,
    examDate: raw.examDate,
    questions,
  };
  writeFileSync(join(outDir, file), JSON.stringify(out));

  // "Subjects covered" / explanations describe the paper's OWN questions.
  // (The 2026 recalls have neither in their source; the completion questions
  // borrowed from book papers do not change what the source itself holds.)
  const subjectCounts = {};
  for (const q of own) {
    if (q.subject) subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
  }
  const addedBySubject = {};
  const addedFromMap = new Map();
  for (const q of addedRaw) {
    if (q.subject) addedBySubject[q.subject] = (addedBySubject[q.subject] || 0) + 1;
    const cur = addedFromMap.get(q.fromPaper) || { paperId: q.fromPaper, label: q.fromLabel, count: 0 };
    cur.count += 1;
    addedFromMap.set(q.fromPaper, cur);
  }
  const addedFrom = [...addedFromMap.values()]
    .sort((a, b) => (b.count - a.count) || a.paperId.localeCompare(b.paperId));
  const dropped = raw.questions.length - own.length;
  meta.push({
    paperId: raw.paperId,
    label: raw.label,
    session: raw.session,
    examDate: raw.examDate,
    sourceTotal: raw.questions.length,
    total: questions.length,
    ownTotal: own.length,
    addedCount: added.length,
    addedBySubject,
    addedFrom,
    dropped,
    part1: Math.ceil(questions.length / 2),
    part2: questions.length - Math.ceil(questions.length / 2),
    // imgCount = questions whose stem references an image (detector count, as
    // before); imgMatched = those for which the book figure was recovered.
    imgCount: questions.filter((q) => IMG_RE.test(q.text)).length,
    imgMatched: questions.filter((q) => IMG_RE.test(q.text) && q.images && q.images.length > 0).length,
    imgUnmatched: questions.filter((q) => IMG_RE.test(q.text) && !(q.images && q.images.length > 0)).length,
    hasSubjects: own.some((q) => q.subject),
    hasExplanations: own.length > 0 && own.every((q) => q.explanation && q.explanation.trim()),
    subjectsPresent: Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count),
    passPct: PASS_PCT[raw.paperId] ?? null,
  });
}
meta.sort((a, b) => ORDER.indexOf(a.paperId) - ORDER.indexOf(b.paperId));
writeFileSync(join(root, 'src', 'lib', 'papers-meta.json'), JSON.stringify(meta, null, 1));
for (const m of meta) {
  console.log(
    `${m.paperId}: playable ${m.total}/${m.sourceTotal} (dropped ${m.dropped}), parts ${m.part1}+${m.part2}, img ${m.imgCount}, subjects ${m.hasSubjects ? m.subjectsPresent.length : 0}, explanations ${m.hasExplanations}`
  );
}
console.log(`Paper completion: added ${topupReport.totalAdded} questions across ${Object.keys(topupReport.targets).length} papers (donor ledger ${topupReport.ledgerSize} unique donors, ${topupReport.failures.length} failures).`);
console.log(`Prepared ${meta.length} papers.`);

// ---- subject-wise tests (V2): deterministic transform + verification -----
// Reads the vendored subject-series source (scripts/subjects-import.mjs),
// applies the cross-year swap + seeded shuffle + option permutation, and
// verifies purity/counts/answer remapping. Throws (aborting the build) on
// any mismatch. See scripts/subjects.mjs and SUBJECT-TESTS-REPORT.md.
const subjectReport = buildSubjectTests(root);
console.log(
  `Subject tests: ${subjectReport.totals.tests} tests, ${subjectReport.totals.questions} questions, ` +
  `${subjectReport.totals.swappedPairs} subject pairs cross-swapped, ${subjectReport.totals.stemFallbacks} stem fallbacks, ` +
  `images: ${subjectReport.totals.qImgWired}/${subjectReport.totals.qImgRefs} question figures + ` +
  `${subjectReport.totals.eImgWired}/${subjectReport.totals.eImgRefs} explanation images wired as local files ` +
  `(${subjectReport.totals.simgFiles} files, ${(subjectReport.totals.simgBytes / 1048576).toFixed(1)} MB).`
);

// ---- question bank (V3): merge the three source files into one bank ------
// scripts/qbank.mjs — dedupe by normalised stem hash (+ stem image), answer
// conflicts excluded and logged; per-subject chunks + qbank-meta for the app.
const qbankReport = buildQBank(root);
console.log(
  `Question bank: ${qbankReport.stats.shipped} questions across ${qbankReport.perSubject.length} subjects ` +
  `(${qbankReport.stats.conflicts} answer conflicts excluded); ` +
  `images ${qbankReport.imgStats.covered}/${qbankReport.imgStats.referenced} references wired to local files.`
);
