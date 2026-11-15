// MedSetu V3 — question-bank pipeline (deterministic; runs inside
// prepare-data on every build, like scripts/subjects.mjs).
//
// Input : src/data/qbank-src/{pyq,corebtr,complete}.json (vendored by
//         scripts/qbank-import.mjs from the three founder-supplied exports)
//         + src/data/qbank-src/image-map.json (optional; produced by
//         scripts/qbank-images.mjs — URL -> local file, or a failure mark)
// Output: src/data/qbank/<subject-slug>.json  (per-subject chunks, on-demand)
//         src/lib/qbank-meta.json             (bank index for the UI)
//         qbank-report.json                   (build audit, repo root)
//
// Locked rules:
//  - ONE merged bank. Dedupe by normalised stem hash across all three
//    sources; the richest record wins (most images, then longest
//    explanation, then source priority CoreBTR > Complete > PYQ).
//  - Zero-mistake: if two records share a stem but their correct-option
//    TEXTS differ (after cleaning), the question is EXCLUDED entirely and
//    logged — never guessed. Every shipped question re-verifies: exactly
//    4 non-empty options, correct index in range, correct text == the
//    winning source record's verified correct text.
//  - Subjects normalise to the app's 19 canonical FMGE subjects. CoreBTR
//    system folders map to their primary FMGE subject (documented in
//    medsetu-data/QBANK-REPORT.md); the chapter survives as the topic.
//  - No option permutation (bank ships in source order per topic), so no
//    explanation letter reference can go stale. The only text operations
//    are entity decoding, zero-width stripping, whitespace normalisation
//    and HTML->text conversion — the same verified helpers as subjects.
//  - Images are never hotlinked: URLs resolve through the image map to
//    LOCAL files (/bimg/...); anything unmapped or failed keeps the
//    honest "image not available" treatment (img:true / imgMissing).
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { cleanInline, htmlToText, normStem } from './subjects.mjs';

const sha = (s) => createHash('sha256').update(s).digest('hex');
export const bankStemHash = (stem) => sha(normStem(stem));

// ---------------------------------------------------------------- subjects
export const CANONICAL_SUBJECTS = [
  'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
  'Pharmacology', 'Forensic Medicine', 'Medicine', 'Surgery',
  'Obstetrics & Gynaecology', 'Community Medicine', 'Paediatrics',
  'Ophthalmology', 'ENT', 'Anaesthesia', 'Orthopaedics', 'Dermatology',
  'Psychiatry', 'Radiology',
];
export const subjectSlug = (name) =>
  name.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const SYSTEM_TO_SUBJECT = {
  'Endocrine': 'Medicine',
  'GI Hepatobiliary System': 'Medicine',
  'Neurology': 'Medicine',
  'Cardiovascular System': 'Medicine',
  'Renal Electrolytes': 'Medicine',
  'Respiratory System': 'Medicine',
  'Rheumatology': 'Medicine',
  'Hematology': 'Pathology',
  'Immunology': 'Pathology',
  'General Pathology': 'Pathology',
  'General Pharmacology': 'Pharmacology',
  'General Physiology': 'Physiology',
};
const RAW_TO_CANONICAL = {
  'Orthopedics': 'Orthopaedics',
  'Pediatrics': 'Paediatrics',
  'Anesthesia': 'Anaesthesia',
  'Obstetrics and Gynecology': 'Obstetrics & Gynaecology',
  'Obstetrics & Gynecology': 'Obstetrics & Gynaecology',
  'Obstetrics Gynaecology': 'Obstetrics & Gynaecology',
  'Obstetrics and Gynaecology': 'Obstetrics & Gynaecology',
  'Preventive Social Medicine': 'Community Medicine',
  'Forensic Medicine Toxicology': 'Forensic Medicine',
};
function mapSubject(rawName, unknownLog) {
  const clean = String(rawName || '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  if (CANONICAL_SUBJECTS.includes(clean)) return { subject: clean, system: null };
  if (RAW_TO_CANONICAL[clean]) return { subject: RAW_TO_CANONICAL[clean], system: null };
  if (SYSTEM_TO_SUBJECT[clean]) return { subject: SYSTEM_TO_SUBJECT[clean], system: clean };
  unknownLog.add(clean);
  return { subject: clean, system: null };
}

// ---------------------------------------------------------------- topics
const capsFix = (s) => s
  .replace(/\bFmge\b/gi, 'FMGE').replace(/\bAiims\b/gi, 'AIIMS')
  .replace(/\bIni\s*-?\s*Cet\b/gi, 'INI-CET').replace(/\bInicet\b/gi, 'INI-CET')
  .replace(/\bNeet\b/gi, 'NEET');
function cleanTopic(raw) {
  return capsFix(cleanInline(raw)).replace(/\s+/g, ' ').trim();
}
function completeTopic(lesson, rawSubject) {
  let t = cleanInline(lesson);
  const subj = cleanInline(rawSubject);
  // Lessons look like "Medicine Ini Cet 2022" — drop the leading subject words.
  if (subj && t.toLowerCase().startsWith(subj.toLowerCase())) t = t.slice(subj.length).trim();
  t = capsFix(t);
  return t || 'General';
}

// ---------------------------------------------------------------- records
function stemFromList(q) {
  let stem;
  if (/<[a-z][\s\S]*?>/i.test(q.raw_text || '')) stem = htmlToText(q.raw_text);
  else stem = cleanInline(q.raw_text || q.text || '');
  if (!stem) stem = cleanInline(q.text || '');
  return stem.replace(/^\d{1,3}\s*[.)]\s+/, '').trim();
}
function cleanExplanation(html) {
  const txt = htmlToText(html || '');
  // Drop watermark-only lines ("@neet_pg_bot" is filtered inside htmlToText;
  // the Complete export sometimes leaves a lone "@" line).
  return txt.split('\n').filter((l) => !/^@\S*$/.test(l.trim())).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
const normAnswerText = (s) => cleanInline(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function listRecords(tests, source, unknownLog, stats) {
  const out = [];
  for (const t of tests) {
    const folder = (t.path && t.path.length ? t.path[t.path.length - 1] : '') || '';
    const { subject, system } = mapSubject(folder, unknownLog);
    let topic = cleanTopic(t.title || 'General');
    if (system) topic = `${system} · ${topic}`;
    for (const q of t.questions) {
      stats.raw++;
      if (q.hasVideo) stats.withVideo++;
      const options = (q.options || []).map((o) => cleanInline(o.text));
      const flagged = (q.options || []).findIndex((o) => o.correct);
      if (options.length !== 4 || options.some((o) => !o) || flagged < 0) { stats.shapeDropped++; continue; }
      // Verify correct_answer ("D. <text>") against the flagged option.
      let correctText = options[flagged];
      if (q.correct_answer) {
        const want = cleanInline(q.correct_answer.replace(/^[A-D]\.\s*/, ''));
        if (normAnswerText(want) !== normAnswerText(correctText)) { stats.caMismatch++; continue; }
      }
      const stem = stemFromList(q);
      if (!stem) { stats.shapeDropped++; continue; }
      const explanation = cleanExplanation(q.explanation);
      if (!explanation) { stats.shapeDropped++; continue; }
      out.push({
        source, subject, topic, stem, options, correct: flagged, correctText,
        explanation,
        qImgs: [...new Set(q.question_images || [])],
        eImgs: [...new Set(q.explanation_images || [])],
      });
    }
  }
  return out;
}

function completeRecords(questions, unknownLog, stats) {
  const out = [];
  for (const q of questions) {
    stats.raw++;
    const { subject } = mapSubject(q.subject, unknownLog);
    const topic = completeTopic(q.lesson, q.subject);
    const keys = ['A', 'B', 'C', 'D'];
    const options = keys.map((k) => cleanInline((q.options || {})[k] || ''));
    const correct = keys.indexOf(q.ans);
    if (options.some((o) => !o) || correct < 0) { stats.shapeDropped++; continue; }
    let stem = /<[a-z][\s\S]*?>/i.test(q.text || '') ? htmlToText(q.text) : cleanInline(q.text || '');
    stem = stem.replace(/^\d{1,3}\s*[.)]\s+/, '').trim();
    if (!stem) { stats.shapeDropped++; continue; }
    // Explanation images are inline <img> in this source; collect in order.
    const eImgs = [];
    for (const m of String(q.expl || '').matchAll(/<img[^>]+src="([^"]+)"/g)) eImgs.push(m[1]);
    const explanation = cleanExplanation(q.expl);
    if (!explanation) { stats.shapeDropped++; continue; }
    out.push({
      source: 'complete', subject, topic, stem, options, correct,
      correctText: options[correct], explanation,
      qImgs: q.img ? [q.img] : [], eImgs: [...new Set(eImgs)],
    });
  }
  return out;
}

// ---------------------------------------------------------------- build
export function buildQBank(root) {
  const srcDir = join(root, 'src', 'data', 'qbank-src');
  const outDir = join(root, 'src', 'data', 'qbank');
  const unknownLog = new Set();
  const stats = {
    perSource: {}, raw: 0, shapeDropped: 0, caMismatch: 0, withVideo: 0,
    conflicts: 0, conflictSamples: [], shipped: 0,
  };
  const all = [];
  for (const [file, source] of [['pyq.json', 'pyq'], ['corebtr.json', 'corebtr']]) {
    const tests = JSON.parse(readFileSync(join(srcDir, file), 'utf8'));
    const before = all.length;
    const st = { raw: 0, shapeDropped: 0, caMismatch: 0, withVideo: 0 };
    all.push(...listRecords(tests, source, unknownLog, st));
    stats.perSource[source] = { tests: tests.length, kept: all.length - before, ...st };
    stats.raw += st.raw; stats.shapeDropped += st.shapeDropped;
    stats.caMismatch += st.caMismatch; stats.withVideo += st.withVideo;
  }
  {
    const questions = JSON.parse(readFileSync(join(srcDir, 'complete.json'), 'utf8'));
    const before = all.length;
    const st = { raw: 0, shapeDropped: 0, caMismatch: 0, withVideo: 0 };
    all.push(...completeRecords(questions, unknownLog, st));
    stats.perSource.complete = { questions: questions.length, kept: all.length - before, ...st };
    stats.raw += st.raw; stats.shapeDropped += st.shapeDropped;
    stats.caMismatch += st.caMismatch; stats.withVideo += st.withVideo;
  }

  // ---- dedupe + conflict exclusion -------------------------------------
  const PRIO = { corebtr: 3, complete: 2, pyq: 1 };
  // Group key: normalised stem — plus the primary stem-image URL when the
  // question carries one. Generic stems ("Identify the image.") are reused
  // across genuinely different figures; the image is part of the question's
  // identity. Same stem + same image + different answers stays a conflict.
  const groups = new Map(); // groupKey -> records[]
  for (const r of all) {
    const h = bankStemHash(r.stem) + '|' + (r.qImgs[0] || '');
    if (!groups.has(h)) groups.set(h, []);
    groups.get(h).push(r);
  }
  const winners = [];
  for (const [h, recs] of groups) {
    const answers = new Set(recs.map((r) => normAnswerText(r.correctText)));
    if (answers.size > 1) {
      stats.conflicts++;
      if (stats.conflictSamples.length < 25) {
        stats.conflictSamples.push({
          stem: recs[0].stem.slice(0, 120),
          answers: recs.map((r) => `${r.source}: ${r.correctText.slice(0, 60)}`),
        });
      }
      continue;
    }
    recs.sort((a, b) =>
      ((b.qImgs.length + b.eImgs.length) - (a.qImgs.length + a.eImgs.length)) ||
      (b.explanation.length - a.explanation.length) ||
      (PRIO[b.source] - PRIO[a.source]));
    winners.push({ hash: h, ...recs[0] });
  }

  // ---- image resolution --------------------------------------------------
  const winnerUrls = new Set();
  for (const w of winners) { for (const u of w.qImgs) winnerUrls.add(u); for (const u of w.eImgs) winnerUrls.add(u); }
  writeFileSync(join(srcDir, 'winner-image-urls.json'), JSON.stringify([...winnerUrls]));
  const mapPath = join(srcDir, 'image-map.json');
  const imageMap = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
  const resolve = (url) => {
    const e = imageMap[url];
    if (!e || !e.ok || !e.file) return null;
    // A map entry is honoured only when the file is really on disk (the
    // shrink pass renames files; a stale name must degrade to the honest
    // image note, never to a broken <img>).
    if (!existsSync(join(root, 'src', 'data', 'bimg', e.file))) return null;
    return `/bimg/${e.file}`;
  };
  const imgStats = { referenced: 0, covered: 0, questionsWithImg: 0, questionsImgCovered: 0, explWithImg: 0, explImgCovered: 0, optionImgQuestions: 0 };
  // Some CoreBTR questions carry their OPTIONS as image URLs (all on
  // assets.corebtr.com, which refuses every request from this machine —
  // see QBANK-REPORT.md). Those URLs are not in the image map, so they can
  // never resolve locally; ship an honest placeholder as the option text
  // instead of leaking a raw remote URL into the app. Bare URLs inside
  // explanation/stem text (references to those same option images) are
  // scrubbed to the same honest note.
  const OPTION_IMG_PLACEHOLDER = '[Option image — not included in this edition]';
  const isUrlText = (s) => typeof s === 'string' && /^https?:\/\/\S+$/.test(s.trim());
  const scrubBareUrls = (s) => (typeof s === 'string' ? s.replace(/https?:\/\/[^\s)"'\]]+/g, '[image not included in this edition]') : s);

  // ---- emit per-subject chunks ------------------------------------------
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const bySubject = new Map();
  for (const w of winners) {
    if (!bySubject.has(w.subject)) bySubject.set(w.subject, []);
    bySubject.get(w.subject).push(w);
  }
  const metaSubjects = [];
  const seenIds = new Set();
  for (const subject of CANONICAL_SUBJECTS) {
    const recs = bySubject.get(subject) || [];
    if (!recs.length) continue;
    recs.sort((a, b) => a.topic.localeCompare(b.topic) || a.stem.localeCompare(b.stem));
    const topics = new Map();
    const questions = recs.map((w, i) => {
      topics.set(w.topic, (topics.get(w.topic) || 0) + 1);
      const id = `qb-${sha(w.hash).slice(0, 10)}`;
      if (seenIds.has(id)) throw new Error('bank id collision: ' + id);
      seenIds.add(id);
      let options = w.options;
      if (options.some(isUrlText)) {
        imgStats.optionImgQuestions++;
        options = options.map((o) => (isUrlText(o) ? OPTION_IMG_PLACEHOLDER : o));
      }
      const q = {
        bankId: id, n: i + 1, subject, topic: w.topic, text: scrubBareUrls(w.stem),
        options, correct: w.correct, explanation: scrubBareUrls(w.explanation),
        img: false,
      };
      if (w.qImgs.length) {
        imgStats.questionsWithImg++;
        const local = w.qImgs.map(resolve).filter(Boolean);
        imgStats.referenced += w.qImgs.length; imgStats.covered += local.length;
        if (local.length) { q.images = local; if (local.length === w.qImgs.length) imgStats.questionsImgCovered++; }
        else q.img = true;
      }
      if (w.eImgs.length) {
        imgStats.explWithImg++;
        imgStats.referenced += w.eImgs.length;
        const blocks = [{ t: 'text' }];
        let missing = 0, coveredHere = 0;
        for (const u of w.eImgs) {
          const local = resolve(u);
          if (local) { blocks.push({ t: 'img', src: local }); coveredHere++; }
          else missing++;
        }
        imgStats.covered += coveredHere;
        if (missing) blocks.push({ t: 'imgMissing', count: missing });
        q.explImg = true;
        q.explBlocks = blocks;
        if (!missing) imgStats.explImgCovered++;
      }
      // Hard verification gate (zero-mistake): shape + correct-text integrity.
      if (q.options.length !== 4 || q.options.some((o) => !o)) throw new Error('bad options in shipped question ' + id);
      if (!(q.correct >= 0 && q.correct <= 3)) throw new Error('bad correct index ' + id);
      if (normAnswerText(q.options[q.correct]) !== normAnswerText(w.correctText)
        && !(isUrlText(w.correctText) && q.options[q.correct] === OPTION_IMG_PLACEHOLDER)) throw new Error('correct text drift ' + id);
      return q;
    });
    const slug = subjectSlug(subject);
    writeFileSync(join(outDir, `${slug}.json`), JSON.stringify({ subject, slug, questions }));
    metaSubjects.push({
      slug, name: subject, total: questions.length,
      imgCount: questions.filter((q) => q.images || q.img).length,
      topics: [...topics.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    });
    stats.shipped += questions.length;
  }
  const unknownSubjects = [...bySubject.keys()].filter((s) => !CANONICAL_SUBJECTS.includes(s));
  const meta = {
    total: stats.shipped,
    subjects: metaSubjects,
    images: { referenced: imgStats.referenced, covered: imgStats.covered },
  };
  writeFileSync(join(root, 'src', 'lib', 'qbank-meta.json'), JSON.stringify(meta, null, 1));
  const report = {
    generatedFrom: ['pyq.json', 'corebtr.json', 'complete.json'],
    stats, imgStats,
    unknownSubjects, unknownRawNames: [...unknownLog],
    perSubject: metaSubjects.map((s) => ({ subject: s.name, total: s.total, topics: s.topics.length, imgCount: s.imgCount })),
  };
  writeFileSync(join(root, 'qbank-report.json'), JSON.stringify(report, null, 1));
  console.log(`qbank: shipped ${stats.shipped} questions across ${metaSubjects.length} subjects; conflicts excluded ${stats.conflicts}; images covered ${imgStats.covered}/${imgStats.referenced}`);
  return report;
}
