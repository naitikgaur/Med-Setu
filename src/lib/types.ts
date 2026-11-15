export interface Question {
  n: number;
  subject: string | null;
  // Question-bank questions carry their stable bank id (mistakes /
  // bookmarks / progress are keyed by it) and their source topic.
  bankId?: string;
  topic?: string;
  text: string;
  options: string[];
  correct: number; // 0-3
  explanation: string;
  // img = the stem references an image that could not be recovered from the
  // source (drives the "image not available" note). Recovered book figures
  // are in `images`; questions whose options are pictures carry `optionImages`.
  img: boolean;
  images?: string[];
  optionImages?: string[];
  // Subject-wise tests only: the source explanation itself referenced
  // image(s). Those images are recovered as local files and shipped in
  // `explBlocks`; `explImg` stays true as the "source referenced image(s)"
  // marker. Spots whose image could not be recovered keep the honest note
  // via an `imgMissing` block.
  explImg?: boolean;
  // Subject-wise tests only: the explanation as ordered blocks — the text
  // itself ({ t: 'text' }, rendered from `explanation`) interleaved with the
  // recovered images in the source's order ({ t: 'img' }) and honest
  // placeholders for any image that could not be recovered
  // ({ t: 'imgMissing' }). The source stores explanation images as a list
  // appended after the text (its own viewer renders them the same way), so
  // the text block comes first, then the images in order.
  explBlocks?: ExplBlock[];
  // Completion provenance: set only on questions added from another year's
  // paper to complete a short paper to 300 (see scripts/topup.mjs).
  added?: boolean;
  fromPaper?: string;
  fromLabel?: string;
  fromN?: number;
}

/** One block of a subject-test explanation (see Question.explBlocks). */
export type ExplBlock =
  | { t: 'text' }
  | { t: 'img'; src: string }
  | { t: 'imgMissing'; count: number };

export interface PaperData {
  paperId: string;
  label: string;
  session: string;
  examDate: string;
  questions: Question[];
}

export interface PaperMeta {
  paperId: string;
  label: string;
  session: string;
  examDate: string;
  sourceTotal: number;
  total: number;
  ownTotal: number; // this paper's own playable questions
  addedCount: number; // questions added from other years to complete to 300
  addedBySubject: Record<string, number>;
  addedFrom: { paperId: string; label: string; count: number }[];
  dropped: number;
  part1: number;
  part2: number;
  imgCount: number; // questions whose stem references an image
  imgMatched: number; // of those, how many had their book figure recovered
  imgUnmatched: number; // imgCount - imgMatched
  hasSubjects: boolean;
  hasExplanations: boolean;
  subjectsPresent: { subject: string; count: number }[];
  passPct: { pct: number; approx: boolean } | null;
}

// ---- subject-wise tests (V2) ----------------------------------------------
export interface SubjectTestEntry {
  testNo: number; // 1 | 2 (never a year — years are not shown anywhere)
  testId: string; // e.g. 'anatomy-test-1'
  total: number;
  durationMin: number; // the source test's own duration
  imgCount: number; // questions whose stem references a source image
  imgMatched: number; // of those, how many ship the recovered figure locally
  explImgCount: number; // questions whose source explanation had image(s)
  explImgMatched: number; // of those, how many ship every explanation image
  explImgUnmatched: number; // questions with >= 1 unrecovered explanation image
  swappedIn: number; // build detail, not displayed
}

export interface SubjectMeta {
  slug: string;
  name: string;
  descriptor: string | null; // e.g. Minor Subjects' composition
  tests: SubjectTestEntry[];
}

export interface SubjectTestData {
  testId: string;
  slug: string;
  subject: string;
  testNo: number;
  durationMin: number;
  questions: Question[];
}

/** The minimal shape the runner/analysis/print components consume. */
export interface TestData {
  questions: Question[];
  durationMin?: number; // subject tests carry their own duration
}

/**
 * One normalised description of a runnable test — a previous-year paper or
 * a subject-wise test — so the runner, analysis and print views stay
 * identical in behaviour while labels, durations and routes adapt.
 */
export interface TestDescriptor {
  id: string; // attempt storage key + data id
  kind: 'paper' | 'subject' | 'qbank';
  // For benchmarked (non-paper) tests: the sentence under the verdict
  // explaining what the 50% line means for this kind of test.
  benchmarkNote?: string;
  heading: string; // 'FMGE December 2021' | 'Anatomy — Test 1'
  subline: string; // analysis/print context line (session, or test facts)
  total: number;
  part1Count: number; // == total for subject tests
  part2Count: number; // 0 for subject tests
  singlePart: boolean;
  part1Sec: number;
  part2Sec: number;
  part1Min: number; // minutes shown for part 1 / the whole subject test
  detailHref: string; // paper page | subject page
  detailLabel: string; // 'Go to the paper page' | 'Go to the subject page'
  analysisHref: string;
  backHref: string; // analysis back link target
  backLabel: string; // 'Paper library' | 'Subject-wise tests'
  addedCount: number; // PYP completion questions (0 for subject tests)
  passPct: { pct: number; approx: boolean } | null; // papers only
  singleSubject: string | null; // subject name for subject tests
  testLabel: string | null; // 'Test 1' | 'Test 2' for subject tests
}

// ---- question bank (V3) ---------------------------------------------------

export interface QBankTopicMeta {
  name: string;
  count: number;
}

export interface QBankSubjectMeta {
  slug: string;
  name: string;
  total: number;
  imgCount: number; // questions whose stem references an image (recovered or noted)
  topics: QBankTopicMeta[];
}

export interface QBankMeta {
  total: number;
  subjects: QBankSubjectMeta[];
  images: { referenced: number; covered: number };
}

export interface QBankData {
  subject: string;
  slug: string;
  questions: Question[];
}

export type QBankMode = 'practice' | 'exam';
export type QBankScope = 'subject' | 'topic' | 'mixed' | 'mistakes' | 'bookmarks';

/**
 * One question-bank session, kept in sessionStorage. The play page rebuilds
 * everything (descriptor, question list) from this definition; the question
 * ids are bank ids in play order.
 */
export interface QBankSessionDef {
  v: 1;
  id: string; // attempt storage key for exam mode
  mode: QBankMode;
  scope: QBankScope;
  subjectSlug: string | null;
  subjectName: string | null;
  topic: string | null;
  refs: { id: string; slug: string }[]; // bank id + owning subject, in play order
  total: number;
  startedAt: number;
  heading: string;
  subline: string;
}

/** Practice-mode working state (its own shape; exam mode uses Attempt). */
export interface QBankPracticeState {
  sessionId: string;
  idx: number;
  picked: Record<number, number>;
  revealed: Record<number, boolean>;
  timeSec: Record<number, number>;
  visits: Record<number, number>;
  startedAt: number;
  finished: boolean;
}

export type Confidence = 'sure' | 'unsure' | 'guessed';

export interface ChangeEvent {
  q: number; // global question index (0-based, across both parts)
  from: number;
  to: number;
}

export type Phase = 'part1' | 'break' | 'part2' | 'done';

export interface Attempt {
  paperId: string;
  name: string;
  startedAt: number; // epoch ms
  finishedAt: number | null;
  phase: Phase;
  // Set once the candidate has read the exam instructions and clicked
  // "I am ready to begin" (the part timer does not run before this).
  // Optional so attempts saved by earlier versions still load.
  instructionsSeen?: boolean;
  current: number; // global index of the question on screen
  answers: Record<number, number>; // committed answers (option index)
  marked: Record<number, boolean>;
  confidence: Record<number, Confidence>;
  timeSec: Record<number, number>; // accumulated seconds per question
  visits: Record<number, number>;
  changes: ChangeEvent[];
  part1Remaining: number; // seconds left in Part I (saved for resume)
  part2Remaining: number;
  part1Summary: { answered: number; marked: number; total: number } | null;
}
