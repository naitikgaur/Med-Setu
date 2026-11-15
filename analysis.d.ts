import type { PaperData, Attempt } from './types';

export interface SubjectRow {
  subject: string;
  group: 'prepara' | 'clinical';
  total: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeSec: number;
  accuracy: number;
  avgTimeSec: number;
}

export interface PerQ {
  idx: number;
  n: number;
  subject: string | null;
  added: boolean;
  fromLabel: string | null;
  fromPaper: string | null;
  status: 'correct' | 'wrong' | 'skipped';
  yours: number | null;
  correct: number;
  timeSec: number;
  visits: number;
  confidence: string | null;
  marked: boolean;
  change: { count: number; firstFrom: number; effect: 'gained' | 'lost' | 'neutral' } | null;
  img: boolean;
  hasImages: boolean;
}

export interface Analysis {
  total: number;
  score: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  timeUsedSec: number;
  perQ: PerQ[];
  hasSubjects: boolean;
  subjects: SubjectRow[];
  strongest: SubjectRow[];
  weakest: SubjectRow[];
  tooFew: SubjectRow[];
  rollups: {
    prepara: { total: number; attempted: number; correct: number; accuracy: number; blueprint: number };
    clinical: { total: number; attempted: number; correct: number; accuracy: number; blueprint: number };
  } | null;
  buckets: { key: string; label: string; count: number; correct: number; accuracy: number }[];
  changeReport: { total: number; gained: number; lost: number; wrongToWrong: number; net: number };
  guessReport: {
    sure: { count: number; correct: number; accuracy: number };
    unsure: { count: number; correct: number; accuracy: number };
    guessed: { count: number; correct: number; accuracy: number };
    untagged: number;
    marksFromGuesses: number;
  };
  recklessness: { rushedWrong: number; rushedMarks: number; gapWrong: number };
  skipDividend: number;
  timeDetail: {
    availableSec: number;
    usedSec: number;
    avgPerAttempted: number;
    timeOnCorrect: number;
    timeOnWrong: number;
    avgOnCorrect: number;
    avgOnWrong: number;
    fastest: { idx: number; n: number; timeSec: number; status: string; subject: string | null }[];
    slowest: { idx: number; n: number; timeSec: number; status: string; subject: string | null }[];
  };
  rushed: { count: number; correct: number; accuracy: number };
  segments: {
    key: string; from: number; to: number; total: number; attempted: number;
    correct: number; wrong: number; skipped: number; accuracy: number;
    timeSec: number; avgTimeSec: number;
  }[];
  paceBlocks: {
    from: number; to: number; label: string; total: number; attempted: number;
    correct: number; wrong: number; skipped: number; accuracy: number;
    timeSec: number; avgTimeSec: number;
  }[];
  recoveryPools: { subject: string; lostMarks: number }[];
  topPools: { subject: string; lostMarks: number }[];
  topPoolMarks: number;
  verdict: {
    full: boolean;
    score: number;
    total: number;
    percentage: number;
    passMark: number;
    passed: boolean | null;
    gapToPass: number;
  };
  original: { total: number; correct: number; addedCount: number };
  answerKey: { n: number; correctLetter: string; yourLetter: string; status: string }[];
}

export declare const PREPARA_SUBJECTS: string[];
export declare const BLUEPRINT: { prepara: number; clinical: number; pass: number; total: number };
export declare const LETTERS: string[];
export declare function subjectGroup(subject: string | null): 'prepara' | 'clinical' | null;
export declare function analyseAttempt(
  paper: { questions: PaperData['questions']; durationMin?: number },
  attempt: Attempt
): Analysis;
