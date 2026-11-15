// MedSetu V2 — subject-wise tests transform (deterministic; runs inside
// prepare-data on every build, like scripts/topup.mjs).
//
// Input : src/data/subjects-src/source.json (vendored by
//         scripts/subjects-import.mjs from the founder-supplied Marrow
//         export — ONLY the "FMGE Test Series subject" series).
// Output: src/data/subjects/<slug>-test-<n>.json  (shipped test data)
//         src/lib/subjects-meta.json              (library metadata)
//         subject-tests-report.json               (build audit, repo root)
//         ../medsetu-data/subject-tests/manifest.json (origin manifest,
//         internal only — never shipped)
//
// Locked rules (founder order 2026-11-13):
//  - Test 1 = the 2023 set, Test 2 = the 2024 set. YEARS NEVER SHIP: no
//    year string appears in any output file, id, label or meta field.
//  - Cross-swap: with both years present, exactly k questions move each way,
//    k = min(5, floor(min(n1, n2) / 3)). Only stems absent from the
//    destination set may move, so no shipped test can contain a duplicate
//    stem. Counts per test stay exactly equal to their source counts.
//  - Presentation changes only: seeded shuffle of question order and a
//    per-question option permutation with the correct index remapped.
//    NO medical text is paraphrased or edited. The only text operations are
//    HTML-entity decoding, zero-width-character stripping, whitespace
//    normalisation and HTML->text structure conversion — all verified.
//  - Source images are never hotlinked. They are downloaded once into the
//    repo (scripts/subjects-images.mjs -> src/data/simg/ + URL map in
//    src/data/subjects-src/image-map.json) and shipped as LOCAL files:
//    question figures via the `images` field, explanation images via
//    `explBlocks` (ordered blocks after the explanation text — the position
//    the source's own viewer renders them in). Any spot whose download
//    failed keeps the honest "image not available" treatment (img:true /
//    an imgMissing block) — and only that spot.
//  - Verification is a hard gate: any failure throws and aborts the build.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

// ---------------------------------------------------------------- text utils
const ZW_RE = /[​‌‍⁠﻿­]/g;
const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…',
  ndash: '–', mdash: '—', deg: '°', plusmn: '±', times: '×', divide: '÷',
  minus: '−', micro: 'µ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ',
  Delta: 'Δ', pi: 'π', omega: 'ω', Omega: 'Ω', infin: '∞', ne: '≠',
  le: '≤', ge: '≥', approx: '≈', rarr: '→', larr: '←', harr: '↔',
  bull: '•', middot: '·', copy: '©', reg: '®', trade: '™',
  eacute: 'é', aacute: 'á', ouml: 'ö', uuml: 'ü', ccedil: 'ç',
  sup1: '¹', sup2: '²', sup3: '³', frac12: '½', frac14: '¼', frac34: '¾',
};
export function decodeEntities(s) {
  return String(s).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (m, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body) ? NAMED_ENTITIES[body] : m;
  });
}
const stripZw = (s) => String(s).replace(ZW_RE, '');
/** Plain-text cleanup for fields that carry no markup (options, flat stems). */
export function cleanInline(s) {
  return decodeEntities(stripZw(String(s ?? ''))).replace(/\s+/g, ' ').trim();
}

const BLOCK_TAGS = new Set(['p', 'div', 'table', 'ul', 'ol', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'figure', 'figcaption']);
/**
 * HTML -> the app's explanation/stem text format: paragraphs separated by a
 * blank line, list items and table rows on their own lines (• / 1. markers,
 * cells joined with " | "). Inline tags keep their text. The standalone
 * "@neet_pg_bot" watermark paragraph present in every source explanation is
 * dropped (a bot tag, not medical content — see SUBJECT-TESTS-REPORT.md).
 */
export function htmlToText(html) {
  const src = stripZw(String(html ?? ''));
  const tokens = src.split(/(<[^>]+>)/g);
  let out = '';
  const listStack = [];
  const ensureBlank = () => { if (out && !out.endsWith('\n\n')) out += out.endsWith('\n') ? '\n' : '\n\n'; };
  const ensureLine = () => { if (out && !out.endsWith('\n')) out += '\n'; };
  for (const tok of tokens) {
    if (!tok) continue;
    if (tok[0] !== '<') { out += decodeEntities(tok); continue; }
    const m = tok.match(/^<\s*(\/?)\s*([a-zA-Z0-9]+)/);
    if (!m) continue;
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    if (tag === 'br') { ensureLine(); continue; }
    if (tag === 'ol' || tag === 'ul') {
      if (closing) { listStack.pop(); ensureBlank(); }
      else { ensureBlank(); listStack.push({ type: tag, n: 0 }); }
      continue;
    }
    if (tag === 'li') {
      if (closing) continue;
      ensureLine();
      const top = listStack[listStack.length - 1];
      if (top && top.type === 'ol') { top.n += 1; out += `${top.n}. `; }
      else out += '• ';
      continue;
    }
    if (tag === 'tr') { if (!closing) ensureLine(); continue; }
    if (tag === 'td' || tag === 'th') { if (closing) out += ' | '; continue; }
    if (BLOCK_TAGS.has(tag)) { ensureBlank(); continue; }
    // inline tags (strong, em, span, sup, sub, a, ...): keep text, drop tag
  }
  const lines = out
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').replace(/\s*\|\s*$/, '').trim())
    .filter((l) => stripZw(l).trim() !== '@neet_pg_bot');
  const joined = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return joined;
}

/** Word-token multiset used by the stem fidelity check. */
function wordMultiset(text) {
  const words = String(text).toLowerCase().match(/[a-z][a-z0-9]*/g) || [];
  const map = new Map();
  for (const w of words) map.set(w, (map.get(w) || 0) + 1);
  return map;
}
function multisetEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}
export const normStem = (t) =>
  cleanInline(t).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Option-letter references inside explanation bodies / stems. Every source
// explanation leads with "Correct answer: X. <correct option text>"; bodies
// may additionally reference option letters ("Option B is wrong because…").
// Permuting such a question's options would stale every reference, so those
// questions keep their source option order (see buildSubjectTests).
const LETTER_REF_RES = [
  /\bOption\s+[A-D]\b/,
  /\boption\s+[a-d]\b/,
  /\bAns\s*[:.]\s*[A-D]\b/,
  /\banswer\s+is\s+[A-D]\b/i,
  /\b[A-D]\s+is\s+(in)?correct\b/,
  /\boptions?\s+[A-D]\s*(and|&|,)\s*[A-D]\b/i,
  /\bchoice\s+[A-D]\b/i,
];
export function hasLetterRefs(text) {
  return LETTER_REF_RES.some((re) => re.test(text));
}
const ALL_ABOVE_RE = /all of the above|none of the above|both of the above/i;
const LETTERS = ['A', 'B', 'C', 'D'];

// ------------------------------------------------------------------ PRNG
function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------------------------------------------------------ build
function fail(msg) { throw new Error(`subjects transform: ${msg}`); }

export function convertQuestion(q, ctx) {
  // options + answer key
  if (!Array.isArray(q.options) || q.options.length !== 4) fail(`${ctx}: options != 4`);
  const correctFlags = q.options.map((o) => !!o.correct);
  if (correctFlags.filter(Boolean).length !== 1) fail(`${ctx}: correct flags != 1`);
  const correct = correctFlags.indexOf(true);
  const options = q.options.map((o) => cleanInline(o.text));
  if (options.some((o) => !o)) fail(`${ctx}: empty option after cleanup`);
  // cross-check the redundant correct_answer string (entity-decoded)
  const ca = cleanInline(q.correct_answer || '');
  const caText = ca.replace(/^[A-D][.)]\s*/, '');
  if (caText !== options[correct]) {
    fail(`${ctx}: correct_answer "${caText.slice(0, 60)}" != flagged option "${options[correct].slice(0, 60)}"`);
  }
  // stem: convert raw_text (HTML-aware); verify word-for-word against the
  // source's own flat `text` rendering; fall back to it on any mismatch.
  let stem;
  let stemFallback = false;
  if (/<[a-z][\s\S]*?>/i.test(q.raw_text || '')) {
    const converted = htmlToText(q.raw_text);
    const okWords = multisetEqual(
      wordMultiset(converted.split('\n').map((l) => l.replace(/^\s*(•|\d{1,2}[.)])\s+/, '')).join('\n')),
      wordMultiset(cleanInline(q.text))
    );
    // every number printed in the source flat text must survive conversion
    // (subset, not equality: the converter legitimately ADDS list ordinals)
    const numCounts = (t) => {
      const map = new Map();
      for (const n of String(t).match(/\d+(?:\.\d+)?/g) || []) map.set(n, (map.get(n) || 0) + 1);
      return map;
    };
    const convNums = numCounts(converted);
    const okNums = [...numCounts(cleanInline(q.text))].every(([n, c]) => (convNums.get(n) || 0) >= c);
    if (okWords && okNums) stem = converted;
    else { stem = cleanInline(q.text); stemFallback = true; }
  } else {
    stem = cleanInline(q.raw_text ?? q.text);
    if (!multisetEqual(wordMultiset(stem), wordMultiset(cleanInline(q.text)))) {
      stem = cleanInline(q.text);
      stemFallback = true;
    }
  }
  if (!stem) fail(`${ctx}: empty stem`);
  // explanation (HTML -> structured text)
  const explanation = htmlToText(q.explanation || '');
  if (!explanation) fail(`${ctx}: explanation empty after conversion`);
  if (explanation.includes('@neet_pg_bot')) fail(`${ctx}: watermark survived conversion`);
  if (/<\/?(p|div|span|strong|ul|ol|li|table|tr|td|br)\b/i.test(explanation)) {
    fail(`${ctx}: HTML tag survived explanation conversion`);
  }
  // The explanation's lead must name the source correct option, exactly:
  // "Correct answer: <letter>. <correct option text>". This is what makes
  // the lead safely rewritable when the options are permuted.
  const leadExact = explanation.startsWith(
    `Correct answer: ${LETTERS[correct]}. ${options[correct]}`
  );
  return {
    stem,
    stemFallback,
    options,
    correct,
    explanation,
    leadExact,
    img: Array.isArray(q.question_images) && q.question_images.length > 0,
    explImg: Array.isArray(q.explanation_images) && q.explanation_images.length > 0,
    imgUrls: Array.isArray(q.question_images) ? [...q.question_images] : [],
    explImgUrls: Array.isArray(q.explanation_images) ? [...q.explanation_images] : [],
  };
}

function pickSwapIndices(records, otherStems, k, ctx) {
  const cand = records
    .map((r, i) => (otherStems.has(r.normStem) ? -1 : i))
    .filter((i) => i >= 0);
  if (cand.length < k) fail(`${ctx}: only ${cand.length} swap candidates for k=${k}`);
  const picks = [];
  for (let j = 0; j < k; j++) picks.push(cand[Math.floor(((j + 0.5) * cand.length) / k)]);
  return picks;
}

export function buildSubjectTests(root) {
  const srcPath = join(root, 'src', 'data', 'subjects-src', 'source.json');
  if (!existsSync(srcPath)) {
    fail('src/data/subjects-src/source.json missing — run scripts/subjects-import.mjs first');
  }
  const source = JSON.parse(readFileSync(srcPath, 'utf8'));
  const outDir = join(root, 'src', 'data', 'subjects');
  mkdirSync(outDir, { recursive: true });

  // Recovered source images (scripts/subjects-images.mjs): URL -> local file
  // under src/data/simg/. Absent map (a checkout that never ran the download)
  // degrades every image spot to the honest note, exactly as V2 first shipped.
  const imgMapPath = join(root, 'src', 'data', 'subjects-src', 'image-map.json');
  const imageMap = existsSync(imgMapPath) ? JSON.parse(readFileSync(imgMapPath, 'utf8')) : null;
  const simgDir = join(root, 'src', 'data', 'simg');
  const resolveImg = (url) => {
    if (!imageMap) return null;
    const e = imageMap[url];
    if (!e || !e.f) return null;
    if (!existsSync(join(simgDir, e.f))) fail(`image map points at missing file src/data/simg/${e.f}`);
    return e.f;
  };
  const imgStats = { qRefs: 0, qWired: 0, qMissing: 0, eRefs: 0, eWired: 0, eMissing: 0 };
  const usedFiles = new Map(); // shipped file name -> bytes (deduped)
  const noteUsed = (url, f) => {
    if (!usedFiles.has(f)) usedFiles.set(f, (imageMap && imageMap[url] && imageMap[url].bytes) || 0);
  };

  const meta = [];
  const manifest = { subjects: [] };
  const report = { subjects: [], totals: { tests: 0, questions: 0, swappedPairs: 0, stemFallbacks: 0, imgQuestions: 0, explImgQuestions: 0, optionsPermuted: 0, optionsKept: 0, leadExact: 0, leadNotExact: 0, imgMatchedQuestions: 0, explImgMatchedQuestions: 0, explImgUnmatchedQuestions: 0, qImgRefs: 0, qImgWired: 0, eImgRefs: 0, eImgWired: 0, simgFiles: 0, simgBytes: 0 } };

  for (const subj of source.subjects) {
    const { slug, name } = subj;
    const years = Object.keys(subj.tests).sort(); // '2023' | '2024' (internal only)
    // Convert every source question once, with provenance.
    const byYear = {};
    for (const year of years) {
      const t = subj.tests[year];
      byYear[year] = t.questions.map((q, idx) => {
        const c = convertQuestion(q, `${slug}/${year}#${idx} (${q.id})`);
        if (c.stemFallback) report.totals.stemFallbacks += 1;
        if (c.leadExact) report.totals.leadExact += 1; else report.totals.leadNotExact += 1;
        return {
          origin: `${year}:${t.sourceId}#${idx}`,
          srcQid: q.id,
          normStem: normStem(c.stem),
          ...c,
        };
      });
    }

    // Compose the shipped test(s).
    const composed = {}; // testNo -> records[]
    if (years.length === 2) {
      const [y1, y2] = years; // 2023, 2024
      const A = byYear[y1];
      const B = byYear[y2];
      const k = Math.min(5, Math.floor(Math.min(A.length, B.length) / 3));
      const stemsA = new Set(A.map((r) => r.normStem));
      const stemsB = new Set(B.map((r) => r.normStem));
      const outA = pickSwapIndices(A, stemsB, k, `${slug} ${y1}->test2`);
      const outB = pickSwapIndices(B, stemsA, k, `${slug} ${y2}->test1`);
      const setOutA = new Set(outA);
      const setOutB = new Set(outB);
      composed[1] = [...A.filter((_, i) => !setOutA.has(i)), ...outB.map((i) => B[i])];
      composed[2] = [...B.filter((_, i) => !setOutB.has(i)), ...outA.map((i) => A[i])];
      composed.__k = k;
      composed.__swap = {
        test1FromOther: outB.map((i) => B[i].origin),
        test2FromOther: outA.map((i) => A[i].origin),
      };
    } else {
      const year = years[0];
      composed[year === '2023' ? 1 : 2] = [...byYear[year]];
      composed.__k = 0;
      composed.__swap = { test1FromOther: [], test2FromOther: [] };
    }
    const k = composed.__k;
    delete composed.__k;
    const swapInfo = composed.__swap;
    delete composed.__swap;

    // ---- verification + write, per shipped test ---------------------------
    const allOrigins = new Set();
    for (const recs of [...Object.values(byYear)]) for (const r of recs) allOrigins.add(r.origin);
    const shippedOrigins = new Set();
    const testMetas = [];
    const manifestTests = {};

    for (const [testNoStr, records] of Object.entries(composed)) {
      const testNo = Number(testNoStr);
      const testId = `${slug}-test-${testNo}`;
      const srcYear = testNo === 1 ? '2023' : '2024';
      const srcTest = subj.tests[srcYear];
      // (c) counts stay exactly equal to the source count
      if (records.length !== srcTest.questions.length) {
        fail(`${testId}: count ${records.length} != source count ${srcTest.questions.length}`);
      }
      // (d) swap accounting by origin (exact)
      const fromOther = records.filter((r) => !r.origin.startsWith(`${srcYear}:`));
      if (fromOther.length !== k) fail(`${testId}: ${fromOther.length} foreign-origin questions, expected ${k}`);
      // (d2) swap accounting by stem hash: stems in (other set − own set) == k
      if (years.length === 2) {
        const ownStems = new Set(byYear[srcYear].map((r) => r.normStem));
        const otherStems = new Set(byYear[srcYear === '2023' ? '2024' : '2023'].map((r) => r.normStem));
        const hashCounted = records.filter((r) => otherStems.has(r.normStem) && !ownStems.has(r.normStem)).length;
        if (hashCounted !== k) fail(`${testId}: stem-hash swap count ${hashCounted} != ${k}`);
      }
      // (e) no internal duplicate stems
      const stemSet = new Set(records.map((r) => r.normStem));
      if (stemSet.size !== records.length) fail(`${testId}: duplicate stems inside the shipped test`);
      for (const r of records) {
        if (shippedOrigins.has(r.origin)) fail(`${testId}: origin ${r.origin} shipped twice`);
        shippedOrigins.add(r.origin);
      }

      // Shuffle (seeded) + option permutation with remapped key. A
      // question's options are permuted ONLY when nothing can go stale:
      // no all/none-of-the-above option, no option-letter reference in the
      // stem or in the explanation body beyond its lead, and an exact
      // "Correct answer: X. <text>" lead (whose letter is then rewritten to
      // the correct option's new letter). All other questions keep their
      // source option order untouched.
      const rnd = mulberry32(fnv1a(`${slug}|test-${testNo}`));
      const ordered = shuffled(records, rnd);
      // Per-test image accounting (filled by the map below).
      let tQRef = 0, tQMatched = 0, tERef = 0, tEFull = 0, tEUnmatched = 0;
      const questions = ordered.map((r, i) => {
        const leadLen = `Correct answer: ${LETTERS[r.correct]}. `.length;
        const bodyRefs = hasLetterRefs(r.explanation.slice(leadLen)) || hasLetterRefs(r.stem);
        const pinned = r.options.some((o) => ALL_ABOVE_RE.test(o));
        const permutable = r.leadExact && !bodyRefs && !pinned;
        let options = r.options;
        let correct = r.correct;
        let explanation = r.explanation;
        if (permutable) {
          const perm = shuffled([0, 1, 2, 3], rnd);
          options = perm.map((oi) => r.options[oi]);
          correct = perm.indexOf(r.correct);
          explanation = `Correct answer: ${LETTERS[correct]}. ${r.explanation.slice(leadLen)}`;
          report.totals.optionsPermuted += 1;
        } else {
          report.totals.optionsKept += 1;
        }
        // (b) correct option TEXT after permutation == source correct text
        if (options[correct] !== r.options[r.correct]) fail(`${testId} Q${i + 1}: remapped correct text mismatch`);
        // (b2) the explanation lead names the SHIPPED correct option: its
        // letter and its text (for exact-lead questions), or at minimum the
        // source letter is untouched because the order never changed.
        if (r.leadExact && !explanation.startsWith(`Correct answer: ${LETTERS[correct]}. ${options[correct]}`)) {
          fail(`${testId} Q${i + 1}: explanation lead does not name the shipped correct option`);
        }
        if (!r.leadExact && explanation !== r.explanation) {
          fail(`${testId} Q${i + 1}: non-exact-lead explanation was modified`);
        }
        // (a) subject purity is structural: r comes from this subject's own
        // source tests only (asserted again globally below).

        // Images: wire the recovered LOCAL files. Question figures go to
        // `images` (the runner/solution/print figure slot); the honest
        // `img` flag survives only where a referenced figure could not be
        // recovered. Explanation images become ordered blocks after the
        // text block — the position the source's own viewer renders them
        // in — with unrecovered spots coalesced into imgMissing blocks.
        let images;
        let img = false;
        if (r.imgUrls.length) {
          tQRef += 1;
          const resolved = r.imgUrls.map((u) => resolveImg(u));
          imgStats.qRefs += r.imgUrls.length;
          imgStats.qWired += resolved.filter(Boolean).length;
          imgStats.qMissing += resolved.filter((f) => !f).length;
          r.imgUrls.forEach((u, k) => { if (resolved[k]) noteUsed(u, resolved[k]); });
          const files = resolved.filter(Boolean).map((f) => `/simg/${f}`);
          if (files.length) images = files;
          img = resolved.some((f) => !f);
          if (!img) tQMatched += 1;
        }
        let explBlocks;
        if (r.explImgUrls.length) {
          tERef += 1;
          imgStats.eRefs += r.explImgUrls.length;
          explBlocks = [{ t: 'text' }];
          let missingRun = 0;
          let missingTotal = 0;
          const flushMissing = () => {
            if (missingRun) { explBlocks.push({ t: 'imgMissing', count: missingRun }); missingRun = 0; }
          };
          for (const u of r.explImgUrls) {
            const f = resolveImg(u);
            if (f) {
              flushMissing();
              explBlocks.push({ t: 'img', src: `/simg/${f}` });
              noteUsed(u, f);
              imgStats.eWired += 1;
            } else {
              missingRun += 1;
              missingTotal += 1;
              imgStats.eMissing += 1;
            }
          }
          flushMissing();
          if (missingTotal === 0) tEFull += 1; else tEUnmatched += 1;
        }
        const shipped = {
          n: i + 1,
          subject: name,
          text: r.stem,
          options,
          correct,
          explanation,
          img,
          explImg: r.explImg,
        };
        if (images) shipped.images = images;
        if (explBlocks) shipped.explBlocks = explBlocks;
        return shipped;
      });

      const data = {
        testId,
        slug,
        subject: name,
        testNo,
        durationMin: srcTest.durationMin,
        questions,
      };
      // Years never ship: the data root carries only testId/slug/subject/
      // testNo/durationMin (no year field exists to leak); page HTML and
      // meta are asserted year-free by the smoke tests.
      // No remote image reference may survive into shipped data: every
      // figure is a local /simg/ file by construction; assert it outright.
      const dataJson = JSON.stringify(data);
      for (const host of ['dailyrounds.org', 'cloudfront.net', 'researchgate.net']) {
        if (dataJson.includes(host)) fail(`${testId}: remote publisher host ${host} leaked into shipped data`);
      }
      writeFileSync(join(outDir, `${testId}.json`), dataJson);

      report.totals.imgQuestions += tQRef;
      report.totals.explImgQuestions += tERef;
      report.totals.imgMatchedQuestions += tQMatched;
      report.totals.explImgMatchedQuestions += tEFull;
      report.totals.explImgUnmatchedQuestions += tEUnmatched;
      report.totals.tests += 1;
      report.totals.questions += questions.length;
      testMetas.push({
        testNo,
        testId,
        total: questions.length,
        durationMin: srcTest.durationMin,
        imgCount: tQRef,
        imgMatched: tQMatched,
        explImgCount: tERef,
        explImgMatched: tEFull,
        explImgUnmatched: tEUnmatched,
        swappedIn: k,
      });
      manifestTests[testNo] = {
        testId,
        origins: ordered.map((r) => r.origin),
        swapOriginsFromOtherYear: testNo === 1 ? swapInfo.test1FromOther : swapInfo.test2FromOther,
      };
    }
    // (f) bijection: shipped origins == source origins for this subject
    if (shippedOrigins.size !== allOrigins.size) {
      fail(`${slug}: shipped ${shippedOrigins.size} origins vs source ${allOrigins.size}`);
    }
    for (const o of allOrigins) if (!shippedOrigins.has(o)) fail(`${slug}: source origin ${o} never shipped`);

    testMetas.sort((a, b) => a.testNo - b.testNo);
    meta.push({ slug, name, descriptor: subj.descriptor ?? null, tests: testMetas });
    manifest.subjects.push({ slug, name, tests: manifestTests });
    report.subjects.push({ slug, name, swapK: k, tests: testMetas });
    if (years.length === 2) report.totals.swappedPairs += 1;
  }

  // Global image accounting gates (census tripwires from the source audit:
  // 350 question-image references, 828 explanation-image references).
  if (imgStats.qRefs !== 350) fail(`question image references ${imgStats.qRefs} != census 350`);
  if (imgStats.eRefs !== 828) fail(`explanation image references ${imgStats.eRefs} != census 828`);
  if (imgStats.qWired + imgStats.qMissing !== imgStats.qRefs) fail('question image accounting does not close');
  if (imgStats.eWired + imgStats.eMissing !== imgStats.eRefs) fail('explanation image accounting does not close');
  report.totals.qImgRefs = imgStats.qRefs;
  report.totals.qImgWired = imgStats.qWired;
  report.totals.eImgRefs = imgStats.eRefs;
  report.totals.eImgWired = imgStats.eWired;
  report.totals.simgFiles = usedFiles.size;
  report.totals.simgBytes = [...usedFiles.values()].reduce((a, b) => a + b, 0);

  writeFileSync(join(root, 'src', 'lib', 'subjects-meta.json'), JSON.stringify(meta, null, 1));
  writeFileSync(join(root, 'subject-tests-report.json'), JSON.stringify(report, null, 1));
  const manifestDir = join(root, '..', 'medsetu-data', 'subject-tests');
  if (existsSync(manifestDir)) {
    writeFileSync(join(manifestDir, 'manifest.json'), JSON.stringify(manifest, null, 1));
  }
  return report;
}
