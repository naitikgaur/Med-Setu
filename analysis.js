// MedSetu analysis engine — pure functions, no DOM, no storage.
// Unit-tested by scripts/smoke.mjs. Everything here is deterministic
// arithmetic on the attempt event log; nothing is estimated except the
// skip dividend, which is labelled a statistical expectation wherever shown.

// Official NBEMS blueprint groups (Information Bulletin, Ch. 12).
// These are weightage groups, NOT the Part I / Part II split.
export const PREPARA_SUBJECTS = [
  'Anatomy',
  'Physiology',
  'Biochemistry',
  'Pathology',
  'Microbiology',
  'Pharmacology',
  'Forensic Medicine',
];
export const BLUEPRINT = { prepara: 100, clinical: 200, pass: 150, total: 300 };

export const LETTERS = ['A', 'B', 'C', 'D'];

export function subjectGroup(subject) {
  if (!subject) return null;
  return PREPARA_SUBJECTS.includes(subject) ? 'prepara' : 'clinical';
}

function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

/**
 * @param {object} paper  processed paper { questions: [...] }
 * @param {object} attempt attempt state (answers/timeSec/visits/confidence/changes)
 * @returns full analysis object used by the analysis page and print views
 */
export function analyseAttempt(paper, attempt) {
  const qs = paper.questions;
  const total = qs.length;
  const full = total === 300;
  const answers = attempt.answers || {};
  const timeSec = attempt.timeSec || {};
  const confidence = attempt.confidence || {};

  // Answer-change trail per question (for the solution view): how many times
  // the saved answer changed, what it first was, and whether the changes
  // gained a mark, lost a mark, or were neutral overall.
  const changeByQ = new Map();
  for (const ev of attempt.changes || []) {
    const prev = changeByQ.get(ev.q);
    if (prev) {
      prev.count += 1;
      prev.lastTo = ev.to;
    } else {
      changeByQ.set(ev.q, { count: 1, firstFrom: ev.from, lastTo: ev.to });
    }
  }

  const perQ = qs.map((q, i) => {
    const yours = answers[i] ?? null;
    const status = yours === null ? 'skipped' : yours === q.correct ? 'correct' : 'wrong';
    const ch = changeByQ.get(i);
    let change = null;
    if (ch) {
      const wasRight = ch.firstFrom === q.correct;
      const isRight = ch.lastTo === q.correct;
      change = {
        count: ch.count,
        firstFrom: ch.firstFrom,
        effect: !wasRight && isRight ? 'gained' : wasRight && !isRight ? 'lost' : 'neutral',
      };
    }
    return {
      idx: i,
      n: q.n,
      subject: q.subject ?? null,
      added: !!q.added,
      fromLabel: q.fromLabel ?? null,
      fromPaper: q.fromPaper ?? null,
      status,
      yours,
      correct: q.correct,
      timeSec: timeSec[i] || 0,
      visits: (attempt.visits && attempt.visits[i]) || 0,
      confidence: confidence[i] || null,
      marked: !!((attempt.marked || {})[i]),
      change,
      img: !!q.img,
      hasImages: Array.isArray(q.images) && q.images.length > 0,
    };
  });

  const attempted = perQ.filter((r) => r.status !== 'skipped');
  const correct = perQ.filter((r) => r.status === 'correct');
  const wrong = perQ.filter((r) => r.status === 'wrong');
  const skipped = perQ.filter((r) => r.status === 'skipped');
  const score = correct.length; // +1 per correct, no negative marking
  const timeUsedSec = perQ.reduce((s, r) => s + r.timeSec, 0);

  // ---- subjects ------------------------------------------------------------
  // Subject analysis is only meaningful when the paper's OWN questions are
  // tagged. Completion questions borrowed into the 2026 recalls are tagged,
  // but the recalls' own questions are not — so they must not switch this on.
  const hasSubjects = qs.some((q) => q.subject && !q.added);
  const subjectMap = new Map();
  if (hasSubjects) {
    for (const r of perQ) {
      if (!r.subject) continue;
      if (!subjectMap.has(r.subject)) {
        subjectMap.set(r.subject, {
          subject: r.subject,
          group: subjectGroup(r.subject),
          total: 0,
          attempted: 0,
          correct: 0,
          wrong: 0,
          skipped: 0,
          timeSec: 0,
        });
      }
      const s = subjectMap.get(r.subject);
      s.total += 1;
      s.timeSec += r.timeSec;
      if (r.status === 'correct') { s.correct += 1; s.attempted += 1; }
      else if (r.status === 'wrong') { s.wrong += 1; s.attempted += 1; }
      else s.skipped += 1;
    }
  }
  const subjects = [...subjectMap.values()]
    .map((s) => ({
      ...s,
      accuracy: pct(s.correct, s.attempted),
      avgTimeSec: s.attempted ? Math.round((s.timeSec / s.total) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total || a.subject.localeCompare(b.subject));

  // Strongest / weakest: Amendment B — rank only subjects with >= 8 attempted;
  // the rest are listed separately as "too few questions to judge".
  const rankable = subjects.filter((s) => s.attempted >= 8);
  const tooFew = subjects.filter((s) => s.attempted < 8 && s.attempted > 0);
  const byAccuracy = [...rankable].sort(
    (a, b) => b.accuracy - a.accuracy || b.attempted - a.attempted || a.subject.localeCompare(b.subject)
  );
  const strongest = byAccuracy.slice(0, 3);
  const weakest = [...byAccuracy].reverse().slice(0, 3);

  const rollup = (group) => {
    const rows = subjects.filter((s) => s.group === group);
    const t = rows.reduce((s, r) => s + r.total, 0);
    const a = rows.reduce((s, r) => s + r.attempted, 0);
    const c = rows.reduce((s, r) => s + r.correct, 0);
    return { total: t, attempted: a, correct: c, accuracy: pct(c, a), blueprint: group === 'prepara' ? 100 : 200 };
  };
  const rollups = hasSubjects ? { prepara: rollup('prepara'), clinical: rollup('clinical') } : null;

  // ---- time buckets ---------------------------------------------------------
  const bucketDefs = [
    { key: 'lt15', label: 'Under 15 sec', test: (t) => t < 15 },
    { key: '15to60', label: '15–60 sec', test: (t) => t >= 15 && t < 60 },
    { key: '60to120', label: '60–120 sec', test: (t) => t >= 60 && t < 120 },
    { key: 'gt120', label: 'Over 120 sec', test: (t) => t >= 120 },
  ];
  const buckets = bucketDefs.map((b) => {
    const rows = attempted.filter((r) => b.test(r.timeSec));
    const c = rows.filter((r) => r.status === 'correct').length;
    return { key: b.key, label: b.label, count: rows.length, correct: c, accuracy: pct(c, rows.length) };
  });

  // ---- answer changes --------------------------------------------------------
  let gained = 0, lost = 0, wrongToWrong = 0;
  for (const ev of attempt.changes || []) {
    const q = qs[ev.q];
    if (!q) continue;
    const wasRight = ev.from === q.correct;
    const isRight = ev.to === q.correct;
    if (!wasRight && isRight) gained += 1;
    else if (wasRight && !isRight) lost += 1;
    else if (!wasRight && !isRight) wrongToWrong += 1;
  }
  const changeReport = {
    total: (attempt.changes || []).length,
    gained,
    lost,
    wrongToWrong,
    net: gained - lost,
  };

  // ---- confidence / guesses ---------------------------------------------------
  const confReport = {};
  for (const key of ['sure', 'unsure', 'guessed']) {
    const rows = perQ.filter((r) => r.confidence === key && r.status !== 'skipped');
    const c = rows.filter((r) => r.status === 'correct').length;
    confReport[key] = { count: rows.length, correct: c, accuracy: pct(c, rows.length) };
  }
  const untaggedAttempted = attempted.filter((r) => !r.confidence).length;
  const guessReport = {
    ...confReport,
    untagged: untaggedAttempted,
    marksFromGuesses: confReport.guessed.correct,
  };

  // ---- recklessness ledger ------------------------------------------------------
  const rushedWrong = wrong.filter((r) => r.timeSec < 15); // process fix
  const gapWrong = wrong.filter((r) => r.timeSec >= 60); // knowledge-gap fix
  const recklessness = {
    rushedWrong: rushedWrong.length,
    rushedMarks: rushedWrong.length,
    gapWrong: gapWrong.length,
  };

  // ---- skip dividend --------------------------------------------------------------
  // FMGE has NO negative marking, so a blind guess on a skipped question has an
  // expected value of 1/4 mark. Pure statistics, labelled as such in the UI.
  const skipDividend = Math.round(skipped.length * 0.25 * 100) / 100;

  // ---- what-if recovery pools -------------------------------------------------------
  const poolMap = new Map();
  for (const r of wrong) {
    const key = r.subject || 'All subjects (untagged recall)';
    poolMap.set(key, (poolMap.get(key) || 0) + 1);
  }
  const recoveryPools = [...poolMap.entries()]
    .map(([subject, lostMarks]) => ({ subject, lostMarks }))
    .sort((a, b) => b.lostMarks - a.lostMarks || a.subject.localeCompare(b.subject));
  const topPools = recoveryPools.slice(0, 3);
  const topPoolMarks = topPools.reduce((s, p) => s + p.lostMarks, 0);

  // ---- detailed time analysis (V2) ------------------------------------------------------
  // Everything below is arithmetic on the same per-question log — nothing
  // estimated, nothing from outside the attempt.
  const availableSec = (paper && paper.durationMin ? paper.durationMin : 300) * 60;
  const sumTime = (rows) => rows.reduce((s, r) => s + r.timeSec, 0);
  const avg1 = (sum, n) => (n ? Math.round((sum / n) * 10) / 10 : 0);
  const brief = (r) => ({ idx: r.idx, n: r.n, timeSec: r.timeSec, status: r.status, subject: r.subject });
  const timeDetail = {
    availableSec,
    usedSec: timeUsedSec,
    avgPerAttempted: avg1(timeUsedSec, attempted.length),
    timeOnCorrect: sumTime(correct),
    timeOnWrong: sumTime(wrong),
    avgOnCorrect: avg1(sumTime(correct), correct.length),
    avgOnWrong: avg1(sumTime(wrong), wrong.length),
    fastest: [...attempted].sort((x, y) => x.timeSec - y.timeSec || x.idx - y.idx).slice(0, 3).map(brief),
    slowest: [...attempted].sort((x, y) => y.timeSec - x.timeSec || x.idx - y.idx).slice(0, 3).map(brief),
  };
  // Rushed answers: attempted in under 10 seconds, and how they scored.
  const rushedRows = attempted.filter((r) => r.timeSec < 10);
  const rushed = {
    count: rushedRows.length,
    correct: rushedRows.filter((r) => r.status === 'correct').length,
    accuracy: pct(rushedRows.filter((r) => r.status === 'correct').length, rushedRows.length),
  };

  // ---- segments + pace blocks (V2) ---------------------------------------------------------
  // Papers: Part I vs Part II (the locked 150 split on a full paper).
  // Anything else (subject tests): first half vs second half.
  const splitAt = full ? 150 : Math.ceil(total / 2);
  const segmentOf = (rows) => {
    const att = rows.filter((r) => r.status !== 'skipped');
    const cor = rows.filter((r) => r.status === 'correct');
    return {
      total: rows.length,
      attempted: att.length,
      correct: cor.length,
      wrong: rows.filter((r) => r.status === 'wrong').length,
      skipped: rows.filter((r) => r.status === 'skipped').length,
      accuracy: pct(cor.length, att.length),
      timeSec: sumTime(rows),
      avgTimeSec: avg1(sumTime(rows), att.length),
    };
  };
  const segments = [
    { key: 'first', from: 0, to: splitAt, ...segmentOf(perQ.slice(0, splitAt)) },
    { key: 'second', from: splitAt, to: total, ...segmentOf(perQ.slice(splitAt)) },
  ];
  const blockSize = total >= 100 ? 50 : Math.max(1, Math.ceil(total / 5));
  const paceBlocks = [];
  for (let from = 0; from < total; from += blockSize) {
    const rows = perQ.slice(from, Math.min(total, from + blockSize));
    paceBlocks.push({
      from,
      to: from + rows.length,
      label: `Q${from + 1}–${from + rows.length}`,
      ...segmentOf(rows),
    });
  }

  // ---- verdict ------------------------------------------------------------------------
  const passMark = full ? 150 : Math.ceil(total / 2); // Amendment C pace mark for partial papers
  const verdict = {
    full,
    score,
    total,
    percentage: pct(score, total),
    passMark,
    passed: full ? score >= 150 : null, // never print PASS/NOT-YET for partial papers
    gapToPass: full ? Math.max(0, 150 - score) : Math.max(0, passMark - score),
  };

  // "Original paper only" subscore: performance on the paper's own questions,
  // excluding any completion questions added from other years.
  const ownRows = perQ.filter((r) => !r.added);
  const original = {
    total: ownRows.length,
    correct: ownRows.filter((r) => r.status === 'correct').length,
    addedCount: perQ.length - ownRows.length,
  };

  return {
    total,
    score,
    attempted: attempted.length,
    correct: correct.length,
    wrong: wrong.length,
    skipped: skipped.length,
    accuracy: pct(correct.length, attempted.length),
    timeUsedSec,
    perQ,
    hasSubjects,
    subjects,
    strongest,
    weakest,
    tooFew,
    rollups,
    buckets,
    changeReport,
    guessReport,
    recklessness,
    skipDividend,
    timeDetail,
    rushed,
    segments,
    paceBlocks,
    recoveryPools,
    topPools,
    topPoolMarks,
    verdict,
    original,
    answerKey: perQ.map((r) => ({
      n: r.n,
      correctLetter: LETTERS[r.correct],
      yourLetter: r.yours === null ? '—' : LETTERS[r.yours],
      status: r.status,
    })),
  };
}
