# MedSetu

**by Naitik Library**

🌐 Live: https://med-setu.netlify.app/

---

## What MedSetu is

MedSetu is a **free study package for medical students**, built and run by
**Naitik Library** — a study hall for medical students in Gautam Nagar,
New Delhi, founded by **Naitik Gaur**.

It began with one exam and one problem. FMGE (Foreign Medical Graduate
Examination) aspirants had no honest, free way to practise previous-year
papers the way the real exam actually runs. MedSetu gives them that — and
is growing, piece by piece, into a **complete study package for medical
students**: real questions, real explanations, real figures, serious
analysis, and nothing to pay, ever.

No accounts. No database. No student's data is stored anywhere — a student
opens the site, writes their name, studies, downloads their report, and
leaves nothing behind.

---

## What's inside today

### 1. PYP Tests — previous-year FMGE papers as full mock tests
- **12 papers, 2020–2026**, every paper completed to the full **300 questions**
- Run in a faithful recreation of the real exam window: Part A 150 + Part B 150,
  150 minutes per part, **+1 for a correct answer, no negative marking,
  pass at 150/300**
- Full answer key with explanations, and a detailed, data-first analysis:
  accuracy, time per question, answer-change behaviour, confidence tracking,
  subject-wise strengths and weaknesses
- The complete analysis and answer key can be **downloaded and printed**

### 2. Subject-wise Tests
- **30 tests across 16 subjects — 1,059 questions**, every one with its
  explanation
- One subject, one sitting, exam conditions, measured against the 50% mark
- **Every question figure is included** — image questions are real image
  questions, not text descriptions of a picture

### 3. Question Bank
- **15,607 questions across all 19 FMGE subjects**, organised subject →
  topic, in sets of 20 / 50 / all — including previous AIIMS, INI-CET and
  NEET-PG questions filed by topic
- **Practice mode** — answer, check instantly, read the full explanation
  (including why the other options are wrong)
- **Exam mode** — locked answers in the exam window, then the same detailed
  analysis as the tests
- **My Mistakes** — wrong answers collect automatically; replay them until
  they're right
- **Bookmarks** and **Mixed practice** across subjects
- Question figures: **100% included**. Explanation figures are included
  wherever they could be obtained; any that could not are marked honestly
  in place — never silently dropped, never replaced with a look-alike

### The analysis (common to everything)
Score and verdict against the real pass line, accuracy by subject and by
section, time and pace breakdowns, rushed questions, the net effect of
changed answers, confidence vs. correctness — presented as numbers, charts
and tables a student can act on. **MedSetu never shows a rank or
percentile**: with no real cohort behind it, any such number would be
invented, and this site does not invent numbers.

---

## How a student uses it

1. Open the site, read what each section offers
2. Tap **Let's Start**, enter a name (kept only in that browser tab)
3. Choose: **PYP Tests**, **Subject-wise Tests**, or **Question Bank**
4. Attempt in the exam window → read the analysis → download the report

---

## The principles it is built on

- **Free for students. Always.** MedSetu exists because Naitik Library
  exists — to help students prepare, not to sell them a course.
- **No data is kept.** There is no server and no database behind the site.
  Names, attempts, mistakes and bookmarks live only in the student's own
  browser tab and vanish when it closes.
- **Honesty over polish.** Real questions with their real explanations and
  real figures. Where something could not be obtained, the site says so on
  the spot instead of covering it up. No fake statistics, no testimonials,
  no invented ranks.
- **The exam as it actually is.** The test window, timings, marking scheme
  and pass line mirror the real FMGE pattern published by NBEMS.
- **Everything under one roof.** Papers, subject tests, a question bank
  and serious analysis — one package, one place, in the student's own
  language of study.

---

## Where this is going

MedSetu's direction is set: **the complete study package for medical
students.**

- **Deeper FMGE coverage** — completing the figure library (including the
  2026 papers' figures), more questions, more revision tools built on the
  same no-data, no-nonsense rules
- **Beyond one exam** — the bank already carries AIIMS, INI-CET and
  NEET-PG questions by topic; the package grows towards serving medical
  students across their whole preparation, not a single test
- **Study material, not just tests** — the long-term shape is a student's
  full companion: learn, practise, analyse, revise

What will not change on the way: free, private by design, and honest about
what it contains.

---

## A note on content

NBEMS does not officially release FMGE question papers or answer keys, so
the previous-year papers here are the widely circulated memory-based
recall editions, completed and cross-checked question by question.
Explanations are the source material's own, carried in full. Figures are
the questions' real figures, shipped inside the site — nothing is
hotlinked, and nothing is substituted.

---

## Technical overview

- **Stack:** Next.js (static export), TypeScript, Tailwind CSS
- **Hosting:** Netlify — the built site is the `out/` folder; there is no
  backend, no API and no database to run or maintain
- **Student state:** browser `sessionStorage` only
- **Build & deploy:** see `DEPLOYMENT.md`
- **Product definition:** see `PRODUCT.md`

```
src/
  app/          pages: home, start gate, choose, papers, subjects,
                question bank, analysis, about, naitik-library
  components/   exam runner, practice runner, analysis views, print views
  data/         papers (12 × 300), subject tests, question bank chunks,
                and the local image libraries (qimg / simg / bimg)
scripts/        data pipelines, image downloaders, and the smoke-test
                suite that verifies every build end to end
```

Every release is verified before it ships: content counts, answer-key
integrity, image completeness (every referenced figure present on disk),
brand and privacy invariants, and full click-through tests of the student
flow.

---

## About Naitik Library

Naitik Library is a study hall for medical students in **Gautam Nagar,
New Delhi**, founded by **Naitik Gaur**. MedSetu is its effort extended
online — for the students who cannot come and sit in the hall.

- 📞 Contact: **8920922167**
- 💛 Support the effort (UPI): **naitikdev@fam**

---

*MedSetu — made by the efforts of Naitik Library, to help students prepare
for their exams, for free.*
