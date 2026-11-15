// MedSetu V2 — one-time (re-runnable) import of the subject-wise test series
// from the Marrow combined HTML export supplied by the founder.
//
//   node scripts/subjects-import.mjs [path-to-marrow-html]
//
// The export embeds its index as a FOLDER_TREE JSON in an inline script and
// its question data as one gzip+base64 blob decoded by the page itself:
//   TESTS_LIST = JSON.parse(pako.ungzip(Uint8Array.from(atob("<b64>"))))
// This script reproduces that decode, then takes ONLY the series rooted at
// "FMGE Test Series subject" (the other series in the file — "FMGE Mini Test
// Series", "FMGE Test Series" — are deliberately NOT imported), and vendors
// the 30 source tests to src/data/subjects-src/source.json. That vendored
// file is the input to the deterministic transform in scripts/subjects.mjs,
// which runs on every prepare-data. The vendored file is internal build
// material: it is never imported by app code and never ships in out/.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath =
  process.argv[2] ||
  '/home/hatch/workspace/user/files/Marrow_FMGE_test_optimized_0_iki8.html';

const html = readFileSync(htmlPath, 'utf8');
const marker = 'atob("';
const start = html.indexOf(marker);
if (start < 0) throw new Error('TESTS_LIST blob (atob marker) not found in the export');
const b64 = html.slice(start + marker.length, html.indexOf('"', start + marker.length));
const tests = JSON.parse(gunzipSync(Buffer.from(b64, 'base64')).toString('utf8'));
console.log(`decoded TESTS_LIST: ${tests.length} tests in the export`);

// Canonical subjects, in NBEMS-blueprint display order. Matching is by the
// source test id + year folder (titles differ slightly between years).
export const SUBJECT_DEFS = [
  { slug: 'anatomy', name: 'Anatomy', ids: { 2023: 'anatomy_test', 2024: 'anatomy_test' } },
  { slug: 'physiology', name: 'Physiology', ids: { 2023: 'physiology_test', 2024: 'physiology_test' } },
  { slug: 'biochemistry', name: 'Biochemistry', ids: { 2023: 'biochemistry_test', 2024: 'biochemistry_test' } },
  { slug: 'pathology', name: 'Pathology', ids: { 2023: 'pathology_test', 2024: 'pathology_test' } },
  { slug: 'microbiology', name: 'Microbiology', ids: { 2023: 'microbiology_test', 2024: 'microbiology_test' } },
  { slug: 'pharmacology', name: 'Pharmacology', ids: { 2023: 'pharmacology_test', 2024: 'pharmacology_test' } },
  { slug: 'forensic-medicine', name: 'Forensic Medicine', ids: { 2023: 'forensic_medicine___toxicology', 2024: 'forensic_medicine_test' } },
  { slug: 'medicine', name: 'Medicine', ids: { 2023: 'medicine_test', 2024: 'medicine_test' } },
  { slug: 'surgery', name: 'Surgery', ids: { 2023: 'surgery_test', 2024: 'surgery_test' } },
  { slug: 'obstetrics-gynaecology', name: 'Obstetrics & Gynaecology', ids: { 2023: 'obstetrics___gynaecology_test', 2024: 'obstetrics___gynaecology_test' } },
  { slug: 'community-medicine', name: 'Community Medicine', ids: { 2023: 'community_medicine', 2024: 'community_medicine_test' } },
  { slug: 'paediatrics', name: 'Paediatrics', ids: { 2023: 'paediatrics_test', 2024: 'paediatrics_test' } },
  { slug: 'ophthalmology', name: 'Ophthalmology', ids: { 2023: 'ophthalmology_test', 2024: 'ophthalmology_test' } },
  { slug: 'ent', name: 'ENT', ids: { 2023: 'ent_test', 2024: 'ent_test' } },
  { slug: 'orthopaedics', name: 'Orthopaedics', ids: { 2023: 'orthopaedics_test' } },
  {
    slug: 'minor-subjects',
    name: 'Minor Subjects',
    descriptor: 'Orthopaedics · Psychiatry · Dermatology · Radiology · Anaesthesia',
    ids: { 2024: 'minor_subjects_test__ortho_psychiatry_derma_radio_anaesthesia_' },
  },
];

// Tripwire: the census counts from the supplied file (2026-11-13). If the
// supplied file ever changes, this aborts loudly instead of silently
// shipping different tests.
const EXPECTED_COUNTS = {
  'anatomy|2023': 30, 'anatomy|2024': 30,
  'physiology|2023': 30, 'physiology|2024': 30,
  'biochemistry|2023': 30, 'biochemistry|2024': 30,
  'pathology|2023': 30, 'pathology|2024': 30,
  'microbiology|2023': 30, 'microbiology|2024': 30,
  'pharmacology|2023': 30, 'pharmacology|2024': 30,
  'forensic-medicine|2023': 30, 'forensic-medicine|2024': 30,
  'medicine|2023': 50, 'medicine|2024': 50,
  'surgery|2023': 50, 'surgery|2024': 50,
  'obstetrics-gynaecology|2023': 50, 'obstetrics-gynaecology|2024': 50,
  'community-medicine|2023': 50, 'community-medicine|2024': 50,
  'paediatrics|2023': 20, 'paediatrics|2024': 30,
  'ophthalmology|2023': 30, 'ophthalmology|2024': 30,
  'ent|2023': 30, 'ent|2024': 30,
  'orthopaedics|2023': 19,
  'minor-subjects|2024': 50,
};

const series = tests.filter((t) => t.path && t.path[0] === 'FMGE Test Series subject');
if (series.length !== 30) throw new Error(`expected 30 subject-series tests, found ${series.length}`);

const out = { subjects: [] };
let totalQ = 0;
for (const def of SUBJECT_DEFS) {
  const entry = { slug: def.slug, name: def.name, descriptor: def.descriptor || null, tests: {} };
  for (const [year, id] of Object.entries(def.ids)) {
    const t = series.find(
      (x) => x.id === id && x.path[1] === `FMGE Test Series subject Year ${year}`
    );
    if (!t) throw new Error(`source test not found: ${def.slug} ${year} (id ${id})`);
    const expected = EXPECTED_COUNTS[`${def.slug}|${year}`];
    if (t.questions.length !== expected) {
      throw new Error(`count tripwire: ${def.slug} ${year} has ${t.questions.length} questions, census says ${expected}`);
    }
    totalQ += t.questions.length;
    entry.tests[year] = {
      sourceId: t.id,
      sourceTitle: t.title,
      durationMin: t.duration,
      questions: t.questions,
    };
    console.log(`${def.slug} ${year}: ${t.title} — ${t.questions.length} Q, ${t.duration} min`);
  }
  out.subjects.push(entry);
}
if (totalQ !== 1059) throw new Error(`expected 1059 questions total, got ${totalQ}`);

const dir = join(root, 'src', 'data', 'subjects-src');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'source.json'), JSON.stringify(out));
console.log(`vendored ${out.subjects.length} subjects / 30 tests / ${totalQ} questions -> src/data/subjects-src/source.json`);
