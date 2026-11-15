# MedSetu — Deployment Guide (v3)

MedSetu is a fully static website. There is no server, no database and nothing to
configure. The built site is the `out\` folder; putting that folder on Netlify makes
it live. **V3 makes MedSetu the complete FMGE practice package**: the 12
previous-year papers (PYP Tests) and the 30 subject-wise tests (V2) are joined by
a **Question Bank of 15,607 questions** across all 19 subjects, with a Practice
mode (check each answer, read the explanation at once) and an Exam mode (locked
answers, then the full analysis), plus My Mistakes and Bookmarks — all kept only
in the student's browser tab. The unzipped site is ~494 MB, most of it question
and figure images (`simg\` ~214 MB, `bimg\` ~231 MB, `qimg\` ~11 MB). Because
of the size, drag-and-drop can be slow; if it struggles, use the **Netlify CLI**
instead: install it (`npm install -g netlify-cli`), run `netlify login`, then
`netlify link` to your existing site, then `netlify deploy --prod --dir=.` from
inside the unzipped folder.

---

## Option A — Put it live with the ready-made zip (fastest)

1. Find **`medsetu-v3-netlify.zip`** (delivered with this project).
2. Unzip it anywhere on your computer. You will get a folder full of files:
   `index.html`, `about`, `paper`, `_next`, and so on. (The files must end up at the
   top level — if unzipping created one extra outer folder, open it and use the
   contents inside.)
3. Open **https://app.netlify.com** in your browser and log in (free account is fine).
4. In the left sidebar click **Sites**, then find the box that says
   **"Want to deploy a new site without connecting to Git? Drag and drop your site
   output folder here"**.
5. Drag the unzipped folder onto that box.
6. Wait a few seconds. Netlify gives you a live address like
   `random-name-12345.netlify.app`. The site is live.
7. (Optional) To rename it: **Site configuration → Site details → Change site name**,
   e.g. `medsetu`. Your address becomes `medsetu.netlify.app`.
8. (Optional) To update the site later, drag the new folder onto the same site's
   **Deploys** page. Same address, new version.

That is all. No build settings, no environment variables, no forms to fill.

## Option B — Build it yourself from source, then drag

You need Node.js 20 or newer installed (https://nodejs.org — the LTS version).

1. Unzip **`medsetu-v3-source.zip`** into a folder, e.g. `C:\medsetu`.
2. Open that folder in File Explorer. Click the address bar, type `cmd`, press Enter.
   A black command window opens in that folder.
3. Run these three commands, one at a time, waiting for each to finish:

   ```
   npm install
   npm run build
   npm run smoke
   ```

   - `npm install` downloads the libraries (2–5 minutes, first time only). It also
     prepares the paper data automatically.
   - `npm run build` creates the **`out`** folder — the finished website.
   - `npm run smoke` runs ~600 checks on the papers, the subject tests, the
     question bank, the analysis maths and the built site. It should end with
     `SMOKE: ALL CHECKS PASSED`.
4. Drag the **`out`** folder onto Netlify exactly as in Option A, steps 3–6.

If `npm install` fails with a red error about scripts or execution policy, open
PowerShell as Administrator once and run:
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then try again.

## How a student uses the site

The home page is descriptions and about only — no test list. A student clicks
**Let's Start**, lands on a short gate page, types their name, ticks
**"I'm not a robot"** and answers one small addition question (a quick human
check that runs entirely on their device — it is not a security system and
nothing is sent anywhere), then clicks **Enter**. That opens a **choice
screen** (`/choose`) with three cards: **PYP Tests** leads to the **paper
library** (`/papers`) with all 12 papers; **Subject-wise Tests** leads to
`/subjects` — 16 subjects with 30 single-subject tests; **Question Bank**
leads to `/qbank` — 15,607 questions across all 19 subjects, organised by
topic. Opening a paper or a subject test shows its details and instructions;
**Attempt Test** starts the test (the test window itself opens on the exam
instructions screen, which the student confirms before the test begins).
Papers run in two parts exactly as before; subject tests are a single part
with their own duration (e.g. 40 minutes for 30 questions), and their
analysis measures the score against the 50% mark. In the Question Bank the
student picks a subject (or Mixed practice, My Mistakes or My Bookmarks),
a topic or the whole subject, a set size (20 / 50 / All) and a mode:
**Practice mode** checks each answer as they go and shows the explanation
straight away; **Exam mode** runs the set in the same exam window at one
minute per question and ends in the same detailed analysis, measured
against the 50% mark as a benchmark. Wrong answers from either mode collect
in My Mistakes; a correct replay there clears each one. The name — and all
of this practice state — is kept only in that browser tab, exactly as
before.

## Checking the live site (2 minutes)

1. Open the Netlify address. You should see the MedSetu home page describing
   the site — with a **Let's Start** button and no test list.
2. Click **Let's Start**. On the gate page, type your name, tick
   **I'm not a robot**, answer the addition question, and click **Enter**.
3. A choice screen opens. Click **Previous Year Papers** — the paper
   library opens with all 12 papers. Open **FMGE December 2021** and click
   **Attempt Test**.
4. Confirm the instructions, answer 2–3 questions, press **Submit Part I**,
   then **Start Part II**, answer one question, press **Submit Part II**.
5. Your analysis page should open with a score, charts and a review queue.
6. Click **Download full report (PDF)** — a print window opens; choose
   **Save as PDF**. Same for **Download answer key (PDF)**.
7. Go back to the choice screen (or use the **Subject-wise Tests** link in
   the header), open **Anatomy → Test 1**, and click **Attempt Test**: the
   instructions should say 30 questions and 40 minutes, with no Part II.
   Answer a few questions, submit, and check the analysis shows the score
   against the 50% mark.
8. From the choice screen open **Question Bank → Anatomy**, keep **Practice
   mode** and **20**, and start the first topic. Answer one question wrongly
   on purpose and press **Check answer**: the correct option, your result
   and the full explanation should appear, and the question should be saved
   in **My Mistakes**. End the session, check the summary, then open **My
   Mistakes** from the Question Bank home, replay the question with the
   correct answer, and confirm the mistakes count drops to zero.

## How to add a new paper later (e.g. the next FMGE session)

Papers are data, not code. A paper file is JSON with this shape (see any file in
`src\data\raw\`):

```json
{
  "paperId": "dec-2026",
  "label": "December 2026",
  "session": "December 2026 session",
  "examDate": "…",
  "questions": [
    { "n": 1, "subject": "Anatomy", "text": "…", "options": ["…","…","…","…"],
      "correct": 0, "explanation": "…" }
  ]
}
```

Steps:

1. Put the new file in `src\data\raw\` (name it exactly `<paperId>.json`).
   Questions whose options were images or are missing can be marked
   `"broken": true` — the site excludes them and discloses the drop count
   automatically. Questions with no subject/explanation (like the 2026 recalls)
   are handled honestly: subject analysis is simply not shown for that paper.
2. In `scripts\prepare-data.mjs`: add the paperId to the `ORDER` list and add its
   real-session pass percentage to `PASS_PCT` (from the NBEMS result notice —
   never guess this number; if unknown, leave it out and no context box is shown).
3. In `src\lib\papers.ts`: add one line to the `loadPaper` switch:
   `case 'dec-2026': return (await import('../data/papers/dec-2026.json')).default as unknown as PaperData;`
4. Run `npm run build`, then `npm run smoke` (update the `EXPECTED` counts in
   `scripts\smoke.mjs` for the new paper first).
5. Drag the new `out` folder onto your existing Netlify site's **Deploys** page.

## What is inside the source

| Folder / file | What it is |
|---|---|
| `src\app\` | Pages: home (descriptions/about), start gate, choice screen, paper library, subject library, question bank (home, per-subject, play, analysis), about, paper/subject pages, test, analysis |
| `src\components\` | Test runner (two-part papers + single-part subject tests), analysis view, print (PDF) views, header/footer, donate block, entry guard |
| `src\lib\analysis.js` | The scoring & analysis maths — pure functions, unit-tested by the smoke script |
| `src\lib\gate.js` | The entry gate's human-check logic — pure functions, unit-tested by the smoke script |
| `src\lib\papers.ts` / `src\lib\subjects.ts` | Paper / subject-test loading (each downloads only when opened) |
| `src\lib\qbank.ts` | Question-bank loading (per-subject chunks, on demand) + the tab-only session/mistakes/bookmarks/progress stores |
| `src\data\qbank-src\` | The three vendored question-bank sources (extracted by `scripts\qbank-import.mjs`) + the image download map |
| `src\data\qbank\` | Processed bank chunks, one per subject (generated by `scripts\qbank.mjs` inside `prepare-data.mjs`; audit trail in `qbank-report.json`) |
| `scripts\qbank-images.mjs` / `scripts\qbank-shrink.py` | The checkpointed bank-image downloader (resumable) and the WebP recompressor used to fit this machine's disk quota |
| `src\data\raw\` | The 12 extracted paper datasets, as supplied |
| `src\data\papers\` | Processed papers (generated by `scripts\prepare-data.mjs` at build time) |
| `src\data\subjects-src\source.json` | The vendored subject-test source (only the ordered series), extracted by `scripts\subjects-import.mjs` |
| `src\data\subjects\` | Processed subject tests (generated by `scripts\subjects.mjs` inside `prepare-data.mjs`; audit trail in `subject-tests-report.json`) |
| `scripts\smoke.mjs` | ~600 automated checks: data integrity, subject-test audit, question-bank audit, analysis maths, gate logic, built-site completeness |

## Paper completion (top-up)

Some recall sources are short of 300 questions (four book papers end at 294–298 in
the source itself; the 2026 recalls have 286 and 258 usable questions). So that every
mock is a full-size FMGE test, the build completes each short paper to 300 with
questions taken from other years' papers in the library (`scripts\topup.mjs`, run
automatically by the data-prep step). Added questions are chosen by subject-weightage
equalisation toward the official NBEMS blueprint, never duplicate a question already
in the paper, and each carries its source paper — it is flagged "Added · from …" in
the review. The audit trail is written to `topup-report.json` in the project root on
every build, and the smoke test verifies the completion on every run.

## The no-data promise (how it is kept)

Everything a student types — name, answers, timings — is kept in the browser's
`sessionStorage` on their own device and is erased when the tab closes. The site
makes no network calls except loading its own pages and paper files. There are no
accounts, no analytics and no tracking code anywhere in the project, so there is
nothing to leak and nothing to maintain.
