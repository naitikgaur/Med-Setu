# MedSetu — Product Context

_Written 2026-11-12 during the Impeccable polish pass, derived from the
founder's brief and `~/workspace/medsetu-data/REDESIGN-RESEARCH.md` (the
research the current frontend was built on). No interview was possible in
this pass; this file records the standing product truth so future passes
don't re-derive it._

## What it is

MedSetu is a free, static website — the complete FMGE practice package.
FMGE (Foreign Medical Graduate Examination) aspirants sit previous-year
papers as full mock tests in the real exam manner — two parts of 150
questions, 150 minutes per part, +1 / 0 marking, pass at 150/300 — and
then read a detailed analysis with the complete answer key and the book's
explanations. Since v2 it also carries **subject-wise tests**: 30 tests
across 16 subjects (19–50 questions, one subject, one sitting, the source
test's own duration), each with a full explanation per question and the
same detailed analysis, measured against the 50% mark. Since v3 it also
carries a **Question Bank**: 15,607 questions across all 19 subjects,
organised by topic, every one with its answer and explanation, practised
question by question in a Practice mode (check + explanation at once) or
an Exam mode (locked answers, then the same analysis), with My Mistakes
and Bookmarks kept in the tab for revision. It is an effort of
**Naitik Library** (a study hall for medical students in Gautam Nagar,
New Delhi, founded by Naitik Gaur), extended online for students who
cannot come in person.

## Audience

FMGE aspirants — foreign medical graduates preparing for a high-stakes
licensing exam. They are time-poor, anxious about the pass line, and
practised at spotting dishonest ed-tech. They study on phones and
laptops, often on modest connections. The interface must feel like a
clinical instrument, not a sales page.

## Product truths (locked)

- 12 papers, 2020–2026, every paper completed to the full 300 questions;
  completion questions are provenance-flagged everywhere they surface
  after the test.
- No accounts, no server, no analytics. A student's name and answers live
  only in their browser tab (sessionStorage); nothing is collected.
- Verdict is PASS / NOT YET against the fixed 150 mark, plus the
  "own questions only" sub-line on completed papers. **No rank, no
  percentile, ever** — there is no cohort, and inventing one would be
  dishonest.
- Papers are recall-based editions; that is stated plainly wherever it
  matters. Explanations are the book's, word for word.
- The flow is gated by intent: the home page only describes MedSetu. A
  visitor clicks "Let's Start", gives a name and passes a small human
  check (an "I'm not a robot" checkbox plus one arithmetic question,
  generated and checked on the device, honestly labelled — it is a
  ritual of intent, not a security control) to reach a choice screen:
  **PYP Tests** (the paper library), **Subject-wise Tests** or the
  **Question Bank**. The name still lives only in sessionStorage; the
  gate collects nothing.
- Subject-wise tests (v2): years are never displayed (tests are "Test 1"
  and "Test 2"); each test's two source sets exchange exactly 5 questions
  (deterministic, verified by stem hash) and counts never change; option
  order is permuted only where no explanation reference can go stale,
  with the explanation's "Correct answer" lead rewritten to match.
  Verdict is a benchmark — at/above or below the **50% mark** (the FMGE
  pass proportion) — never an official pass. Source images ship as local
  files with the site (downloaded in the v2 image update); any individual
  image that could not be recovered says so where it applies.
- Question bank (v3): three published compilations merged into one bank
  by a deterministic pipeline — dedupe by normalised stem hash (+ stem
  image, which is part of a figure question's identity); the richest
  record wins; **60 question keys whose sources disagreed on the correct
  answer were excluded, never guessed**. Subjects are the 19 canonical
  FMGE subjects; topics are the sources' own groupings. Sets are built
  deterministically (topic sets in source order; subject/mixed sets
  interleaved across topics). Practice mode records mistakes and
  per-subject progress in sessionStorage; Exam mode records them when
  the analysis opens; both say "kept only in this tab". Bank verdicts
  use the same 50% benchmark language — a bank set has no official pass.
  Images: stem figures are local files (99.9% of stem-image URLs at
  delivery); explanation images are partially local (19% of URLs) — the
  rest show the honest not-included note, and the checkpointed
  downloader (`scripts/qbank-images.mjs`) can fetch the remainder when
  disk space allows. Oversized images were recompressed to WebP q85 to
  fit the build machine's disk quota (same figures, smaller bytes).
- The analysis (all three kinds) is data, not prose: accuracy breakdown,
  parts/halves and pace blocks, time detail (correct vs wrong averages,
  fastest/slowest, rushed <10 s), confidence table, answer-change table,
  gap-to-target — all computed from the attempt log on the device.
- Contact: 8920922167 only. Donations (voluntary): UPI naitikdev@fam.
- Brand lockup: **MedSetu** in large type, "by Naitik Library" in small
  type beneath/beside it, everywhere the brand displays.

## Visual world (locked direction)

Clinical medical system, researched from the product UIs of Marrow,
PrepLadder, eGurukul and Quizrr reports (see REDESIGN-RESEARCH.md):

- White / very light blue-grey surfaces (`#F4F7F9`), 1px borders over
  shadows, small radii, 8px spacing rhythm.
- One hue: deep petrol-teal `#006D77`. One sparing amber `#B45309`,
  reserved for Donate. Green/red only as data semantics.
- Inter, sentence-scale headlines — numbers are the largest type in the
  analysis, not headlines.
- The exam window is a separate, faithful world: the TCS iON candidate
  interface (blue header, marks strip verbatim, five palette shapes,
  TCS button order). It is not restyled to the site theme.
- Anti-references: marketing gloss, gradients, coupons/countdowns,
  giant display type, editorial parchment look, gamification chrome,
  multi-hue rainbows, invented social proof.

## Modes

- Landing / About / Naitik Library: **Persuade** (restrained) + **Read**.
- Paper pages, exam window, break/submit: **Operate**.
- Analysis + solutions: **Read/Operate** — the student's own data gets
  the most space; every section opens with one sentence saying why it
  matters.
