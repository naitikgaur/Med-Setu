// MedSetu smoke tests. Run: npm run smoke (after npm run build for part 3).
//  1. Validates all 12 paper JSONs against the locked counts (Amendment A),
//     option/answer integrity, and book-paper subject+explanation completeness.
//  2. Unit-tests the pure analysis functions on scripted attempts with known
//     answers (score, buckets, change-net, skip dividend, roll-up sums, verdict).
//  3. Verifies the static export contains home, about, all 12 per-paper routes,
//     and a JS chunk carrying each paper's questions.
//  7. Verifies the gated entry flow: the landing is descriptions-only (no
//     paper links, no inputs), the /start gate exists and its pure validator
//     is unit-tested, and the /papers + paper-page guards are in the source.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyseAttempt, LETTERS } from '../src/lib/analysis.js';
import { makeChallenge, validateGate } from '../src/lib/gate.js';
import { convertQuestion, normStem as subjNormStem } from '../scripts/subjects.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const ok = (cond, msg) => {
  if (cond) console.log(`  ✓ ${msg}`);
  else { failures += 1; console.error(`  ✗ FAIL: ${msg}`); }
};

// ---------- 1. dataset validation ----------
console.log('1) Dataset validation');
const EXPECTED = {
  'dec-2020': 298, 'jun-2021': 300, 'dec-2021': 300, 'jun-2022': 297,
  'jan-2023': 300, 'jul-2023': 300, 'jan-2024': 294, 'jun-2024': 296,
  'jan-2025': 300, 'jul-2025': 300, 'jan-2026': 286, 'jun-2026': 257,
};
const BOOK = new Set(Object.keys(EXPECTED).filter((id) => !id.endsWith('2026')));
// Completion questions added by scripts/topup.mjs (locked strategy): every
// short paper is completed to 300 from other years' book papers.
const EXPECTED_ADDED = {
  'dec-2020': 2, 'jun-2021': 0, 'dec-2021': 0, 'jun-2022': 3,
  'jan-2023': 0, 'jul-2023': 0, 'jan-2024': 6, 'jun-2024': 4,
  'jan-2025': 0, 'jul-2025': 0, 'jan-2026': 14, 'jun-2026': 43,
};
const isPlayable = (q) =>
  !q.broken &&
  ((Array.isArray(q.options) && q.options.length === 4 &&
    q.options.every((o) => typeof o === 'string' && o.trim().length > 0)) ||
   (Array.isArray(q.optionImages) && q.optionImages.length === 4 &&
    q.optionImages.every((o) => typeof o === 'string' && o.trim().length > 0)));
const normStem = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
const donorLedger = new Set();

const rawDir = join(root, 'src', 'data', 'raw');
const processedDir = join(root, 'src', 'data', 'papers');
const meta = JSON.parse(readFileSync(join(root, 'src', 'lib', 'papers-meta.json'), 'utf8'));
ok(meta.length === 12, 'meta lists 12 papers');

for (const id of Object.keys(EXPECTED)) {
  const raw = JSON.parse(readFileSync(join(rawDir, `${id}.json`), 'utf8'));
  const playable = raw.questions.filter(isPlayable);
  ok(playable.length === EXPECTED[id], `${id}: playable count ${playable.length} (expected ${EXPECTED[id]})`);
  ok(
    playable.every((q) => Number.isInteger(q.correct) && q.correct >= 0 && q.correct <= 3),
    `${id}: every playable question has correct in 0..3`
  );
  // Stem text is asserted on the processed file below: three jan-2026 recall
  // questions were image-only in the source (empty stem after extraction) and
  // receive an honest placeholder stem in data-prep.
  if (BOOK.has(id)) {
    ok(
      playable.every((q) => q.subject && q.subject.trim()),
      `${id}: every playable question has a subject (book paper)`
    );
    ok(
      playable.every((q) => q.explanation && q.explanation.trim()),
      `${id}: every playable question has a non-empty explanation (book paper)`
    );
  } else {
    ok(
      playable.every((q) => q.subject === null && (!q.explanation || !q.explanation.trim())),
      `${id}: 2026 recall honestly has no subjects/explanations`
    );
  }
  const processed = JSON.parse(readFileSync(join(processedDir, `${id}.json`), 'utf8'));
  ok(processed.questions.length === 300, `${id}: processed file has 300 questions after completion`);
  ok(
    processed.questions.every((q) => typeof q.text === 'string' && q.text.trim().length > 0),
    `${id}: every processed question has non-empty stem text (placeholders where the source was image-only)`
  );
  ok(
    processed.questions.every((q) => typeof q.img === 'boolean' &&
      (q.options.length === 4 || (Array.isArray(q.optionImages) && q.optionImages.length === 4))),
    `${id}: processed questions carry img flags and 4 options (text or image)`
  );
  // The paper's own questions must be untouched: same count, same order, same
  // stems/answers as the playable raw questions (placeholder substitution for
  // image-only stems aside).
  const own = processed.questions.slice(0, EXPECTED[id]);
  ok(
    own.every((q) => !q.added) &&
      own.every((q, i) => q.correct === playable[i].correct && q.options.join('') === playable[i].options.join('') &&
        (q.text === playable[i].text || (!playable[i].text.trim() && q.text.startsWith('Image-based question')))),
    `${id}: own ${EXPECTED[id]} questions unchanged and in original order`
  );
  // Completion questions: full provenance, real subject + explanation, no image.
  const added = processed.questions.slice(EXPECTED[id]);
  ok(added.length === EXPECTED_ADDED[id], `${id}: ${EXPECTED_ADDED[id]} completion questions added (got ${added.length})`);
  ok(
    added.every((q, i) => q.added === true && q.n === EXPECTED[id] + i + 1 &&
      typeof q.fromPaper === 'string' && BOOK.has(q.fromPaper) && q.fromPaper !== id &&
      typeof q.fromLabel === 'string' && q.fromLabel.length > 0 &&
      Number.isInteger(q.fromN) && q.subject && q.subject.trim() &&
      q.explanation && q.explanation.trim() && q.img === false &&
      q.options.every((o) => typeof o === 'string' && o.trim().length > 0)),
    `${id}: every added question has provenance, subject, explanation, 4 options, no image flag`
  );
  for (const q of added) donorLedger.add(`${q.fromPaper}#${q.fromN}`);
  // No completion question may duplicate a stem already in the paper (exact
  // normalised match; the build additionally enforces a near-duplicate
  // threshold of Jaccard 0.85), and added stems are mutually unique. Note the
  // source book itself repeats a few stems inside some papers (e.g. generic
  // "identify the marked structure" image stems, dec-2020 Q291/Q292) — those
  // are the paper's own questions, which the completion rules leave untouched.
  const ownStems = new Set(own.map((q) => normStem(q.text)));
  const addedStems = added.map((q) => normStem(q.text));
  ok(
    addedStems.every((s) => !ownStems.has(s)) && new Set(addedStems).size === addedStems.length,
    `${id}: no added question duplicates a stem already in the paper`
  );
  const m = meta.find((x) => x.paperId === id);
  ok(
    m && m.total === 300 && m.part1 === 150 && m.part2 === 150 &&
      m.ownTotal === EXPECTED[id] && m.addedCount === EXPECTED_ADDED[id],
    `${id}: meta totals 300 (150+150), own ${EXPECTED[id]}, added ${EXPECTED_ADDED[id]}`
  );
  if (id.endsWith('2026')) {
    ok(m.hasSubjects === false && m.hasExplanations === false,
      `${id}: meta still reports the recall source itself as untagged / answers-only`);
  }
}
const totalAdded = Object.values(EXPECTED_ADDED).reduce((s, n) => s + n, 0);
ok(donorLedger.size === totalAdded,
  `global donor ledger: ${donorLedger.size} unique donors used for ${totalAdded} added questions (no donor reused)`);

// ---------- 2. analysis unit tests ----------
console.log('2) Analysis unit tests');
const mkQ = (n, subject, correct) => ({
  n, subject, text: `Q${n}`, options: ['a', 'b', 'c', 'd'], correct, explanation: 'x', img: false,
});
// Synthetic 6-question paper. Correct answers: [0,1,2,3,0,1]
const paper6 = {
  paperId: 'synthetic',
  questions: [mkQ(1, 'Anatomy', 0), mkQ(2, 'Anatomy', 1), mkQ(3, 'Anatomy', 2), mkQ(4, 'Medicine', 3), mkQ(5, 'Medicine', 0), mkQ(6, 'Medicine', 1)],
};
const attempt6 = {
  paperId: 'synthetic',
  answers: { 0: 0, 1: 0, 2: 2, 3: 0, 5: 2 }, // q0 ✓, q1 ✗, q2 ✓, q3 ✗, q4 skipped, q5 ✗
  marked: {},
  confidence: { 0: 'sure', 1: 'guessed', 2: 'guessed', 5: 'unsure' },
  timeSec: { 0: 10, 1: 10, 2: 30, 3: 90, 4: 0, 5: 130 },
  visits: { 0: 1, 1: 1, 2: 2, 3: 2, 4: 1, 5: 2 },
  changes: [
    { q: 2, from: 0, to: 2 }, // wrong -> correct = gained
    { q: 3, from: 3, to: 0 }, // correct -> wrong = lost
    { q: 5, from: 0, to: 2 }, // wrong -> wrong
  ],
};
const r = analyseAttempt(paper6, attempt6);
ok(r.score === 2 && r.correct === 2, `score is 2 (got ${r.score})`);
ok(r.attempted === 5 && r.wrong === 3 && r.skipped === 1, `attempted 5 / wrong 3 / skipped 1 (got ${r.attempted}/${r.wrong}/${r.skipped})`);
ok(r.accuracy === 40, `accuracy 40% (got ${r.accuracy})`);
const b = Object.fromEntries(r.buckets.map((x) => [x.key, x]));
ok(b.lt15.count === 2 && b.lt15.correct === 1 && b.lt15.accuracy === 50, 'bucket <15s: 2 attempted, 1 correct, 50%');
ok(b['15to60'].count === 1 && b['15to60'].correct === 1, 'bucket 15–60s: 1 attempted, 1 correct');
ok(b['60to120'].count === 1 && b['60to120'].correct === 0, 'bucket 60–120s: 1 attempted, 0 correct');
ok(b.gt120.count === 1 && b.gt120.correct === 0, 'bucket >120s: 1 attempted, 0 correct');
ok(
  r.changeReport.total === 3 && r.changeReport.gained === 1 && r.changeReport.lost === 1 &&
    r.changeReport.wrongToWrong === 1 && r.changeReport.net === 0,
  `change report 3 total / +1 gained / 1 lost / 1 w→w / net 0 (got ${JSON.stringify(r.changeReport)})`
);
ok(r.skipDividend === 0.25, `skip dividend = skips × 0.25 = 0.25 (got ${r.skipDividend})`);
ok(r.guessReport.guessed.count === 2 && r.guessReport.marksFromGuesses === 1, 'guesses: 2 tagged, 1 mark from guesses');
ok(r.guessReport.sure.count === 1 && r.guessReport.sure.accuracy === 100, 'sure: 1 tagged, 100% accuracy');
ok(r.recklessness.rushedWrong === 1, `rushed wrong (<15s) = 1 (got ${r.recklessness.rushedWrong})`);
ok(r.recklessness.gapWrong === 2, `slow wrong (>=60s) = 2 (got ${r.recklessness.gapWrong})`);
const subjSum = r.subjects.reduce((s, x) => s + x.total, 0);
ok(subjSum === r.total, `subject roll-up sums to total (${subjSum} = ${r.total})`);
ok(
  r.rollups && r.rollups.prepara.total === 3 && r.rollups.clinical.total === 3 &&
    r.rollups.prepara.correct + r.rollups.clinical.correct === r.score,
  'Pre/Para vs Clinical roll-ups sum correctly (3 + 3 questions, score preserved)'
);
ok(r.verdict.full === false && r.verdict.passMark === 3 && r.verdict.passed === null,
  'partial paper: no PASS/NOT-YET verdict, pace mark = ceil(N/2) = 3');
ok(r.answerKey.length === 6 && r.answerKey[1].yourLetter === 'A' && r.answerKey[4].yourLetter === '—',
  'answer key letters and skip marker correct');

// Full-300 verdict behaviour
const paper300 = { paperId: 'synthetic300', questions: Array.from({ length: 300 }, (_, i) => mkQ(i + 1, 'Medicine', 0)) };
const attempt150 = { answers: {}, marked: {}, confidence: {}, timeSec: {}, visits: {}, changes: [] };
for (let i = 0; i < 150; i++) attempt150.answers[i] = 0; // exactly 150 correct, rest skipped
const r150 = analyseAttempt(paper300, attempt150);
ok(r150.verdict.full === true && r150.verdict.passed === true && r150.score === 150, 'full paper: 150/300 = PASS');
const attempt149 = { ...attempt150, answers: { ...attempt150.answers } };
delete attempt149.answers[0];
attempt149.answers[200] = 1; // one wrong instead -> 149
const r149 = analyseAttempt(paper300, attempt149);
ok(r149.score === 149 && r149.verdict.passed === false && r149.verdict.gapToPass === 1, 'full paper: 149/300 = NOT YET, gap 1');
ok(r149.skipped === 150 && r149.skipDividend === 150 * 0.25, `skip dividend at scale: 150 skips × 0.25 = 37.5 (got ${r149.skipDividend})`);

// Real-paper integration: dec-2021, answer everything correctly
const dec2021 = JSON.parse(readFileSync(join(processedDir, 'dec-2021.json'), 'utf8'));
const perfect = { answers: {}, marked: {}, confidence: {}, timeSec: {}, visits: {}, changes: [] };
dec2021.questions.forEach((q, i) => { perfect.answers[i] = q.correct; perfect.timeSec[i] = 45; });
const rp = analyseAttempt(dec2021, perfect);
ok(rp.score === 300 && rp.verdict.passed === true && rp.accuracy === 100, 'dec-2021 perfect attempt scores 300, PASS, 100%');
ok(rp.subjects.length === 19 && rp.subjects.reduce((s, x) => s + x.total, 0) === 300, 'dec-2021: 19 subjects summing to 300');
ok(rp.rollups.prepara.total + rp.rollups.clinical.total === 300, 'dec-2021: roll-ups sum to 300');

// 2026 paper (topped up): own questions untagged -> subject analysis still
// suppressed even though the completion questions are tagged; verdict is the
// full PASS path now that the paper is 300.
const jan2026 = JSON.parse(readFileSync(join(processedDir, 'jan-2026.json'), 'utf8'));
const a26 = { answers: { 0: jan2026.questions[0].correct }, marked: {}, confidence: {}, timeSec: { 0: 20 }, visits: {}, changes: [] };
const r26 = analyseAttempt(jan2026, a26);
ok(r26.hasSubjects === false && r26.rollups === null && r26.score === 1 && r26.total === 300,
  'jan-2026: subject analysis honestly absent after top-up, total 300');
ok(r26.verdict.full === true && r26.verdict.passMark === 150 && r26.verdict.passed === false,
  'jan-2026: full-paper PASS/NOT-YET verdict path applies (score 1 -> NOT YET)');
ok(r26.original.total === 286 && r26.original.correct === 1 && r26.original.addedCount === 14,
  `jan-2026: original-only subscore 1/286 with 14 added (got ${r26.original.correct}/${r26.original.total}, +${r26.original.addedCount})`);
const placeholders = jan2026.questions.filter((q) => q.text.startsWith('Image-based question'));
ok(placeholders.length === 3 && placeholders.every((q) => q.img === true),
  `jan-2026: 3 image-only questions carry placeholder stems + img flag (got ${placeholders.length})`);

// Topped book paper: jan-2024 (294 own + 6 added). Answer all own questions
// correctly and leave the added ones unanswered.
const jan2024 = JSON.parse(readFileSync(join(processedDir, 'jan-2024.json'), 'utf8'));
const ownOnly = { answers: {}, marked: {}, confidence: {}, timeSec: {}, visits: {}, changes: [] };
jan2024.questions.forEach((q, i) => { if (!q.added) ownOnly.answers[i] = q.correct; });
const rOwn = analyseAttempt(jan2024, ownOnly);
ok(rOwn.score === 294 && rOwn.verdict.full === true && rOwn.verdict.passed === true,
  `jan-2024 topped paper: own-perfect attempt scores 294 -> PASS (got ${rOwn.score})`);
ok(rOwn.original.total === 294 && rOwn.original.correct === 294 && rOwn.original.addedCount === 6,
  'jan-2024: original-only subscore 294/294, addedCount 6');
ok(rOwn.subjects.reduce((s, x) => s + x.total, 0) === 300 && rOwn.hasSubjects === true,
  'jan-2024: subject analysis includes the added questions (subjects sum to 300)');
// Added questions carry review provenance.
ok(rOwn.perQ.filter((x) => x.added).length === 6 && rOwn.perQ.every((x) => !x.added || x.fromLabel === 'June 2024'),
  'jan-2024: per-question review rows flag the 6 added questions with their source paper');

// ---------- 3. static export ----------
console.log('3) Static export');
const out = join(root, 'out');
ok(existsSync(join(out, 'index.html')), 'out/index.html exists (home)');
ok(existsSync(join(out, 'about', 'index.html')), 'out/about exists');
ok(existsSync(join(out, 'start', 'index.html')), 'out/start exists (entry gate)');
ok(existsSync(join(out, 'papers', 'index.html')), 'out/papers exists (gated library)');
for (const id of Object.keys(EXPECTED)) {
  ok(existsSync(join(out, 'paper', id, 'index.html')), `out/paper/${id} exists`);
  ok(existsSync(join(out, 'paper', id, 'test', 'index.html')), `out/paper/${id}/test exists`);
  ok(existsSync(join(out, 'paper', id, 'analysis', 'index.html')), `out/paper/${id}/analysis exists`);
}
// Each paper's questions must ship in some JS chunk under out/_next
const chunksDir = join(out, '_next', 'static', 'chunks');
const chunkText = readdirSync(chunksDir, { recursive: true })
  .filter((f) => String(f).endsWith('.js'))
  .map((f) => { try { return readFileSync(join(chunksDir, f), 'utf8'); } catch { return ''; } })
  .join('\n');
ok(chunkText.length > 100000, `export chunks readable (${Math.round(chunkText.length / 1024)} KB of JS)`);
for (const id of Object.keys(EXPECTED)) {
  const raw = JSON.parse(readFileSync(join(rawDir, `${id}.json`), 'utf8'));
  // find a distinctive plain-ASCII run from an early question stem
  let probe = '';
  for (const q of raw.questions.slice(0, 12)) {
    const runs = q.text.match(/[A-Za-z][A-Za-z ]{24,}/g) || [];
    if (runs.length) { probe = runs[0].slice(0, 30).trim(); break; }
  }
  ok(probe && chunkText.includes(probe), `${id}: question chunk present in export (probe: "${probe.slice(0, 32)}…")`);
}

// ---------- 4. question images (extracted from the source book) ----------
console.log('4) Question images');
const imageMap = JSON.parse(readFileSync(join(root, 'src', 'data', 'image-map.json'), 'utf8'));
let mapQuestions = 0;
let badFiles = 0;
let imgConflicts = 0;
let procWithImages = 0;
const fileOk = (src) => {
  const fp = join(out, src.replace(/^\//, ''));
  return existsSync(fp) && readFileSync(fp).length >= 3072;
};
for (const id of BOOK) {
  mapQuestions += Object.keys(imageMap[id] || {}).length;
  const processed = JSON.parse(readFileSync(join(processedDir, `${id}.json`), 'utf8'));
  for (const q of processed.questions) {
    if (q.images && q.images.length > 0) {
      procWithImages += 1;
      if (q.img) imgConflicts += 1;
      for (const src of q.images) if (!fileOk(src)) badFiles += 1;
    }
  }
  const m = meta.find((x) => x.paperId === id);
  ok(
    m.imgMatched + m.imgUnmatched === m.imgCount,
    `${id}: meta image counts consistent (${m.imgMatched} matched + ${m.imgUnmatched} unmatched = ${m.imgCount} flagged)`
  );
}
ok(imgConflicts === 0, 'no question carries both recovered images and the unavailable flag');
ok(badFiles === 0, `every question image file is present in out/ at >= 3 KB (${badFiles} bad)`);
ok(
  procWithImages === mapQuestions,
  `processed questions with images (${procWithImages}) equals the image-map total (${mapQuestions})`
);
// jul-2025 Q107: dropped in v1 because its options are images; restored with
// the four option images extracted from the book (biohazard = A, correct 0).
const jul2025 = JSON.parse(readFileSync(join(processedDir, 'jul-2025.json'), 'utf8'));
const q107 = jul2025.questions.find((q) => q.n === 107);
ok(
  !!q107 && !q107.added && Array.isArray(q107.optionImages) && q107.optionImages.length === 4 && q107.correct === 0,
  'jul-2025 Q107 restored as an own question with 4 image options (correct = A)'
);
ok(
  !!q107 && q107.optionImages.every((src) => fileOk(src)),
  'jul-2025 Q107: all four option image files present in out/ at >= 3 KB'
);

// ---------- 5. redesign: solutions explorer + answer-key data path ----------
// The analysis page's solution sheet and the printed "Answer Key & Solutions"
// are both rendered from (processed paper questions x analyseAttempt perQ
// rows). These checks pin that data contract: for a scripted attempt with a
// known wrong answer, a mark, a guess tag and an answer change, the perQ row
// plus the question record must yield the full solution payload (correct
// option + detailed explanation + attempt facts).
console.log('5) Solutions explorer / answer-key data path');
{
  const jan2024p = JSON.parse(readFileSync(join(processedDir, 'jan-2024.json'), 'utf8'));
  const wrongIdx = 0;
  const wrongOpt = (jan2024p.questions[wrongIdx].correct + 1) % 4;
  const scripted = {
    answers: {
      0: wrongOpt, // Q1 wrong
      1: jan2024p.questions[1].correct, // Q2 correct
      4: (jan2024p.questions[4].correct + 2) % 4, // Q5 wrong, tagged guessed
    },
    marked: { 2: true }, // Q3 marked for review, skipped
    confidence: { 4: 'guessed', 1: 'sure' },
    timeSec: { 0: 75, 1: 30, 2: 12, 4: 8 },
    visits: { 0: 2, 1: 1, 2: 1, 4: 1 },
    changes: [{ q: 1, from: (jan2024p.questions[1].correct + 1) % 4, to: jan2024p.questions[1].correct }], // wrong -> correct on Q2
  };
  const rs = analyseAttempt(jan2024p, scripted);
  const rowWrong = rs.perQ[wrongIdx];
  const solQ = jan2024p.questions[rowWrong.idx];
  ok(rowWrong.status === 'wrong' && rowWrong.yours === wrongOpt && rowWrong.correct === solQ.correct,
    'solution payload: scripted wrong answer row carries status/yours/correct');
  ok(typeof solQ.explanation === 'string' && solQ.explanation.trim().length > 100 &&
    Array.isArray(solQ.options) && solQ.options[solQ.correct].trim().length > 0,
    'solution payload: wrong question has its detailed book explanation and correct option text');
  ok(rs.answerKey[wrongIdx].correctLetter === LETTERS[solQ.correct],
    'answer key: correct letter matches the solution payload for the wrong question');
  ok(rs.perQ[2].marked === true && rs.perQ[2].status === 'skipped',
    'explorer data: marked flag reaches perQ (Q3 marked + skipped)');
  ok(rs.perQ[1].change && rs.perQ[1].change.effect === 'gained' && rs.perQ[1].change.count === 1,
    'explorer data: answer-change effect computed per question (Q2 change gained a mark)');
  ok(rs.perQ[4].confidence === 'guessed' && rs.perQ[4].status === 'wrong',
    'explorer data: guessed filter row (Q5 guessed + wrong)');
  const imgRow = rs.perQ.find((x) => x.hasImages);
  ok(!!imgRow && jan2024p.questions[imgRow.idx].images.length > 0,
    'explorer data: with-image filter finds questions carrying recovered figures');
  // 2026 solutions honesty: explanation stays empty in data (UI prints the
  // "not available in the recall source" line, never a fabricated text).
  const jan26p = JSON.parse(readFileSync(join(processedDir, 'jan-2026.json'), 'utf8'));
  const own26 = jan26p.questions.filter((q) => !q.added);
  ok(own26.every((q) => !q.explanation || !q.explanation.trim()),
    'jan-2026: own questions carry no explanation text (honest gap, not fabricated)');
  // Source-level UI contract: the instructions gate and the detailed print
  // key exist in the shipped components (static site — no runtime to probe).
  const runnerSrc = readFileSync(join(root, 'src', 'components', 'Runner.tsx'), 'utf8');
  ok(runnerSrc.includes('I have read and understood the instructions') && runnerSrc.includes('I am ready to begin'),
    'runner: TCS-style instructions gate (declaration + ready-to-begin) present');
  ok(runnerSrc.includes('Marks for correct answer') && runnerSrc.includes('Question No.'),
    'runner: TCS marks strip + "Question No." header present');
  const printSrc = readFileSync(join(root, 'src', 'components', 'PrintViews.tsx'), 'utf8');
  ok(printSrc.includes('Answer Key & Solutions') && printSrc.includes('explanationParagraphs'),
    'print: detailed Answer Key & Solutions renders full explanations');
  const analysisSrc = readFileSync(join(root, 'src', 'components', 'AnalysisView.tsx'), 'utf8');
  ok(analysisSrc.includes('SolutionSheet') && analysisSrc.includes('With image'),
    'analysis: solutions explorer with sheet + image filter present');
}

// ---------- 6. branding: lockup, Naitik Library page, phone removal ----------
console.log('6) Branding');
{
  // Assembled in parts so the removed number itself never appears in the repo.
  const REMOVED_NUMBER = '9654' + '042372';
  const countOccurrences = (dir) => {
    let count = 0;
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, entry.name);
        if (entry.isDirectory()) walk(p);
        else {
          const text = readFileSync(p).toString('latin1');
          count += text.split(REMOVED_NUMBER).length - 1;
        }
      }
    };
    walk(dir);
    return count;
  };
  ok(countOccurrences(join(root, 'src')) === 0, 'removed phone number appears 0 times in src/');
  ok(countOccurrences(out) === 0, 'removed phone number appears 0 times in the built site (out/)');

  const homeHtml = readFileSync(join(out, 'index.html'), 'utf8');
  ok(homeHtml.includes('8920922167'), 'home page shows the single contact number 8920922167');
  ok(homeHtml.includes('naitikdev@fam'), 'home page shows the UPI ID naitikdev@fam');
  ok(homeHtml.includes('betterment'),
    'home page carries the "betterment" donate appeal');
  ok(homeHtml.includes('data-brand-lockup') && homeHtml.includes('by Naitik Library'),
    'home page renders the brand lockup (MedSetu big + "by Naitik Library" small) in header/footer');

  const libPath = join(out, 'naitik-library', 'index.html');
  ok(existsSync(libPath), 'out/naitik-library exists (standalone Naitik Library page)');
  if (existsSync(libPath)) {
    const libHtml = readFileSync(libPath, 'utf8');
    for (const fact of ['study hall', 'medical students', 'Gautam Nagar', 'Naitik Gaur', '8920922167', 'naitikdev@fam']) {
      ok(libHtml.includes(fact), `naitik-library page states: "${fact}"`);
    }
    ok(libHtml.includes('data-brand-lockup'), 'naitik-library page renders the brand lockup');
  }
  ok(chunkText.includes('by Naitik Library'),
    'built JS chunks carry the lockup line (print headers + exam-window subline)');
}

// ---------- 7. gated entry flow (Let's Start -> name + human check -> library) ----------
console.log('7) Gated entry flow');
{
  // Gate logic, unit-tested on the pure validator.
  const cMin = makeChallenge(() => 0);
  ok(cMin.a === 2 && cMin.b === 3 && cMin.answer === 5, 'gate: challenge floor (rng 0 -> 2 + 3 = 5)');
  const cMax = makeChallenge(() => 0.999999);
  ok(cMax.a === 9 && cMax.b === 12 && cMax.answer === 21, 'gate: challenge ceiling (rng ~1 -> 9 + 12 = 21)');
  const ch = { a: 4, b: 7, answer: 11 };
  const vEmpty = validateGate({ name: '  ', robotChecked: false, answer: '11', challenge: ch });
  ok(!vEmpty.ok && !!vEmpty.errors.name && !!vEmpty.errors.robot, 'gate: blank name blocked (and unchecked robot flagged)');
  const vRobot = validateGate({ name: 'Aisha', robotChecked: false, answer: '11', challenge: ch });
  ok(!vRobot.ok && !!vRobot.errors.robot && !vRobot.errors.sum, 'gate: unchecked "I\'m not a robot" blocked even with the right sum');
  const vWrong = validateGate({ name: 'Aisha', robotChecked: true, answer: '10', challenge: ch });
  ok(!vWrong.ok && !!vWrong.errors.sum, 'gate: wrong sum blocked');
  const vNone = validateGate({ name: 'Aisha', robotChecked: true, answer: '11', challenge: null });
  ok(!vNone.ok && !!vNone.errors.sum, 'gate: no challenge yet -> blocked (never passes pre-generation)');
  const vOk = validateGate({ name: 'Aisha', robotChecked: true, answer: ' 11 ', challenge: ch });
  ok(vOk.ok && Object.keys(vOk.errors).length === 0, 'gate: name + ticked + correct sum passes');

  // The landing is descriptions/about ONLY: no paper links, no form inputs.
  const homeHtml = readFileSync(join(out, 'index.html'), 'utf8');
  ok(!homeHtml.includes('/paper/'), 'landing: no links to any paper (the library is behind the gate)');
  ok(!homeHtml.includes('<input'), 'landing: no input fields (no name field on the home page)');
  ok(homeHtml.includes('href="/start/"'), 'landing: primary CTA points at /start (Let\'s Start)');

  // The gate page ships its form in the client bundle (rendered after mount).
  ok(chunkText.includes("I'm not a robot"), 'gate: "I\'m not a robot" checkbox ships in the bundle');
  ok(chunkText.includes('gate-name') && chunkText.includes('gate-sum'), 'gate: name + sum fields ship in the bundle');
  ok(chunkText.includes('Continue as'), 'gate: returning students get the "Continue as" path');

  // Guards: attempting sits behind the client-side name gate. V4 change
  // (founder's SEO brief): the static HTML of /papers now LISTS the 12
  // paper pages so crawlers can find them — the attempt flow itself is
  // still gated (RequireName on every paper page + LibraryGate below).
  const papersHtml = readFileSync(join(out, 'papers', 'index.html'), 'utf8');
  ok(papersHtml.includes('/paper/dec-2020/') && papersHtml.includes('/paper/jun-2026/'),
    'papers: static HTML lists all 12 paper pages for crawlers (V4 SEO); attempting stays gated');
  const requireSrc = readFileSync(join(root, 'src', 'components', 'RequireName.tsx'), 'utf8');
  ok(requireSrc.includes('/start/') && requireSrc.includes('router.replace'),
    'guard: RequireName redirects to /start when no name is stored');
  const libraryGateSrc = readFileSync(join(root, 'src', 'app', 'papers', 'LibraryGate.tsx'), 'utf8');
  ok(libraryGateSrc.includes('PAPERS_META') && libraryGateSrc.includes('RequireName') && libraryGateSrc.includes('PaperCard'),
    'papers: the full 12-paper library renders inside the name gate');
  const paperPageSrc = readFileSync(join(root, 'src', 'app', 'paper', '[id]', 'page.tsx'), 'utf8');
  ok(paperPageSrc.includes('RequireName') && paperPageSrc.includes('href="/papers/"'),
    'paper page: guarded by RequireName, back link goes to /papers');
  const startPanelSrc = readFileSync(join(root, 'src', 'app', 'paper', '[id]', 'StartPanel.tsx'), 'utf8');
  ok(startPanelSrc.includes('Attempt Test') && !startPanelSrc.includes('<input'),
    'paper page: "Attempt Test" button, no name input (name comes from the gate)');
}

// ---------- 8. security headers (Netlify _headers shipped in the export) ----------
console.log('8) Security headers');
{
  const headersPath = join(out, '_headers');
  ok(existsSync(headersPath), 'out/_headers exists (Netlify security headers ship with the export)');
  const headers = existsSync(headersPath) ? readFileSync(headersPath, 'utf8') : '';
  ok(headers.includes("default-src 'self'"), 'headers: CSP default-src \'self\'');
  ok(headers.includes("frame-ancestors 'none'"), 'headers: CSP frame-ancestors \'none\' (clickjacking)');
  ok(headers.includes("script-src 'self'"), 'headers: CSP script-src restricted to self');
  ok(headers.includes('X-Content-Type-Options: nosniff'), 'headers: X-Content-Type-Options nosniff');
  ok(headers.includes('X-Frame-Options: DENY'), 'headers: X-Frame-Options DENY');
  ok(headers.includes('Referrer-Policy: strict-origin-when-cross-origin'), 'headers: Referrer-Policy set');
  ok(headers.includes('Permissions-Policy: camera=(), microphone=(), geolocation=()'), 'headers: Permissions-Policy locks sensors');
}

// ---------- 9. V2: subject-wise tests ----------
console.log('9) Subject-wise tests (V2)');
{
  const subjectsMeta = JSON.parse(readFileSync(join(root, 'src', 'lib', 'subjects-meta.json'), 'utf8'));
  const transformReport = JSON.parse(readFileSync(join(root, 'subject-tests-report.json'), 'utf8'));
  const vendored = JSON.parse(
    readFileSync(join(root, 'src', 'data', 'subjects-src', 'source.json'), 'utf8')
  );

  // Census: 16 subjects, 30 tests, 1,059 questions; counts + durations exact.
  const EXPECTED = {
    anatomy: [30, 30], physiology: [30, 30], biochemistry: [30, 30], pathology: [30, 30],
    microbiology: [30, 30], pharmacology: [30, 30], 'forensic-medicine': [30, 30],
    medicine: [50, 50], surgery: [50, 50], 'obstetrics-gynaecology': [50, 50],
    'community-medicine': [50, 50], paediatrics: [20, 30], ophthalmology: [30, 30],
    ent: [30, 30], orthopaedics: [19, null], 'minor-subjects': [null, 50],
  };
  const DURATION = { 50: 60, 30: 40, 20: 30, 19: 29 };
  ok(subjectsMeta.length === 16, `subjects: 16 subjects in meta (got ${subjectsMeta.length})`);
  const totalTests = subjectsMeta.reduce((n, s) => n + s.tests.length, 0);
  const totalQs = subjectsMeta.reduce((n, s) => n + s.tests.reduce((m, t) => m + t.total, 0), 0);
  ok(totalTests === 30 && totalQs === 1059, `subjects: 30 tests / 1059 questions (got ${totalTests}/${totalQs})`);
  for (const s of subjectsMeta) {
    const exp = EXPECTED[s.slug];
    ok(!!exp, `subjects: ${s.slug} is a census subject`);
    if (!exp) continue;
    for (const t of s.tests) {
      ok(t.total === exp[t.testNo - 1], `subjects: ${s.slug} test ${t.testNo} count == census ${exp[t.testNo - 1]} (got ${t.total})`);
      ok(t.durationMin === DURATION[t.total], `subjects: ${s.slug} test ${t.testNo} duration ${DURATION[t.total]} min from source (got ${t.durationMin})`);
    }
    const present = s.tests.map((t) => t.testNo);
    ok(
      (exp[0] === null) === !present.includes(1) && (exp[1] === null) === !present.includes(2),
      `subjects: ${s.slug} ships exactly the tests that exist (${present.join(',')})`
    );
  }

  // Shipped-data audit at build-data level (independent re-check of the
  // transform's own gates, recomputed here from the vendored source):
  // per subject, the shipped stem multiset == the source stem multiset;
  // each test's cross-year stem count == the recorded swap; every shipped
  // correct option text is a genuine source correct text for its stem;
  // every explanation is present and its lead names the shipped key.
  {
    const vendBySlug = new Map(vendored.subjects.map((s) => [s.slug, s]));
    const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);
    for (const s of subjectsMeta) {
      const vend = vendBySlug.get(s.slug);
      const converted = {}; // year -> converted questions
      const srcUnion = new Map(); // stem -> Set(correct texts)
      const srcStems = new Map();
      for (const year of ['2023', '2024']) {
        if (!vend.tests[year]) continue;
        converted[year] = vend.tests[year].questions.map((q, i) => {
          const c = convertQuestion(q, `audit ${s.slug}/${year}#${i}`);
          const stem = subjNormStem(c.stem);
          bump(srcStems, stem);
          if (!srcUnion.has(stem)) srcUnion.set(stem, new Set());
          srcUnion.get(stem).add(c.options[c.correct]);
          return { ...c, stem };
        });
      }
      const shippedStems = new Map();
      for (const t of s.tests) {
        const data = JSON.parse(
          readFileSync(join(root, 'src', 'data', 'subjects', `${t.testId}.json`), 'utf8')
        );
        ok(data.questions.length === t.total && data.durationMin === t.durationMin,
          `audit: ${t.testId} ships ${t.total} questions with its source duration`);
        const ownYear = t.testNo === 1 ? '2023' : '2024';
        const ownStems = new Set((converted[ownYear] || []).map((c) => c.stem));
        let foreign = 0, badKey = 0, badExpl = 0, badLead = 0;
        for (const q of data.questions) {
          const stem = subjNormStem(q.text);
          bump(shippedStems, stem);
          if (!ownStems.has(stem)) foreign += 1;
          if (!(srcUnion.has(stem) && srcUnion.get(stem).has(q.options[q.correct]))) badKey += 1;
          if (!(typeof q.explanation === 'string' && q.explanation.trim().length > 0)) badExpl += 1;
          else if (!q.explanation.startsWith(`Correct answer: ${'ABCD'[q.correct]}. ${q.options[q.correct]}`)) badLead += 1;
        }
        ok(foreign === t.swappedIn, `audit: ${t.testId} cross-year stems == swap count ${t.swappedIn} (got ${foreign})`);
        ok(badKey === 0 && badExpl === 0 && badLead === 0,
          `audit: ${t.testId} all keys/explanations/leads verified against source (bad: key ${badKey}, explanation ${badExpl}, lead ${badLead})`);
      }
      let multisetOk = srcStems.size === shippedStems.size;
      if (multisetOk) {
        for (const [stem, n] of srcStems) if (shippedStems.get(stem) !== n) { multisetOk = false; break; }
      }
      ok(multisetOk, `audit: ${s.slug} shipped stem multiset == source stem multiset (nothing added, nothing lost)`);
    }
    ok(transformReport.totals.optionsPermuted + transformReport.totals.optionsKept === 1059,
      'transform: every question either permuted (letter-safe) or kept in source order');
    ok(transformReport.totals.leadExact === 1059 && transformReport.totals.leadNotExact === 0,
      'transform: all 1059 explanations have the exact rewritable lead');
  }

  // Other series must not exist anywhere in the shipped app or its data.
  const scanFor = (dir, needle) => {
    let hits = 0;
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, entry.name);
        if (entry.isDirectory()) walk(p);
        else if (readFileSync(p).toString('latin1').includes(needle)) hits += 1;
      }
    };
    walk(dir);
    return hits;
  };
  ok(scanFor(out, 'Mini Test') === 0, 'subjects: the other series ("Mini Test") appears nowhere in out/');
  ok(scanFor(join(root, 'src', 'data'), 'Mini Test') === 0, 'subjects: the other series appears nowhere in src/data');

  // Routes exist in the export; guarded pages ship no content in static HTML.
  for (const p of [
    'choose/index.html', 'subjects/index.html', 'subject/anatomy/index.html',
    'subject/anatomy/test-1/test/index.html', 'subject/anatomy/test-1/analysis/index.html',
    'subject/orthopaedics/test-1/test/index.html', 'subject/minor-subjects/test-2/test/index.html',
  ]) {
    ok(existsSync(join(out, p)), `export: out/${p} exists`);
  }
  ok(!existsSync(join(out, 'subject/orthopaedics/test-2')), 'export: orthopaedics has no test-2 (single-year subject)');
  ok(!existsSync(join(out, 'subject/minor-subjects/test-1')), 'export: minor-subjects has no test-1 (single-year subject)');
  const subjectsHtml = readFileSync(join(out, 'subjects', 'index.html'), 'utf8');
  ok(subjectsHtml.includes('Anatomy') && subjectsHtml.includes('Community Medicine'),
    'subjects: static HTML lists the subjects for crawlers (V4 SEO); attempting stays gated');
  const chooseHtml = readFileSync(join(out, 'choose', 'index.html'), 'utf8');
  ok(!chooseHtml.includes('What will you practise'), 'choose: static HTML contains no choice cards (renders only after the gate)');
  // Years are never shown: no year strings anywhere under the subject routes.
  let yearHits = 0;
  const walkYears = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walkYears(p);
      else {
        const text = readFileSync(p).toString('latin1');
        if (text.includes('2023') || text.includes('2024')) yearHits += 1;
      }
    }
  };
  walkYears(join(out, 'subject'));
  ok(yearHits === 0, 'subjects: no "2023"/"2024" strings in any built subject page');
  ok(!subjectsHtml.includes('2023') && !subjectsHtml.includes('2024') && !chooseHtml.includes('2023') && !chooseHtml.includes('2024'),
    'subjects: no year strings in /subjects or /choose HTML');

  // Images recovered as local files (V2 image job, user order 2026-11-13):
  // references, wiring and payload are exact; the last blocked figure
  // (ENT FC0206, researchgate 403) was recovered 2026-11-13 from the same
  // paper's open-access PMC copy (PMC6177196 Fig 1, CC-BY), so no question
  // keeps the honest note any more; no remote publisher reference survives
  // anywhere in the shipped app.
  {
    const T = transformReport.totals;
    ok(T.qImgRefs === 350 && T.eImgRefs === 828,
      `images: source reference census 350 question + 828 explanation (got ${T.qImgRefs}/${T.eImgRefs})`);
    ok(T.qImgWired === 350 && T.eImgWired === 828,
      `images: 350/350 question + 828/828 explanation references wired (got ${T.qImgWired}/${T.eImgWired})`);
    ok(T.imgMatchedQuestions === 350 && T.explImgMatchedQuestions === 464 && T.explImgUnmatchedQuestions === 0,
      'images: 350 questions ship their figure; all 464 explanation-image questions ship every image');
    ok(T.simgFiles === 1107 && T.simgBytes === 224417822,
      `images: payload 1107 files / 214.0 MB (got ${T.simgFiles} files / ${T.simgBytes} bytes)`);
    let badPath = 0, absent = 0, qWired = 0, eWired = 0, eMissing = 0, explBlockQs = 0, qFlagged = 0;
    for (const s of subjectsMeta) {
      for (const t of s.tests) {
        const data = JSON.parse(readFileSync(join(root, 'src', 'data', 'subjects', `${t.testId}.json`), 'utf8'));
        for (const q of data.questions) {
          if (q.img) qFlagged += 1;
          for (const src of q.images || []) {
            qWired += 1;
            if (!src.startsWith('/simg/')) badPath += 1;
            else if (!existsSync(join(root, 'public', 'simg', src.slice('/simg/'.length)))) absent += 1;
          }
          if (q.explBlocks) {
            explBlockQs += 1;
            for (const b of q.explBlocks) {
              if (b.t === 'img') {
                eWired += 1;
                if (!b.src.startsWith('/simg/')) badPath += 1;
                else if (!existsSync(join(root, 'public', 'simg', b.src.slice('/simg/'.length)))) absent += 1;
              } else if (b.t === 'imgMissing') eMissing += b.count;
            }
          }
        }
      }
    }
    ok(qWired === 350 && eWired === 828 && eMissing === 0,
      `images: shipped data wires 350 question + 828 explanation figures, 0 missing blocks (got ${qWired}/${eWired}/${eMissing})`);
    ok(explBlockQs === 464, `images: all 464 explanation-image questions carry ordered explBlocks (got ${explBlockQs})`);
    ok(qFlagged === 0, `images: no question keeps the honest image note (got ${qFlagged})`);
    ok(badPath === 0 && absent === 0, 'images: every wired figure is a local /simg/ path whose file exists in public/simg');
    const sumMeta = (k) => subjectsMeta.reduce((n, s) => n + s.tests.reduce((m, t) => m + (t[k] || 0), 0), 0);
    ok(sumMeta('imgCount') === 350 && sumMeta('imgMatched') === 350 && sumMeta('explImgCount') === 464 &&
       sumMeta('explImgMatched') === 464 && sumMeta('explImgUnmatched') === 0,
      'images: subjects meta counts agree (350 referenced / 350 recovered / 464 explanations fully recovered)');
    const sniffOk = (buf) =>
      (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) ||
      (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) ||
      (buf.length >= 6 && buf.toString('latin1', 0, 4) === 'GIF8') ||
      (buf.length >= 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP');
    const pubFiles = readdirSync(join(root, 'public', 'simg'));
    let badMagic = 0;
    for (const f of pubFiles) {
      if (!sniffOk(readFileSync(join(root, 'public', 'simg', f)))) badMagic += 1;
    }
    ok(pubFiles.length === 1107 && badMagic === 0,
      `images: public/simg ships 1107 files, all valid images by magic bytes (bad ${badMagic})`);
    ok(existsSync(join(out, 'simg')) && readdirSync(join(out, 'simg')).length === 1107,
      'images: out/simg ships the same 1107 files');
    for (const host of ['dailyrounds.org', 'cloudfront.net', 'researchgate.net']) {
      ok(scanFor(out, host) === 0, `images: no ${host} reference anywhere in out/`);
      ok(scanFor(join(root, 'src', 'data', 'subjects'), host) === 0, `images: no ${host} reference in shipped subject data`);
    }
  }

  // Flow wiring at source level.
  const gateSrc = readFileSync(join(root, 'src', 'app', 'start', 'GateCard.tsx'), 'utf8');
  ok(gateSrc.includes("return '/choose/'"), 'flow: gate default destination is the choice screen (/choose)');
  const runnerSrc2 = readFileSync(join(root, 'src', 'components', 'Runner.tsx'), 'utf8');
  ok(runnerSrc2.includes('desc.singlePart') && runnerSrc2.includes('Submitting ends this subject test'),
    'runner: single-part mode present (no Part II for subject tests)');
  const analysisSrc2 = readFileSync(join(root, 'src', 'components', 'AnalysisView.tsx'), 'utf8');
  ok(analysisSrc2.includes('BELOW THE 50% MARK') && analysisSrc2.includes('Halves & pace') && analysisSrc2.includes('Answer changes') && analysisSrc2.includes('Confidence'),
    'analysis: subject benchmark + pace + changes + confidence sections present');
  ok(chunkText.includes('Subject-wise Tests') && chunkText.includes('BELOW THE 50% MARK'),
    'chunks: nav + subject analysis ship in the bundle');
  const homeHtml2 = readFileSync(join(out, 'index.html'), 'utf8');
  ok(homeHtml2.includes('Subject-wise tests') && !homeHtml2.includes('/subject/'),
    'landing: subject-wise tests described, with no subject links (descriptions only)');
  ok(homeHtml2.includes('MedSetu v6'), 'footer: "MedSetu v6" small print ships');

  // Analysis engine: the new detailed fields, unit-tested on synthetic data.
  const synthQ = (subject) => ({ subject, text: 'q', options: ['a', 'b', 'c', 'd'], correct: 0, explanation: '', img: false });
  const synthPaper = { durationMin: 10, questions: Array.from({ length: 6 }, () => synthQ('Anatomy')) };
  const synthAttempt = {
    answers: { 0: 0, 1: 1, 2: 0 },
    marked: {}, confidence: { 0: 'guessed', 1: 'sure' },
    timeSec: { 0: 5, 1: 70, 2: 12 }, visits: { 0: 1, 1: 1, 2: 1 },
    changes: [{ q: 2, from: 1, to: 0 }],
  };
  const sr = analyseAttempt(synthPaper, synthAttempt);
  ok(sr.timeDetail.availableSec === 600, `engine: subject test available time = its own duration (600s, got ${sr.timeDetail.availableSec})`);
  ok(sr.timeDetail.avgOnCorrect === 8.5 && sr.timeDetail.avgOnWrong === 70,
    `engine: avg time on correct (8.5s) vs wrong (70s) (got ${sr.timeDetail.avgOnCorrect}/${sr.timeDetail.avgOnWrong})`);
  ok(sr.rushed.count === 1 && sr.rushed.correct === 1 && sr.rushed.accuracy === 100,
    'engine: rushed (<10s) answers counted with their score (1 attempted, 1 correct)');
  ok(sr.segments[0].attempted === 3 && sr.segments[0].correct === 2 && sr.segments[1].skipped === 3,
    'engine: subject test segments split at the halfway question');
  ok(sr.paceBlocks.length === 3 && sr.paceBlocks[0].label === 'Q1–2',
    `engine: small tests pace in blocks of 2 (got ${sr.paceBlocks.length} blocks)`);
  ok(sr.changeReport.gained === 1 && sr.changeReport.net === 1,
    'engine: a wrong→correct change nets +1 in the detailed report');
  const bigPaper = { questions: Array.from({ length: 300 }, () => synthQ('Anatomy')) };
  const br = analyseAttempt(bigPaper, { answers: {}, marked: {}, confidence: {}, timeSec: {}, visits: {}, changes: [] });
  ok(br.timeDetail.availableSec === 300 * 60 && br.segments[0].to === 150 && br.paceBlocks.length === 6,
    'engine: papers keep 300-minute availability, the 150 split and 50-question pace blocks');
}


// ---------- 10. V3: question bank ----------
console.log('10) Question bank (V3)');
{
  const qmeta = JSON.parse(readFileSync(join(root, 'src', 'lib', 'qbank-meta.json'), 'utf8'));
  const qreport = JSON.parse(readFileSync(join(root, 'qbank-report.json'), 'utf8'));
  ok(qreport.stats.raw === 30216 && qreport.stats.shipped === qmeta.total,
    `qbank: census raw 30,216 records -> ${qmeta.total} shipped (report == meta)`);
  ok(qreport.stats.shapeDropped === 0 && qreport.stats.caMismatch === 0,
    'qbank: zero shape drops and zero correct_answer mismatches in the pipeline');
  ok(qreport.stats.conflicts === 60,
    `qbank: 60 answer-conflict keys excluded, none guessed at (got ${qreport.stats.conflicts})`);
  ok(qmeta.subjects.length === 19, 'qbank: bank spans exactly the 19 FMGE subjects');
  ok(qmeta.subjects.reduce((a, s2) => a + s2.total, 0) === qmeta.total,
    'qbank: per-subject totals sum to the bank total');
  ok(qmeta.subjects.every((s2) => s2.topics.reduce((a, t) => a + t.count, 0) === s2.total),
    'qbank: per-topic counts sum to each subject total');
  ok(qmeta.images.referenced === qreport.imgStats.referenced && qmeta.images.covered === qreport.imgStats.covered,
    'qbank: meta image counts match the pipeline report');

  // Every chunk: shape, identity, locality of images.
  const seenIds = new Set();
  let badShape = 0, dupIds = 0, remoteImg = 0, emptyTopics = 0, noExpl = 0, totalQ = 0;
  let missingImgShipped = 0, placeholderOptions = 0;
  const hostRe = /dailyrounds|cloudfront|corebtr\.com|researchgate|amazonaws/;
  for (const s2 of qmeta.subjects) {
    const chunk = JSON.parse(readFileSync(join(root, 'src', 'data', 'qbank', `${s2.slug}.json`), 'utf8'));
    ok(chunk.questions.length === s2.total, `qbank: chunk ${s2.slug} holds ${s2.total} questions`);
    for (const q of chunk.questions) {
      totalQ += 1;
      if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o) => !o || !o.trim())
        || !Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3
        || !q.text || !q.text.trim() || q.subject !== s2.name) badShape += 1;
      if (!q.bankId || seenIds.has(q.bankId)) dupIds += 1;
      seenIds.add(q.bankId);
      if (!q.topic || !q.topic.trim()) emptyTopics += 1;
      if (!q.explanation || !q.explanation.trim()) noExpl += 1;
      const imgFields = JSON.stringify([q.images || [], q.explBlocks || [], q.explImg || false]);
      if (hostRe.test(imgFields) || /"https?:/.test(imgFields)) remoteImg += 1;
      if ((q.images || []).some((src) => !src.startsWith('/bimg/'))) remoteImg += 1;
      // 2026-11-19 exclusion: no question whose essential image is missing
      // may ship (the one hand-verified keeper is the sole exception).
      if (q.img === true && q.bankId !== 'qb-7ce3ee9ce5') missingImgShipped += 1;
      if (q.options.some((o) => o.includes('[Option image'))) placeholderOptions += 1;
    }
  }
  ok(totalQ === qmeta.total, `qbank: chunks together hold the full bank (${totalQ})`);
  ok(badShape === 0, `qbank: every question has 4 non-empty options, a valid answer, a stem and its chunk subject (bad ${badShape})`);
  ok(dupIds === 0, `qbank: bank ids are present and globally unique (violations ${dupIds})`);
  ok(emptyTopics === 0, 'qbank: every question carries a topic');
  ok(remoteImg === 0, `qbank: no remote image hosts anywhere in shipped bank data (violations ${remoteImg})`);
  ok(noExpl <= 40, `qbank: explanations present for all but ${noExpl} questions (source gaps, honestly shown)`);
  ok(missingImgShipped === 0, `qbank: no missing-stem-image questions ship (2026-11-19 exclusion; violations ${missingImgShipped})`);
  ok(placeholderOptions === 0, `qbank: no placeholder option images ship (violations ${placeholderOptions})`);
  ok(qreport.imgStats.excludedMissingImg === 1673, `qbank: missing-image exclusion count is 1,673 (got ${qreport.imgStats.excludedMissingImg})`);

  // Images on disk: count + magic bytes.
  const imgMap = JSON.parse(readFileSync(join(root, 'src', 'data', 'qbank-src', 'image-map.json'), 'utf8'));
  const okFiles = new Set(Object.values(imgMap).filter((v) => v.ok).map((v) => v.file));
  const pubBimg = readdirSync(join(root, 'public', 'bimg'));
  ok(pubBimg.length === okFiles.size, `qbank: public/bimg ships ${okFiles.size} image files (map == disk)`);
  const sniffOk = (buf) =>
    (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) ||
    (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) ||
    (buf.length >= 6 && buf.toString('latin1', 0, 4) === 'GIF8') ||
    (buf.length >= 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') ||
    (buf.length >= 4 && buf.toString('latin1', 0, 4) === '<svg');
  let badMagic = 0;
  for (const f of pubBimg) if (!sniffOk(readFileSync(join(root, 'public', 'bimg', f)))) badMagic += 1;
  ok(badMagic === 0, `qbank: every shipped bank image is a valid image by magic bytes (bad ${badMagic})`);
  ok(existsSync(join(out, 'bimg')) && readdirSync(join(out, 'bimg')).length === okFiles.size,
    'qbank: out/bimg ships the same files in the export');

  // Routes in the export.
  for (const r of ['qbank', 'qbank/play', 'qbank/analysis']) {
    ok(existsSync(join(out, r, 'index.html')), `qbank: route /${r}/ exported`);
  }
  ok(qmeta.subjects.every((s2) => existsSync(join(out, 'qbank', s2.slug, 'index.html'))),
    'qbank: all 19 subject routes exported');
  const qbHtml = readFileSync(join(out, 'qbank', 'index.html'), 'utf8');
  ok(!qbHtml.includes('Mixed practice') && !qbHtml.includes('Practise by subject'),
    'qbank: exported /qbank HTML carries no bank content (name gate renders it on the device)');
  ok(qbHtml.includes('Complete FMGE Preparation'), 'header: package tagline ships');
  const chooseHtml = readFileSync(join(out, 'choose', 'index.html'), 'utf8');
  ok(!chooseHtml.includes('Go to the Question Bank'), 'choose: exported HTML carries no choice cards (gated)');

  // Landing presents the complete package (server-rendered, descriptions only).
  const homeHtml3 = readFileSync(join(out, 'index.html'), 'utf8');
  ok(homeHtml3.includes('complete preparation platform for medical students') && homeHtml3.includes('The Question Bank')
    && homeHtml3.includes('13,934'), 'landing: preparation platform + question bank + real bank count');
  ok(!/href="\/(paper|subject|qbank)\/[^"]/.test(homeHtml3),
    'landing: still descriptions only — no links into gated content (paper/subject/bank pages)');

  // Source-level wiring for the bank flows.
  const chooseSrc = readFileSync(join(root, 'src', 'app', 'choose', 'ChooseGate.tsx'), 'utf8');
  ok(chooseSrc.includes('href="/qbank/"') && chooseSrc.includes('Question Bank'),
    'choose: third card links the Question Bank');
  const headerSrc = readFileSync(join(root, 'src', 'components', 'SiteHeader.tsx'), 'utf8');
  ok(headerSrc.includes('Question Bank') && headerSrc.includes('Complete FMGE Preparation'),
    'header: Question Bank nav item + preparation tagline');
  const chromeSrc = readFileSync(join(root, 'src', 'components', 'SiteChrome.tsx'), 'utf8');
  ok(chromeSrc.includes("'/qbank/'") && chromeSrc.includes('MedSetu v6'),
    'footer: Question Bank link + v6 small print');
  const qlib = readFileSync(join(root, 'src', 'lib', 'qbank.ts'), 'utf8');
  ok(qlib.includes("'medsetu-qb-session'") && qlib.includes("'medsetu-qb-mistakes'")
    && qlib.includes("'medsetu-qb-bookmarks'") && qlib.includes("'medsetu-qb-progress'"),
    'qbank store: session, mistakes, bookmarks and progress keys all defined');
  ok(qlib.includes('loadPracticeState') && qlib.includes('toggleBookmark') && qlib.includes('removeMistake'),
    'qbank store: practice state, bookmark toggle and mistake removal present');
  const practiceSrc = readFileSync(join(root, 'src', 'components', 'PracticeRunner.tsx'), 'utf8');
  ok(practiceSrc.includes('Check answer') && practiceSrc.includes('recordProgress')
    && practiceSrc.includes('addMistake') && practiceSrc.includes('removeMistake')
    && practiceSrc.includes('kept only in this tab'),
    'practice mode: check + explanation flow, progress, mistakes add/clear, tab-only honesty line');
  const playSrc = readFileSync(join(root, 'src', 'app', 'qbank', 'play', 'PlayGate.tsx'), 'utf8');
  ok(playSrc.includes('PracticeRunner') && playSrc.includes('qbankDescriptor') && playSrc.includes('newAttempt'),
    'play page: practice runner for Practice mode, shared Runner + fresh attempt for Exam mode');
  const runnerSrc3 = readFileSync(join(root, 'src', 'components', 'Runner.tsx'), 'utf8');
  ok(runnerSrc3.includes('loadQBankTestData') && runnerSrc3.includes('toggleBookmark'),
    'runner: qbank data branch + bookmark toggle wired');
  const analysisSrc3 = readFileSync(join(root, 'src', 'components', 'AnalysisView.tsx'), 'utf8');
  ok(analysisSrc3.includes('loadQBankTestData') && analysisSrc3.includes('addMistake'),
    'analysis: qbank data branch + exam-mode mistakes recording wired');
  const qbGateSrc = readFileSync(join(root, 'src', 'app', 'qbank', 'QBankGate.tsx'), 'utf8');
  ok(qbGateSrc.includes('My Mistakes') && qbGateSrc.includes('Mixed practice') && qbGateSrc.includes('kept only in this tab'),
    'qbank home: mistakes entry, mixed practice, tab-only honesty line');
}

// ---------- 11. source-brand scrub (2026-11-14, user order) ----------
// No content-platform brand name may appear anywhere in what ships: not in
// the shipped data chunks, not in the built site. Exam names (AIIMS,
// INI-CET, NEET, FMGE) are NOT brands — topic labels are frozen (below).
//
// Matcher design (fixture-tested both ways at the end of this section):
//  - HARD patterns name a platform outright (corebtr, BTR, DailyRounds,
//    PrepLadder, Unacademy, MEDINK, NODIA, platform hostnames, and
//    "Cerebellum" only with a brand suffix — the bare word is the
//    anatomical organ and appears throughout neuroanatomy content).
//  - "Marrow" is a brand only in brand SHAPES: followed by a product word
//    (QBank, app, edition, academy, classes, test series…), after a
//    Source:/Ref:/© marker, or as an all-caps standalone word NOT preceded
//    by BONE/RED/YELLOW. Every other occurrence is the clinical term
//    (bone marrow, marrow failure, hypercellular marrow…) — content that
//    must never be flagged or altered.
console.log('11) Source-brand scrub');
{
  const HARD_BRAND = [
    /core\s?btr/i, /\bBTR\b/, /daily\s?rounds/i, /prep\s?ladder/i,
    /unacademy/i, /medink/i, /\bnodia\b/i,
    /cerebellum\s+(academy|classes|app|aiims|neet)/i, /©\s*cerebellum/i,
    /assets\.corebtr\.com/i, /marrow\.com/i, /prepladder\.com/i, /unacademy\.com/i,
  ];
  const marrowBrandHit = (text) => {
    if (/marrow\s*(qbank|qb\b|app\b|edition|academy|classes|grand\s*test|test\s*series|rapid\s*revision)/i.test(text)) return true;
    if (/(©|source|ref\.?|reference|credit)\s*:?\s*marrow/i.test(text)) return true;
    if (/marrow\s*[™®©]/i.test(text)) return true;
    for (const m of text.matchAll(/\bMARROW\b/g)) {
      const before = text.slice(Math.max(0, m.index - 12), m.index).trim().split(/\s+/).pop() || '';
      if (!/^(BONE|RED|YELLOW)$/.test(before)) return true;
    }
    return false;
  };
  // Fixtures: clinical text must pass, brand text must be caught.
  const CLINICAL = [
    'Bone marrow biopsy shows a hypercellular marrow with dysplastic cells.',
    'Marrow failure | Ineffective | MDS | Marrow dysplasia',
    'Pearl: Marrow Changes in Myelodysplastic Syndrome (MDS)',
    'Deep nuclei of cerebellum relay into the dentate nucleus.',
    'Fat globules from the marrow are released into the systemic circulation.',
    'BONE MARROW EXAMINATION: markedly hypocellular marrow.',
    'Marrow aspirates yield a dry tap. Marrow iron stores are raised.',
  ];
  const BRANDED = [
    'Source: Marrow QBank, 2024 edition', 'explanations © Marrow',
    'downloaded from assets.corebtr.com', 'a CoreBTR compilation',
    'MEDINK/NODIA FMGE PYQ book', 'watch on Unacademy', 'PrepLadder notes',
    'DailyRounds image bank', 'Cerebellum Academy classes', 'as per BTR',
  ];
  ok(CLINICAL.every((t) => !marrowBrandHit(t) && !HARD_BRAND.some((r) => r.test(t))),
    'scrub matcher: clinical bone-marrow / cerebellum fixtures are NOT flagged');
  ok(BRANDED.every((t) => marrowBrandHit(t) || HARD_BRAND.some((r) => r.test(t))),
    'scrub matcher: platform-brand fixtures ARE flagged');

  // Scan every shipped data file (raw file text: keys + values).
  const dataTexts = [];
  const collect = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) collect(p);
      else if (e.name.endsWith('.json')) dataTexts.push([p, readFileSync(p, 'utf8')]);
    }
  };
  collect(join(root, 'src', 'data', 'qbank'));
  collect(join(root, 'src', 'data', 'papers'));
  collect(join(root, 'src', 'data', 'subjects'));
  for (const f of ['qbank-meta.json', 'papers-meta.json', 'subjects-meta.json']) {
    dataTexts.push([f, readFileSync(join(root, 'src', 'lib', f), 'utf8')]);
  }
  let hardHits = 0, marrowHits = 0;
  for (const [, text] of dataTexts) {
    for (const r of HARD_BRAND) hardHits += (text.match(new RegExp(r, 'g')) || []).length;
    if (marrowBrandHit(text)) marrowHits += 1;
  }
  ok(hardHits === 0, `scrub: zero platform-brand strings in shipped data (hits ${hardHits})`);
  ok(marrowHits === 0, 'scrub: zero brand-shaped "Marrow" in shipped data (clinical marrow untouched)');

  // Provenance fields: no key in any shipped chunk/meta may name a platform
  // or a content source. (Internal keys added/fromPaper/fromLabel name
  // sibling FMGE papers inside this same library — session labels, not
  // platforms — and are asserted brand-free by the text scan above.)
  const PROV_KEYS = new Set(['source', 'origin', 'provider', 'platform', 'publisher', 'srcref', 'fromsrc', 'credit', 'copyright', 'author']);
  let provHits = 0;
  const walkKeys = (n) => {
    if (Array.isArray(n)) n.forEach(walkKeys);
    else if (n && typeof n === 'object') {
      for (const k of Object.keys(n)) {
        if (PROV_KEYS.has(k.toLowerCase())) provHits += 1;
        walkKeys(n[k]);
      }
    }
  };
  for (const [name, text] of dataTexts) {
    if (name.endsWith('.json')) walkKeys(JSON.parse(text));
  }
  ok(provHits === 0, `scrub: zero provenance fields in shipped chunks/meta (hits ${provHits})`);

  // Built site: same brand scan over every text asset in out/.
  let outHard = 0, outMarrow = 0, outFiles = 0;
  const walkOut = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walkOut(p);
      else if (/\.(html|js|json|txt|css)$/.test(e.name)) {
        outFiles += 1;
        const text = readFileSync(p).toString('latin1');
        for (const r of HARD_BRAND) outHard += (text.match(new RegExp(r, 'g')) || []).length;
        if (marrowBrandHit(text)) outMarrow += 1;
      }
    }
  };
  walkOut(out);
  ok(outHard === 0, `scrub: zero platform-brand strings in the built site (${outFiles} text files, hits ${outHard})`);
  ok(outMarrow === 0, 'scrub: zero brand-shaped "Marrow" in the built site');

  // Topic labels are FROZEN (user order 2026-11-14: exam names stay).
  // Baseline RE-SET 2026-11-19: the missing-image exclusion (scripts/qbank.mjs)
  // removed 1,673 incomplete questions; two topics that were 100%
  // image-dependent (Anatomy "Cadaveric Sections", Community Medicine
  // "Biostatistics") went with them — 697 topics, 19 subjects. Topic NAMES
  // and exam-sitting labels remain frozen exactly as before.
  const qmeta2 = JSON.parse(readFileSync(join(root, 'src', 'lib', 'qbank-meta.json'), 'utf8'));
  const triples = [];
  for (const s of qmeta2.subjects) for (const t of s.topics) triples.push([s.name, t.name, t.count].join('\u0001'));
  triples.sort();
  const topicHash = createHash('sha256').update(triples.join('\n')).digest('hex');
  ok(topicHash === 'c07fd026f7807b4ecc2f209526847e41243e0c50d957ac5f902372dc1aeb9867' && triples.length === 697,
    'scrub: qbank topic labels match the 2026-11-19 baseline (697 topics, hash match)');
  const topicNames = new Set(triples.map((t) => t.split('\u0001')[1]));
  ok(['AIIMS 2017', 'INI-CET 2024', 'NEET 2024'].every((t) => topicNames.has(t)),
    'scrub: exam-sitting topic labels still present (AIIMS / INI-CET / NEET kept)');
  ok(qmeta2.total === 13934, `scrub: bank total at the 2026-11-19 baseline of 13,934 (got ${qmeta2.total})`);
}

// ---------- 12. AdSense prep: homepage only (2026-11-15, founder decision) ----------
// Ads (Google AdSense) may appear ONLY on the landing page. The loader and
// units live in src/components/AdSense.tsx, imported solely by
// src/app/page.tsx; the root layout must never carry them. Config is
// src/lib/ads.ts: the real publisher ID is set, slot IDs stay empty until
// ad units are created after Google's site approval — so the homepage
// ships the loader reference but NO <ins> ad units yet.
console.log('12) AdSense (homepage only)');
{
  const adsCfg = readFileSync(join(root, 'src', 'lib', 'ads.ts'), 'utf8');
  const pubId = (adsCfg.match(/publisherId:\s*'([^']+)'/) || [])[1] || '';
  const adsConfiguredNow = /^ca-pub-\d{10,}$/.test(pubId);
  const slotIds = [...adsCfg.matchAll(/home(?:Mid|Bottom):\s*'([^']*)'/g)].map((m) => m[1]);
  const anySlot = slotIds.some((s) => /^\d+$/.test(s));
  ok(adsConfiguredNow, `ads: real publisher ID configured in src/lib/ads.ts (${pubId})`);
  ok(slotIds.length === 2, 'ads: both homepage slots (homeMid, homeBottom) exist in config');

  // Source wiring: homepage only, never the root layout.
  const homeSrc = readFileSync(join(root, 'src', 'app', 'page.tsx'), 'utf8');
  ok(
    homeSrc.includes("from '../components/AdSense'") &&
      homeSrc.includes('<AdSenseLoader') &&
      homeSrc.includes('<AdUnit slot="homeMid"') &&
      homeSrc.includes('<AdUnit slot="homeBottom"'),
    'ads: landing page wires the loader + both units (mid-page and above the footer)'
  );
  const layoutSrc = readFileSync(join(root, 'src', 'app', 'layout.tsx'), 'utf8');
  ok(!/adsbygoogle|pagead2|AdSense/.test(layoutSrc),
    'ads: root layout carries no AdSense code (the script can never load site-wide)');

  // ads.txt: the seller line must be byte-exact for the configured ID.
  const adsTxtPath = join(out, 'ads.txt');
  ok(existsSync(adsTxtPath), 'ads.txt: ships in the export (out/ads.txt)');
  if (existsSync(adsTxtPath)) {
    const adsTxt = readFileSync(adsTxtPath, 'utf8');
    const expectedLine = `google.com, ${pubId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0`;
    ok(adsTxt.split('\n').some((l) => l.trim() === expectedLine),
      'ads.txt: google.com seller line is byte-exact for the configured publisher ID');
    ok(adsTxt.includes('google.com, pub-4650304896817293, DIRECT, f08c47fec0942fa0'),
      'ads.txt: carries the founder’s AdSense line (pub-4650304896817293)');
  }

  // Export: the homepage — and only the homepage — references the loader.
  const homeHtml = readFileSync(join(out, 'index.html'), 'utf8');
  if (adsConfiguredNow) {
    ok(
      homeHtml.includes(`pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`),
      'ads: homepage HTML references the AdSense loader with the real client ID'
    );
  } else {
    ok(!homeHtml.includes('pagead2.googlesyndication'),
      'ads: unconfigured placeholder — homepage makes no ad request');
  }
  ok(anySlot === homeHtml.includes('<ins class="adsbygoogle"'),
    anySlot
      ? 'ads: configured slots render <ins> units on the homepage'
      : 'ads: slots empty — homepage ships NO <ins> ad units yet');

  // Every other exported page must be completely free of ad strings.
  const htmlFiles = [];
  const walkHtml = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walkHtml(p);
      else if (e.name.endsWith('.html')) htmlFiles.push(p);
    }
  };
  walkHtml(out);
  let otherAdHits = 0;
  for (const f of htmlFiles) {
    if (f === join(out, 'index.html')) continue;
    const t = readFileSync(f, 'utf8');
    if (t.includes('adsbygoogle') || t.includes('pagead2.googlesyndication')) otherAdHits += 1;
  }
  ok(otherAdHits === 0,
    `ads: zero adsbygoogle/pagead strings in all ${htmlFiles.length - 1} non-homepage HTML files`);

  // The AdSense component code ships only inside chunks the homepage loads.
  const homeChunkRefs = new Set(
    [...homeHtml.matchAll(/src="(\/_next\/static\/chunks\/[^"]+\.js)"/g)].map((m) => m[1])
  );
  const adChunks = readdirSync(chunksDir, { recursive: true })
    .filter((f) => String(f).endsWith('.js'))
    .filter((f) => {
      try { return readFileSync(join(chunksDir, f), 'utf8').includes('adsbygoogle'); }
      catch { return false; }
    });
  ok(adChunks.length >= 1, 'ads: AdSense wiring is present in the exported JS');
  ok(
    adChunks.every((f) => homeChunkRefs.has(`/_next/static/chunks/${String(f).replace(/\\/g, '/')}`)),
    'ads: every chunk containing AdSense code is loaded by the homepage only'
  );

  // Privacy page: exists, honest, branded, and linked from the footer.
  const privacyPath = join(out, 'privacy', 'index.html');
  ok(existsSync(privacyPath), 'privacy: out/privacy exists');
  if (existsSync(privacyPath)) {
    const pHtml = readFileSync(privacyPath, 'utf8');
    ok(pHtml.includes('Privacy policy'), 'privacy: page renders its heading');
    ok(pHtml.includes('AdSense') && pHtml.includes('cookies'),
      'privacy: discloses the AdSense / cookie arrangement');
    ok(pHtml.includes('adssettings.google.com'), 'privacy: links the personalised-ads opt-out');
    ok(pHtml.includes('8920922167'), 'privacy: carries the contact number');
    ok(pHtml.includes('data-brand-lockup'), 'privacy: brand lockup renders (header/footer)');
    ok(pHtml.includes('href="/privacy/"'), 'privacy: footer link present on the privacy page itself');
  }
  ok(homeHtml.includes('href="/privacy/"'), 'privacy: footer link to /privacy on the home page');

  // CSP: the strict audited policy stays global; ONLY the homepage ("/")
  // rule may extend it, and only with Google's ad domains (2026-11-15) —
  // without this the AdSense loader is blocked by script-src 'self'.
  const headersTxt = readFileSync(join(out, '_headers'), 'utf8');
  const headerBlocks = {};
  {
    let current = null;
    for (const line of headersTxt.split('\n')) {
      if (!line.trim()) continue;
      if (!/^\s/.test(line)) { current = line.trim(); headerBlocks[current] = []; }
      else if (current) headerBlocks[current].push(line.trim());
    }
  }
  const cspOf = (path) => {
    const line = (headerBlocks[path] || []).find((l) => l.startsWith('Content-Security-Policy:'));
    return line ? line.slice('Content-Security-Policy:'.length).trim() : '';
  };
  const directiveOf = (csp, name) =>
    (csp.split(';').map((d) => d.trim()).find((d) => d === name || d.startsWith(name + ' ')) || '');
  const globalCsp = cspOf('/*');
  ok(globalCsp.includes("script-src 'self'") && globalCsp.includes("default-src 'self'"),
    'csp: global /* rule keeps the strict audited policy (script-src \'self\')');
  ok(!/googlesyndication|doubleclick|googleadservices|googletagservices/.test(globalCsp),
    'csp: global /* rule contains NO Google ad domains (every non-homepage keeps the strict policy)');
  const homeCsp = cspOf('/');
  ok(homeCsp.length > 0, 'csp: a homepage-scoped (/) rule with its own CSP exists in _headers');
  const scriptDir = directiveOf(homeCsp, 'script-src');
  ok(['https://pagead2.googlesyndication.com', 'https://partner.googleadservices.com',
      'https://tpc.googlesyndication.com', 'https://www.googletagservices.com',
      'https://adservice.google.com'].every((d) => scriptDir.includes(d)),
    'csp: homepage script-src extends the strict policy with the 5 Google ad script domains');
  const frameDir = directiveOf(homeCsp, 'frame-src');
  ok(['https://googleads.g.doubleclick.net', 'https://tpc.googlesyndication.com',
      'https://www.google.com'].every((d) => frameDir.includes(d)),
    'csp: homepage frame-src allows the Google ad frame domains');
  const imgDir = directiveOf(homeCsp, 'img-src');
  ok(imgDir.includes("'self'") && imgDir.includes('data:') &&
     ['https://pagead2.googlesyndication.com', 'https://googleads.g.doubleclick.net',
      'https://tpc.googlesyndication.com'].every((d) => imgDir.includes(d)),
    'csp: homepage img-src keeps \'self\'/data: and adds the Google ad image domains');
  const connectDir = directiveOf(homeCsp, 'connect-src');
  ok(['https://pagead2.googlesyndication.com', 'https://googleads.g.doubleclick.net',
      'https://tpc.googlesyndication.com'].every((d) => connectDir.includes(d)),
    'csp: homepage connect-src adds the Google ad connect domains');
  ok(["default-src 'self'", "style-src 'self' 'unsafe-inline'", "font-src 'self'",
      "frame-ancestors 'none'", "base-uri 'self'", "form-action 'self'"]
      .every((d) => homeCsp.includes(d)),
    'csp: every other homepage directive stays identical to the strict global policy');
}

// ---------- 13. AdSense readiness: robots, sitemap, footer reachability ----------
console.log('13) AdSense readiness (robots, sitemap, footer links)');
{
  const robotsPath = join(out, 'robots.txt');
  ok(existsSync(robotsPath), 'robots: out/robots.txt exists');
  const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8') : '';
  ok(/User-agent:\s*\*/.test(robots) && /Allow:\s*\//.test(robots) && !/Disallow:\s*\/\s*$/m.test(robots),
    'robots: all crawlers allowed (User-agent: * + Allow: /, no blanket Disallow)');
  ok(robots.includes('Mediapartners-Google') && robots.includes('Googlebot'),
    'robots: Googlebot and Mediapartners-Google named explicitly');
  ok(robots.includes('Sitemap: https://med-setu.netlify.app/sitemap.xml'),
    'robots: names the sitemap URL');

  const smPath = join(out, 'sitemap.xml');
  ok(existsSync(smPath), 'sitemap: out/sitemap.xml exists');
  const sm = existsSync(smPath) ? readFileSync(smPath, 'utf8') : '';
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok(sm.startsWith('<?xml') && sm.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">') &&
     sm.trimEnd().endsWith('</urlset>') && (sm.match(/<url>/g) || []).length === locs.length && locs.length > 0,
    'sitemap: well-formed urlset with one <loc> per <url>');
  ok(locs.every((u) => u.startsWith('https://med-setu.netlify.app/')),
    'sitemap: every URL is on the production origin');
  ok(['https://med-setu.netlify.app/', 'https://med-setu.netlify.app/privacy/',
      'https://med-setu.netlify.app/about/'].every((u) => locs.includes(u)),
    'sitemap: contains /, /privacy and /about');

  for (const page of ['index.html', join('about', 'index.html'), join('privacy', 'index.html')]) {
    const html = readFileSync(join(out, page), 'utf8');
    ok(['href="/about/"', 'href="/naitik-library/"', 'href="/privacy/"'].every((h) => html.includes(h)),
      `footer: ${page} links to /about, /naitik-library and /privacy (reviewer reachability)`);
  }
}

// ---------- 14. V4: Test Series, 8-part analysis, overhaul, SEO ----------
console.log('14) V4 — Test Series, analysis structure, site overhaul, SEO');
{
  const seriesMeta = JSON.parse(readFileSync(join(root, 'src/lib/series-meta.json'), 'utf8'));
  ok(seriesMeta.length === 30, 'series: meta lists exactly 30 tests');

  const seenTexts = new Set();
  let totalQ = 0;
  let repeatCount = 0;
  let noLearning = 0;
  let noExpl = 0;
  for (let i = 1; i <= 30; i++) {
    const f = join(root, `src/data/tests/series-test-${String(i).padStart(2, '0')}.json`);
    ok(existsSync(f), `series: data file ${i} exists`);
    const data = JSON.parse(readFileSync(f, 'utf8'));
    const qs = data.questions || data;
    ok(Array.isArray(qs) && qs.length === 300, `series: test ${i} has exactly 300 questions`);
    for (const q of qs) {
      totalQ++;
      const key = (q.text || '').toLowerCase().replace(/\s+/g, ' ').trim();
      if (seenTexts.has(key)) repeatCount++;
      seenTexts.add(key);
      if (!q.learning || q.learning.trim().length < 10) noLearning++;
      if (!q.explanation || q.explanation.trim().length < 3) noExpl++;
    }
  }
  ok(totalQ === 9000, `series: 9,000 questions in total (got ${totalQ})`);
  ok(repeatCount === 0, `series: zero repeated questions across the 30 tests (got ${repeatCount})`);
  ok(noLearning === 0, `series: every question carries a learning point (missing ${noLearning})`);
  ok(noExpl === 0, `series: every question carries an explanation (missing ${noExpl})`);

  // routes in the export
  for (const p of ['tests/index.html', 'tests/series-test-1/index.html',
    'tests/series-test-15/index.html', 'tests/series-test-30/index.html',
    'tests/series-test-1/test/index.html', 'tests/series-test-1/analysis/index.html',
    'contact/index.html', 'terms/index.html', 'disclaimer/index.html',
    'llms.txt', 'og.png']) {
    ok(existsSync(join(out, p)), `v4 routes: out/${p} exists`);
  }
  const homeHtml = readFileSync(join(out, 'index.html'), 'utf8');
  ok(homeHtml.includes('Test Series') && homeHtml.includes('Prepare every way that works'),
    'home: Test Series mode card present');
  ok(homeHtml.includes('Questions students ask'),
    'home: FAQ section present');
  ok(homeHtml.includes('The FMGE pattern') && homeHtml.includes('Community Medicine'),
    'home: FMGE pattern + weightage table present');
  ok(homeHtml.includes('property="og:image"') && homeHtml.includes('/og.png'),
    'home: OpenGraph image wired');
  ok(homeHtml.includes('"@type":"Organization"') || homeHtml.includes('"@type": "Organization"') ||
     homeHtml.includes('@graph'), 'home: Organization JSON-LD present');
  ok(homeHtml.includes('MedSetu v6'), 'footer: version line updated to v6');
  for (const h of ['href="/tests/"', 'href="/contact/"', 'href="/terms/"', 'href="/disclaimer/"', 'href="/privacy/"']) {
    ok(homeHtml.includes(h), `nav/footer: homepage carries ${h}`);
  }
  const testsHtml = readFileSync(join(out, 'tests/index.html'), 'utf8');
  ok(testsHtml.includes('Grand Test 30') && testsHtml.includes('What is the MedSetu Test Series?'),
    'tests index: 30 tests listed with FAQ content');

  // trust pages carry only the approved phone number
  for (const p of ['contact/index.html', 'terms/index.html', 'disclaimer/index.html']) {
    const html = readFileSync(join(out, p), 'utf8');
    ok(!html.includes('9654042372'), `trust: out/${p} has no removed phone number`);
  }
  const contactHtml = readFileSync(join(out, 'contact/index.html'), 'utf8');
  ok(contactHtml.includes('8920922167'), 'contact: page carries the library phone number');

  // session routes are noindex; sitemap is clean and complete
  for (const p of ['tests/series-test-1/test/index.html', 'start/index.html', 'choose/index.html',
    'qbank/play/index.html']) {
    const html = readFileSync(join(out, p), 'utf8');
    ok(html.includes('noindex'), `seo: out/${p} is noindex`);
  }
  const sm = readFileSync(join(out, 'sitemap.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok(!locs.some((u) => u.includes('/start/') || u.includes('/choose/')),
    'sitemap: gate pages removed');
  ok(locs.includes('https://med-setu.netlify.app/tests/') &&
     locs.includes('https://med-setu.netlify.app/tests/series-test-30/') &&
     locs.includes('https://med-setu.netlify.app/contact/') &&
     locs.includes('https://med-setu.netlify.app/terms/') &&
     locs.includes('https://med-setu.netlify.app/disclaimer/'),
    'sitemap: test series + trust pages included');
  ok(locs.length === 279, `sitemap: exactly 279 URLs (got ${locs.length})`);

  const robots = readFileSync(join(out, 'robots.txt'), 'utf8');
  ok(robots.includes('OAI-SearchBot') && robots.includes('PerplexityBot') && robots.includes('ClaudeBot'),
    'robots: AI search crawlers explicitly allowed');

  const headers = readFileSync(join(out, '_headers'), 'utf8');
  ok(headers.includes('/bimg/*') && headers.includes('immutable'),
    'headers: immutable cache rules for image directories');

  // analysis structure (source-level, mirroring sections 9/12)
  const av = readFileSync(join(root, 'src/components/AnalysisView.tsx'), 'utf8');
  for (const s of ['Overview', 'Performance Analysis', 'Score Potential', 'Attempt Analysis',
    'Time Analysis', 'Topic Analysis', 'Question Journey', 'Qs by Qs Analysis']) {
    ok(av.includes(s), `analysis: section "${s}" present in AnalysisView`);
  }
  const pv = readFileSync(join(root, 'src/components/PrintViews.tsx'), 'utf8');
  ok(pv.includes('Contents') && pv.includes('Attempt Analysis') && pv.includes('Question Journey'),
    'print: PDF report carries Contents + the 8-part structure');
  const sol = readFileSync(join(root, 'src/components/Solution.tsx'), 'utf8');
  ok(sol.includes('Learning from this question'), 'solution: learning callout present');

  // community links (founder-supplied 2026-11-16)
  ok(homeHtml.includes('https://chat.whatsapp.com/BAxhL36HFnvC3o8Rqp7q07') &&
     homeHtml.includes('https://www.instagram.com/naitiklibrary/'),
    'community: footer carries the WhatsApp group + Instagram links');
  const contactHtml2 = readFileSync(join(out, 'contact/index.html'), 'utf8');
  ok(contactHtml2.includes('chat.whatsapp.com/BAxhL36HFnvC3o8Rqp7q07') &&
     contactHtml2.includes('instagram.com/naitiklibrary'),
    'community: contact page carries both community links');
}

// ---------- 15. Blog (V5) + Notes & Flashcards (V6) ----------
console.log('15) Blog, short notes & flashcards');
{
  const blogDir = join(root, 'src/data/blog');
  const blogFiles = readdirSync(blogDir).filter((f) => f.endsWith('.md'));
  ok(blogFiles.length === 150, `blog: exactly 150 articles (got ${blogFiles.length})`);
  const blogSlugs = new Set(blogFiles.map((f) => f.replace(/\.md$/, '')));
  ok(blogSlugs.size === 150, 'blog: slugs unique');

  const REVISE = ['medicine','surgery','obstetrics-gynaecology','community-medicine','anatomy','physiology','biochemistry','paediatrics','ophthalmology','ent','pathology','microbiology','pharmacology','radiology','forensic-medicine','psychiatry','dermatology','anaesthesia','orthopaedics'];
  let cardTotal = 0;
  for (const s of REVISE) {
    const n = JSON.parse(readFileSync(join(root, 'src/data/notes', `${s}.json`), 'utf8'));
    ok(n.topics.length >= 8 && n.topics.length <= 15, `notes/${s}: ${n.topics.length} topics`);
    ok(Array.isArray(n.goldenPoints) && n.goldenPoints.length >= 8, `notes/${s}: golden points present`);
    ok(n.mindmap && n.mindmap.branches.length >= 6, `notes/${s}: mind map branches present`);
    ok(n.topics.every((t) => t.points.length >= 4), `notes/${s}: every topic has >= 4 points`);
    const c = JSON.parse(readFileSync(join(root, 'src/data/flashcards', `${s}.json`), 'utf8'));
    ok(c.cards.length === 50, `flashcards/${s}: exactly 50 cards`);
    ok(c.cards.every((x) => x.front && x.back && x.topic), `flashcards/${s}: all cards complete`);
    cardTotal += c.cards.length;
  }
  ok(cardTotal === 950, `flashcards: 950 total (got ${cardTotal})`);

  if (existsSync(join(out, 'index.html'))) {
    const home = readFileSync(join(out, 'index.html'), 'utf8');
    ok(/complete preparation platform for medical students/i.test(home), 'home: hero uses preparation-platform wording');
    ok(!/complete FMGE practice package/i.test(home), 'home: old practice-package wording gone');
    ok(existsSync(join(out, 'blog/index.html')), 'export: /blog/ exists');
    ok(existsSync(join(out, 'notes/index.html')), 'export: /notes/ exists');
    ok(existsSync(join(out, 'flashcards/index.html')), 'export: /flashcards/ exists');
    const medNotes = readFileSync(join(out, 'notes/medicine/index.html'), 'utf8');
    ok(/golden points/i.test(medNotes) && /mind map/i.test(medNotes), 'export: medicine notes carry golden points + mind map');
    ok(existsSync(join(out, 'flashcards/medicine/index.html')), 'export: /flashcards/medicine/ exists');
    const sm = readFileSync(join(root, 'public/sitemap.xml'), 'utf8');
    const locs = (sm.match(/<loc>/g) || []).length;
    ok(locs === 279, `sitemap: 279 URLs (got ${locs})`);
    ok(sm.includes('/notes/medicine/') && sm.includes('/flashcards/medicine/') && sm.includes('/blog/'), 'sitemap: notes, flashcards and blog URLs present');
  }
}

console.log(failures === 0 ? '\nSMOKE: ALL CHECKS PASSED' : `\nSMOKE: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
