/**
 * Checkpointed downloader for question-bank images (Part 1).
 * - Priority: QUESTION (stem) images first — they carry question meaning —
 *   then explanation images.
 * - Hard byte cap (QBANK_CAP_MB, default 620) because this machine's home
 *   quota is nearly full: when the cap is reached the remaining URLs are
 *   recorded as deferred (reason 'deferred-quota-cap'), stay resumable on a
 *   later run, and the app shows its honest image note for them.
 * - Magic-byte validation; content-hash file names; map saved every 50.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const LIST_PATH = join(ROOT, 'src/data/qbank-src/winner-image-urls.json');
const MAP_PATH = join(ROOT, 'src/data/qbank-src/image-map.json');
const OUT_DIR = join(ROOT, 'src/data/bimg');
const CONCURRENCY = Number(process.env.QBANK_CONC || 24);
const CAP_BYTES = Number(process.env.QBANK_CAP_MB || 620) * 1024 * 1024;
const TIMEOUT_MS = 45000;

const urls = JSON.parse(readFileSync(LIST_PATH, 'utf8'));

// Which winner URLs are stem (question) images in the sources?
const stemUrls = new Set();
for (const f of ['pyq', 'corebtr']) {
  const recs = JSON.parse(readFileSync(join(ROOT, 'src/data/qbank-src', `${f}.json`), 'utf8'));
  for (const r of recs) for (const u of r.qImgs || []) stemUrls.add(u);
}
{
  const recs = JSON.parse(readFileSync(join(ROOT, 'src/data/qbank-src/complete.json'), 'utf8'));
  for (const r of recs) if (r.img) stemUrls.add(r.img);
}

let map = {};
if (existsSync(MAP_PATH)) map = JSON.parse(readFileSync(MAP_PATH, 'utf8'));
mkdirSync(OUT_DIR, { recursive: true });

function dirBytes() {
  // Sum from the map's successful entries (files on disk).
  let total = 0;
  for (const v of Object.values(map)) if (v && v.ok && v.file) {
    try { total += statSync(join(OUT_DIR, v.file)).size; } catch { /* gone */ }
  }
  return total;
}

let bytes = dirBytes();
const todoAll = urls.filter((u) => !(map[u] && map[u].ok));
const todo = [
  ...todoAll.filter((u) => stemUrls.has(u)),
  ...todoAll.filter((u) => !stemUrls.has(u)),
];
const okCount = urls.length - todoAll.length;
console.log(`qbank images: ${urls.length} unique URLs, ${okCount} already downloaded, ${todo.length} to fetch, bimg so far ${(bytes / 1048576).toFixed(0)} MB, cap ${(CAP_BYTES / 1048576).toFixed(0)} MB`);

function saveMap() {
  const tmp = MAP_PATH + '.tmp';
  writeFileSync(tmp, JSON.stringify(map));
  renameSync(tmp, MAP_PATH);
}

function detectExt(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'png';
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'gif';
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  const head = buf.subarray(0, 256).toString('latin1').trimStart();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) return 'svg';
  return null;
}

async function fetchOne(url) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (MedSetu image fetch)' } });
      clearTimeout(timer);
      if (!res.ok) { map[url] = { ok: false, reason: `http-${res.status}` }; return 0; }
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = detectExt(buf);
      if (!ext) { map[url] = { ok: false, reason: 'unrecognised-bytes' }; return 0; }
      const name = `${createHash('sha256').update(buf).digest('hex').slice(0, 20)}.${ext}`;
      const path = join(OUT_DIR, name);
      if (!existsSync(path)) writeFileSync(path, buf);
      map[url] = { ok: true, file: name };
      return buf.length;
    } catch (e) {
      if (attempt === 1) map[url] = { ok: false, reason: String(e && e.message || e).slice(0, 80) };
    }
  }
  return 0;
}

let done = 0;
let capped = false;
let cursor = 0;
async function worker() {
  while (cursor < todo.length) {
    if (bytes >= CAP_BYTES) { capped = true; return; }
    const url = todo[cursor++];
    bytes += await fetchOne(url);
    done++;
    if (done % 50 === 0) {
      saveMap();
      console.log(`  ${done}/${todo.length} (cap ${(bytes / 1048576).toFixed(0)} MB)`);
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
if (capped) {
  for (let i = cursor; i < todo.length; i++) {
    if (!map[todo[i]]) map[todo[i]] = { ok: false, reason: 'deferred-quota-cap' };
  }
}
saveMap();
const ok = Object.values(map).filter((v) => v.ok).length;
const deferred = Object.values(map).filter((v) => !v.ok && v.reason === 'deferred-quota-cap').length;
const failed = Object.values(map).filter((v) => !v.ok && v.reason !== 'deferred-quota-cap').length;
console.log(`DONE: ok ${ok}/${urls.length}, failed ${failed}, deferred(quota cap) ${deferred}, bimg ${(bytes / 1048576).toFixed(0)} MB`);
