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
carries a **Question Bank**: 13,934 questions across all 19 subjects
(15,607 until 2026-11-19, when 1,673 questions whose essential image is
missing from this edition were removed — see the V4.1 note below),
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

## Advertising (2026-11-15, founder decision)

- Google AdSense, **homepage only**. The landing page carries up to two
  responsive display units (mid-page and above the footer); every test,
  practice, analysis and library page stays ad-free by design, and the
  root layout never loads the AdSense script.
- Configuration lives in `src/lib/ads.ts` (publisher ID + slot IDs). The
  real publisher ID was set on 2026-11-15, so the AdSense loader now
  ships on the homepage; the slot IDs stay empty until ad units are
  created after Google's site approval, so no ad unit renders yet.
- The privacy policy at `/privacy` discloses the AdSense arrangement
  (Google/third-party cookies, personalised vs non-personalised ads,
  opt-out links). `public/ads.txt` ships with the matching template line.
- CSP: resolved 2026-11-15. `public/_headers` keeps the strict,
  security-audited policy (`script-src 'self'`) as the global rule for
  every page, and adds a homepage-scoped (`/`) rule whose CSP extends
  only `script-src` / `frame-src` / `img-src` / `connect-src` with
  Google's ad domains — so the AdSense loader can run on the landing
  page while all other pages keep the strict policy unchanged.
- AdSense readiness (2026-11-15): everything a reviewer needs is in
  place — the AdSense code ships on the homepage, `public/ads.txt`
  carries the publisher line, the `/privacy` policy discloses the
  arrangement and is linked from the footer alongside `/about` and
  `/naitik-library`, the CSP extension is scoped to the homepage only,
  `public/robots.txt` allows all crawlers (Googlebot and
  Mediapartners-Google named explicitly) and points to
  `public/sitemap.xml`, which lists the site's 56 public routes (home,
  about, privacy, library, entry pages, 12 papers, 16 subject pages,
  19 question-bank subjects). Smoke section 13 pins all of it.

## V4 — Test Series, 8-part analysis, overhaul & SEO (2026-11-16)

- **MedSetu Test Series**: 30 grand tests × 300 questions at `/tests`
  — each a full FMGE paper in two parts of 150, measured against the
  real pass mark of 150 — generated by `scripts/build-test-series.mjs`
  (seeded, reproducible) from the question bank + book-paper PYQs in
  the exact NBEMS blueprint per 300. 9,000 questions, zero repeats
  across the series, all 697 of the bank's 697 topics touched. **Every series question carries a `learning`** —
  a short point extracted from its own explanation, shown in the
  solution view and in the printed answer key. Series attempts use the
  shared runner/analysis with the 50% (75/150) benchmark.
- **Analysis is eight parts everywhere** (web + print), modelled on
  the MathonGo/Quizrr report structure: 1 Overview, 2 Performance
  Analysis (subject breakdown table), 3 Score Potential (incl.
  error-reduction tiles), 4 Attempt Analysis (Perfect / Overtime /
  Confused / Wasted / Painful, rules published in `src/lib/classes.ts`,
  each label shows its reason), 5 Time Analysis, 6 Topic Analysis,
  7 Question Journey (changes with gain/loss, revisits, marked),
  8 Qs by Qs Analysis + answer key. MathonGo's cohort-based Difficulty
  section is deliberately NOT imitated — MedSetu has no cohort and
  never fabricates one; Topic Analysis stands in its place. The print
  report mirrors the same structure with a Contents page.
- **Site overhaul**: header carries a trust strip (Naitik Library ·
  Gautam Nagar · free/no sign-up) and, once entered, all four practice
  sections plus Privacy and Contact; footer is three link columns
  (Practise / MedSetu / Policies) with the disclaimer and the v4 line.
  New pages: `/contact`, `/terms`, `/disclaimer`. Homepage gained a
  "Four ways to practise" section, the official NBEMS weightage table,
  a visible FAQ, and refreshed copy; `/papers`, `/subjects` and
  `/qbank` now open with ungated, crawlable introductions and full
  item lists above the name gate.
- **SEO / AI search**: per-page unique titles, descriptions and
  self-canonicals sitewide; OpenGraph + Twitter cards with `/og.png`;
  Organization + WebSite JSON-LD in the root layout; FAQPage and
  ItemList JSON-LD where the content is visible; sitemap regenerated
  (88 URLs — gate pages removed, test series + trust pages added,
  honest lastmod); session routes (runners, analyses, gates, qbank
  play) are `noindex`; robots.txt explicitly welcomes AI search
  crawlers (OAI-SearchBot, PerplexityBot, ClaudeBot, GPTBot);
  `public/llms.txt` published; immutable year-long cache headers for
  `/_next/static` and the image directories. Smoke section 14 pins
  the V4 invariants.

## V4.1 — Missing-image exclusion (2026-11-19, founder report)

Founder screenshot: a Question Bank practice question ("Match List I
with List II", Medicine · Hypertension) showed the "image not included
in this edition" note — the lists themselves were the missing image, so
the question could not be attempted at all. Audit found every wired
image (2,088 QBank stem figures, 350 subject-test figures, 672 paper
figures) serving correctly; the problem was the 1,655 bank questions
whose stem figure sits on assets.corebtr.com (HTTP 403, unrecoverable —
see QBANK-REPORT.md) plus 20 whose options are image URLs.

Rule now in `scripts/qbank.mjs`: a question whose essential image
content is missing (stem figure undownloaded, or any option an image
URL) does NOT ship in the bank. 1,673 excluded (1,654 stem + 20 option,
1 counted in both). One hand-verified exception, qb-7ce3ee9ce5
(Physiology osmosis — stem fully self-contained in text). Bank:
15,607 → **13,934 questions, 697 topics** (Anatomy "Cadaveric Sections"
and Community Medicine "Biostatistics" were 100% image-dependent and
are gone). The Test Series was regenerated from the cleaned pools
(`build-test-series.mjs` also filters `q.img` from the PYQ pool):
9,000 questions, zero repeats, 697/697 topics, exactly ONE
missing-image question in the whole series (the keeper). Tests 1–29
follow the NBEMS blueprint exactly; **Test 30** fills 13 Physiology
slots with Medicine questions (the cleaned Physiology pool holds 497
unique questions against 510 slots — a dataset limit, disclosed here
and in TEST-SERIES-REPORT.md). Papers keep their recall-edition notes
(133 questions) — a paper's contents are not edited. Smoke pins the
new baselines (bank total 13,934, topic hash, exclusion count 1,673,
no missing-image questions shipped).

## V5 — Blog (2026-11-24)

150 original articles in src/data/blog/ across 9 categories (FMGE preparation, subject guides, books & resources, notes & revision, colleges & MBBS abroad, research explained, exam skills & mindset, career, clinical skills), each with meta title/description, canonical, OG/Twitter, BlogPosting + Breadcrumb + FAQPage JSON-LD, FAQ section, practice CTA and related posts. /blog index + /blog/[slug] pages; header/footer links; sitemap grew 88 → 239 URLs. Accuracy law held: verified FMGE facts only, no invented statistics/fees/rankings, no competitor brands. Validator: ~/workspace/medsetu-data/blog/validate.mjs (all pass; residual flags hand-verified false positives).

## V6 — Short Notes, Flashcards & Mind Maps + homepage repositioning (2026-11-24)

- NEW /notes + /notes/[subject] for all 19 subjects: rapid-revision short notes built backwards from 5 years of FMGE PYQ evidence (per-subject briefs in ~/workspace/medsetu-data/notes-research/briefs/, from the 12 papers + bank topic weights; coaching rapid-revision PDFs supplied by the founder guided topic emphasis — all wording original). Each subject: 9–14 topics (crisp fact points, comparison tables, "Remember this line", marked exam traps), night-before golden points, and a one-screen mind map (src/components/MindMap.tsx). 2,064 note points total. Data: src/data/notes/<slug>.json via src/lib/notes.ts.
- NEW /flashcards + /flashcards/[subject]: 950 flashcards (exactly 50/subject), client deck (src/components/FlashDeck.tsx) — flip, Got it / Still learning sorting, still-learning re-rounds, shuffle, keyboard; state lives only in the tab.
- WEB-ONLY by design (founder order): notes/flashcards carry no download/print path — @media print hides .web-only content and shows only a pointer note (.print-note in globals.css).
- Homepage repositioned (founder order): top Naitik Library headline strip REMOVED from SiteHeader; hero = "The complete preparation platform for medical students"; "practice package / mock test platform" positioning swept sitewide (layout, about, start, contact, terms, header tagline now "Complete FMGE Preparation"); homepage modes grid now 6 cards (adds Short Notes + Flashcards); features +3 cards; FAQs +2; footer gains a "Revise & Learn" column; version line v6.
- AdSense readiness: privacy page now carries Google's required cookie sentence verbatim; ads.txt + robots (Mediapartners-Google allowed) re-verified; content depth now 150 articles + 38 revision pages + rich landings. Submission remains the founder's step (with slot creation after approval).
- Sitemap 239 → 279 URLs. Smoke section 15 added (blog count, notes/flashcards shape, hero wording, sitemap count); stale v4 baselines re-baselined. Full smoke: ALL PASS.
