// MedSetu V2 — subject-test image recovery (user order 2026-11-13: "without
// images there are no meaning of the questions — add images in the question
// by any chance").
//
// The Marrow subject-series source references every figure by remote
// publisher URL (question_images / explanation_images in the vendored
// source). This script downloads each unique URL ONCE into the repo as a
// local file, so the static export ships the images themselves — nothing is
// hotlinked at runtime.
//
//   node scripts/subjects-images.mjs            (inventory + download)
//   node scripts/subjects-images.mjs --force    (ignore the existing map)
//
// Outputs:
//   src/data/simg/<sha256(content)[:20]>.<ext>   the image files (source of
//                                                truth; prepare-data copies
//                                                them to public/simg/)
//   src/data/subjects-src/image-map.json         url -> { f, bytes } | { fail }
//   ../medsetu-data/subject-tests/image-inventory.json   every reference
//   ../medsetu-data/subject-tests/image-downloads.json   per-URL outcome log
//
// Validation is by MAGIC BYTES, never by the server's content-type (both
// hosts answer application/octet-stream): PNG/JPEG/GIF/WebP/SVG/BMP/AVIF are
// accepted; anything else (e.g. an HTML error page served with HTTP 200) is
// recorded as a failure with its reason, and the transform keeps the honest
// "image not available" note for exactly those spots.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FORCE = process.argv.includes('--force');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const CONCURRENCY = 6;
const TIMEOUT_MS = 45000;

const srcPath = join(root, 'src', 'data', 'subjects-src', 'source.json');
const source = JSON.parse(readFileSync(srcPath, 'utf8'));

// ---------------------------------------------------------------- inventory
const refs = []; // { url, kind: 'question'|'explanation', at, pos }
const unique = new Map(); // url -> first ref index
for (const subj of source.subjects) {
  for (const [year, t] of Object.entries(subj.tests)) {
    t.questions.forEach((q, qi) => {
      (q.question_images || []).forEach((url, pos) => {
        refs.push({ url, kind: 'question', at: `${subj.slug}/${year}#${qi} (${q.id})`, pos });
        if (!unique.has(url)) unique.set(url, refs.length - 1);
      });
      (q.explanation_images || []).forEach((url, pos) => {
        refs.push({ url, kind: 'explanation', at: `${subj.slug}/${year}#${qi} (${q.id})`, pos });
        if (!unique.has(url)) unique.set(url, refs.length - 1);
      });
    });
  }
}
const urls = [...unique.keys()];
const hosts = {};
for (const u of urls) {
  let h;
  try { h = new URL(u).host; } catch { h = '(unparseable)'; }
  hosts[h] = (hosts[h] || 0) + 1;
}
const inventory = {
  generatedFrom: 'src/data/subjects-src/source.json (FMGE Test Series subject series only)',
  references: {
    total: refs.length,
    question: refs.filter((r) => r.kind === 'question').length,
    explanation: refs.filter((r) => r.kind === 'explanation').length,
  },
  uniqueUrls: urls.length,
  hosts,
  refs,
};
const dataDir = join(root, '..', 'medsetu-data', 'subject-tests');
mkdirSync(dataDir, { recursive: true });
writeFileSync(join(dataDir, 'image-inventory.json'), JSON.stringify(inventory, null, 1));
console.log(
  `inventory: ${refs.length} references (${inventory.references.question} question, ` +
  `${inventory.references.explanation} explanation), ${urls.length} unique URLs, hosts ${JSON.stringify(hosts)}`
);

// ---------------------------------------------------------------- validation
function sniff(buf) {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length >= 6 && buf.toString('latin1', 0, 4) === 'GIF8') return 'gif';
  if (buf.length >= 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  if (buf.length >= 2 && buf.toString('latin1', 0, 2) === 'BM') return 'bmp';
  if (buf.length >= 12 && buf.toString('latin1', 4, 8) === 'ftyp' && /avif|avis/.test(buf.toString('latin1', 8, 12))) return 'avif';
  const head = buf.toString('utf8', 0, Math.min(buf.length, 1024)).replace(/^﻿/, '').trimStart();
  if (head.startsWith('<') && /<svg[\s>]/i.test(head) && !/<html[\s>]/i.test(head)) return 'svg';
  return null;
}

// ---------------------------------------------------------------- download
const simgDir = join(root, 'src', 'data', 'simg');
mkdirSync(simgDir, { recursive: true });
const mapPath = join(root, 'src', 'data', 'subjects-src', 'image-map.json');
const map = !FORCE && existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf8')) : {};
const log = {};
let done = 0, okCount = 0, failCount = 0, skipped = 0, bytesTotal = 0;

async function fetchOnce(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'image/avif,image/webp,image/png,image/jpeg,image/gif,image/svg+xml,*/*;q=0.8' },
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function download(url) {
  const prev = map[url];
  if (prev && prev.f && existsSync(join(simgDir, prev.f))) {
    skipped += 1;
    log[url] = { f: prev.f, bytes: prev.bytes, skipped: true };
    return;
  }
  let lastErr = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const buf = await fetchOnce(url);
      const ext = sniff(buf);
      if (!ext) {
        const headHex = buf.subarray(0, 12).toString('hex');
        throw new Error(`not an image by magic bytes (first bytes ${headHex}, ${buf.length} B)`);
      }
      if (buf.length < 100) throw new Error(`suspiciously small (${buf.length} B)`);
      const name = `${createHash('sha256').update(buf).digest('hex').slice(0, 20)}.${ext}`;
      writeFileSync(join(simgDir, name), buf);
      map[url] = { f: name, bytes: buf.length };
      log[url] = { f: name, bytes: buf.length, attempts: attempt };
      okCount += 1;
      bytesTotal += buf.length;
      return;
    } catch (e) {
      lastErr = e;
      if (attempt === 1) await new Promise((r) => setTimeout(r, 800));
    }
  }
  map[url] = { fail: String(lastErr && lastErr.message ? lastErr.message : lastErr) };
  log[url] = { fail: map[url].fail, attempts: 2 };
  failCount += 1;
}

// Atomic, crash-proof persistence: a checkpoint failure must never kill a
// run (one transient FS error at a checkpoint did exactly that on the first
// pass, when the home quota was full). Write to a temp name, rename over,
// retry a few times, then move on.
function persist(path, obj) {
  const tmp = `${path}.tmp`;
  for (let i = 0; i < 4; i++) {
    try {
      writeFileSync(tmp, JSON.stringify(obj, null, 1));
      renameSync(tmp, path);
      return;
    } catch (e) {
      if (i === 3) console.warn(`  persist warning for ${path}: ${e.message}`);
    }
  }
}

const queue = [...urls];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    await download(url);
    done += 1;
    if (done % 100 === 0 || done === urls.length) {
      console.log(`  ${done}/${urls.length} (ok ${okCount}, failed ${failCount}, skipped ${skipped})`);
      // persist progress so an interrupted run keeps its results
      persist(mapPath, map);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
persist(mapPath, map);
persist(join(dataDir, 'image-downloads.json'), log);

const files = readdirSync(simgDir);
console.log(
  `\ndownload complete: ${okCount} downloaded, ${skipped} already present, ${failCount} failed; ` +
  `${files.length} files in src/data/simg, ${(bytesTotal / 1048576).toFixed(1)} MB fetched this run`
);
if (failCount) {
  console.log('failures:');
  for (const [u, v] of Object.entries(map)) if (v.fail) console.log(`  ${u} — ${v.fail}`);
}
