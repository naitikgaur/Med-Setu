// MedSetu V3 — question-bank import (manual step, like subjects-import.mjs).
//
// Vendors the three founder-supplied QBank exports into src/data/qbank-src/
// in trimmed form (only the fields the bank pipeline reads):
//   pyq.json      <- Marrow_FMGE_PYQs_0_yw91.html        (inline TESTS_LIST)
//   corebtr.json  <- CoreBTR_QBank__Latest__*.html       (gzip wrapper -> TESTS_LIST)
//   complete.json <- Marrow_Complete_QBank_-_Under_25MB.html (gzip wrapper -> DATA.questions)
//
// Each file's own decode path is reproduced exactly (inline JSON literal;
// zlib gunzip of the `encoded` base64 chunks). Nothing is edited here —
// cleaning, dedupe and verification live in scripts/qbank.mjs.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const userFiles = join(root, '..', 'user', 'files');
const outDir = join(root, 'src', 'data', 'qbank-src');
mkdirSync(outDir, { recursive: true });

function extractConst(src, name) {
  let i = -1, from = 0;
  while (true) {
    const cand = src.indexOf(`const ${name} =`, from);
    if (cand < 0) break;
    let t = cand + name.length + 8;
    while (t < src.length && /\s/.test(src[t])) t++;
    if (src[t] === '[' || src[t] === '{') { i = cand; break; }
    from = cand + 1;
  }
  if (i < 0) throw new Error('const not found: ' + name);
  let j = src.indexOf('=', i) + 1;
  while (/\s/.test(src[j])) j++;
  const open = src[j], close = open === '[' ? ']' : '}';
  let depth = 0, k = j, inStr = false, esc = false;
  for (; k < src.length; k++) {
    const c = src[k];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) { k++; break; } }
  }
  return JSON.parse(src.slice(j, k));
}

function unwrap(file) {
  const src = readFileSync(join(userFiles, file), 'utf8');
  const m = src.match(/encoded=\[([\s\S]*?)\]\.join/);
  if (!m) throw new Error('encoded blob not found in ' + file);
  const chunks = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  return gunzipSync(Buffer.from(chunks.join(''), 'base64')).toString('utf8');
}

function trimListTest(t) {
  return {
    title: t.title,
    path: t.path || [],
    questions: (t.questions || []).map((q) => ({
      text: q.text || '',
      raw_text: q.raw_text || '',
      options: (q.options || []).map((o) => ({ text: o.text || '', correct: !!o.correct })),
      correct_answer: q.correct_answer || '',
      question_images: q.question_images || [],
      explanation_images: q.explanation_images || [],
      explanation: q.explanation || '',
      hasVideo: !!q.video,
    })),
  };
}

// 1 — PYQ file (inline literals)
{
  const src = readFileSync(join(userFiles, 'Marrow_FMGE_PYQs_0_yw91.html'), 'utf8');
  const tests = extractConst(src, 'TESTS_LIST').map(trimListTest);
  writeFileSync(join(outDir, 'pyq.json'), JSON.stringify(tests));
  console.log('pyq.json:', tests.length, 'tests');
}
// 2 — CoreBTR (wrapper)
{
  const inner = unwrap('CoreBTR_QBank__Latest__-_Under_25MB_1_gvax.html');
  const tests = extractConst(inner, 'TESTS_LIST').map(trimListTest);
  writeFileSync(join(outDir, 'corebtr.json'), JSON.stringify(tests));
  console.log('corebtr.json:', tests.length, 'tests');
}
// 3 — Complete QBank (wrapper, flat DATA)
{
  const inner = unwrap('Marrow_Complete_QBank_-_Under_25MB.html');
  const data = extractConst(inner, 'DATA');
  const questions = data.questions.map((q) => ({
    subject: q.subject || '',
    lesson: q.lesson || '',
    text: q.text || '',
    img: q.img || '',
    options: q.options || {},
    ans: q.ans || '',
    expl: q.expl || '',
  }));
  writeFileSync(join(outDir, 'complete.json'), JSON.stringify(questions));
  console.log('complete.json:', questions.length, 'questions');
}
