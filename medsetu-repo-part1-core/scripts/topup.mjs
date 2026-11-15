// MedSetu paper completion ("top-up").
//
// Locked strategy (user order, 2026-11-12): every paper with fewer than 300
// playable questions is completed to 300 with questions drawn from OTHER
// years' papers, chosen to equalise subject weightage toward the official
// NBEMS blueprint. Honesty rules are part of the order:
//  - Donors come only from the 10 book papers (they carry subject +
//    explanation). A donor must be playable, explained, subject-tagged and
//    NOT image-flagged.
//  - No duplicates: a donor is rejected for a target if its normalised stem
//    matches a stem already in the target, or is a near-duplicate
//    (token-set Jaccard >= 0.85) of one. A donor question (paper + original
//    number) is used in at most ONE target paper overall (global ledger).
//  - Added questions are appended after the paper's own questions, carry
//    full provenance (added / fromPaper / fromLabel / fromN), and the
//    paper's own questions are never touched.
//  - Fully deterministic: fixed subject order, fixed target order, fixed
//    donor ordering (nearest session, then lowest question number).
import { IMG_RE, isPlayable, hasTextOptions, parseExamDate, normalizeStem, tokenSet, jaccard } from './paperlib.mjs';

// Official NBEMS blueprint (Information Bulletin, Ch. 12) — sums to 300.
// The array order is also the deterministic tie-break order everywhere below.
export const SUBJECT_ORDER = [
  'Anatomy', 'Physiology', 'Biochemistry', 'Pathology', 'Microbiology',
  'Pharmacology', 'Forensic Medicine', 'Community Medicine', 'Medicine',
  'Psychiatry', 'Dermatology', 'Radiology', 'Surgery', 'Orthopaedics',
  'Anaesthesia', 'Paediatrics', 'Ophthalmology', 'ENT',
  'Obstetrics & Gynaecology',
];
export const BLUEPRINT = {
  Anatomy: 17, Physiology: 17, Biochemistry: 17, Pathology: 13,
  Microbiology: 13, Pharmacology: 13, 'Forensic Medicine': 10,
  'Community Medicine': 30, Medicine: 33, Psychiatry: 5, Dermatology: 5,
  Radiology: 10, Surgery: 32, Orthopaedics: 5, Anaesthesia: 5,
  Paediatrics: 15, Ophthalmology: 15, ENT: 15, 'Obstetrics & Gynaecology': 30,
};
const SUBJECT_RANK = new Map(SUBJECT_ORDER.map((s, i) => [s, i]));

export const BOOK_PAPERS = [
  'dec-2020', 'jun-2021', 'dec-2021', 'jun-2022', 'jan-2023', 'jul-2023',
  'jan-2024', 'jun-2024', 'jan-2025', 'jul-2025',
];
// Locked processing order: largest need first among book papers, then 2026s.
export const TARGET_ORDER = [
  'jan-2024', 'jun-2024', 'jun-2022', 'dec-2020', 'jul-2025', 'jan-2026', 'jun-2026',
];
export const FULL_SIZE = 300;
const NEAR_DUP = 0.85;

/**
 * @param {Map<string, {label: string, examDate: string, playable: object[]}>} papers
 *   Playable (post-exclusion) raw questions per paper.
 * @returns {{ additions: Map<string, object[]>, report: object }}
 *   additions: target paperId -> raw-shape questions to append, each with
 *   provenance fields set and n assigned (ownCount+1 .. 300), in selection order.
 */
export function applyTopUp(papers) {
  const DAY = 86400000;
  const dateOf = (id) => parseExamDate(papers.get(id).examDate);

  // ---- donor pool (book papers only) -------------------------------------
  const poolBySubject = new Map(SUBJECT_ORDER.map((s) => [s, []]));
  let poolIneligible = 0;
  for (const id of BOOK_PAPERS) {
    const p = papers.get(id);
    if (!p) continue;
    for (const q of p.playable) {
      const eligible =
        q.subject && SUBJECT_RANK.has(q.subject) &&
        typeof q.text === 'string' && q.text.trim().length > 0 &&
        typeof q.explanation === 'string' && q.explanation.trim().length > 0 &&
        hasTextOptions(q) &&
        !IMG_RE.test(q.text);
      if (!eligible) { poolIneligible += 1; continue; }
      poolBySubject.get(q.subject).push({
        key: `${id}#${q.n}`,
        paperId: id,
        label: p.label,
        date: dateOf(id),
        n: q.n,
        subject: q.subject,
        norm: normalizeStem(q.text),
        tokens: tokenSet(q.text),
        q,
      });
    }
  }

  const ledger = new Set(); // donor keys already used, across ALL targets
  const additions = new Map();
  const report = { poolIneligible, targets: {}, failures: [] };

  const newTargetCtx = (id) => {
    const own = papers.get(id).playable;
    return {
      id,
      date: dateOf(id),
      normSet: new Set(own.map((q) => normalizeStem(q.text))),
      tokenSets: own.map((q) => tokenSet(q.text)),
      rejectedDup: 0,
      rejectedUsed: 0,
    };
  };

  const dedupOk = (ctx, entry) => {
    if (ctx.normSet.has(entry.norm)) { ctx.rejectedDup += 1; return false; }
    for (const ts of ctx.tokenSets) {
      if (jaccard(entry.tokens, ts) >= NEAR_DUP) { ctx.rejectedDup += 1; return false; }
    }
    return true;
  };

  // Nearest session first; tie-break lowest donor question number, then
  // earlier donor session, then paperId — a total order, so fully deterministic.
  const pickDonor = (ctx, subject) => {
    const cands = poolBySubject.get(subject)
      .filter((e) => {
        if (ledger.has(e.key)) { ctx.rejectedUsed += 1; return false; }
        return true;
      })
      .sort((a, b) =>
        (Math.abs(a.date - ctx.date) - Math.abs(b.date - ctx.date)) ||
        (a.n - b.n) || (a.date - b.date) || a.paperId.localeCompare(b.paperId));
    for (const e of cands) if (dedupOk(ctx, e)) return e;
    return null;
  };

  const place = (ctx, selections, entry, via) => {
    ledger.add(entry.key);
    ctx.normSet.add(entry.norm);
    ctx.tokenSets.push(entry.tokens);
    selections.push({
      subject: entry.subject,
      via,
      fromPaper: entry.paperId,
      fromLabel: entry.label,
      fromN: entry.n,
      distanceDays: Math.round(Math.abs(entry.date - ctx.date) / DAY),
    });
    return {
      ...entry.q,
      added: true,
      fromPaper: entry.paperId,
      fromLabel: entry.label,
      fromN: entry.n,
    };
  };

  for (const targetId of TARGET_ORDER) {
    const p = papers.get(targetId);
    if (!p) continue;
    const own = p.playable;
    const slots = FULL_SIZE - own.length;
    if (slots <= 0) continue;
    const ctx = newTargetCtx(targetId);
    const selections = [];
    const placedRaw = [];
    const counts = {};
    for (const q of own) if (q.subject) counts[q.subject] = (counts[q.subject] || 0) + 1;
    const beforeCounts = { ...counts };
    const is2026 = !BOOK_PAPERS.includes(targetId);
    let allocation = null;

    if (!is2026) {
      // Subject equalisation: one slot at a time, largest remaining deficit.
      for (let slot = 0; slot < slots; slot += 1) {
        let entry = null;
        let via = null;
        const byDeficit = SUBJECT_ORDER
          .filter((s) => BLUEPRINT[s] - (counts[s] || 0) > 0)
          .sort((a, b) =>
            ((BLUEPRINT[b] - (counts[b] || 0)) - (BLUEPRINT[a] - (counts[a] || 0))) ||
            (SUBJECT_RANK.get(a) - SUBJECT_RANK.get(b)));
        for (const s of byDeficit) {
          entry = pickDonor(ctx, s);
          if (entry) { via = 'deficit'; break; }
        }
        if (!entry) {
          // Surplus fallback: subjects with the smallest surplus over blueprint.
          const bySurplus = [...SUBJECT_ORDER].sort((a, b) =>
            (((counts[a] || 0) - BLUEPRINT[a]) - ((counts[b] || 0) - BLUEPRINT[b])) ||
            (SUBJECT_RANK.get(a) - SUBJECT_RANK.get(b)));
          for (const s of bySurplus) {
            entry = pickDonor(ctx, s);
            if (entry) { via = 'surplus'; break; }
          }
        }
        if (!entry) {
          report.failures.push({ target: targetId, slot: slot + 1, reason: 'no eligible donor in any subject' });
          break;
        }
        placedRaw.push(place(ctx, selections, entry, via));
        counts[entry.subject] = (counts[entry.subject] || 0) + 1;
      }
    } else {
      // 2026 targets: own questions are untagged — allocate the slots across
      // subjects in blueprint proportion (largest remainder), then fill.
      allocation = {};
      const rawShare = SUBJECT_ORDER.map((s) => ({
        s,
        exact: (BLUEPRINT[s] / FULL_SIZE) * slots,
      }));
      let assigned = 0;
      for (const r of rawShare) { allocation[r.s] = Math.floor(r.exact); assigned += allocation[r.s]; }
      const byRemainder = [...rawShare].sort((a, b) =>
        ((b.exact - Math.floor(b.exact)) - (a.exact - Math.floor(a.exact))) ||
        (SUBJECT_RANK.get(a.s) - SUBJECT_RANK.get(b.s)));
      for (let i = 0; assigned < slots; i += 1, assigned += 1) {
        allocation[byRemainder[i % byRemainder.length].s] += 1;
      }
      for (const s of SUBJECT_ORDER) {
        for (let k = 0; k < (allocation[s] || 0); k += 1) {
          const entry = pickDonor(ctx, s);
          if (!entry) {
            report.failures.push({ target: targetId, subject: s, reason: 'no eligible donor for allocated subject' });
            continue;
          }
          placedRaw.push(place(ctx, selections, entry, 'blueprint-share'));
          counts[entry.subject] = (counts[entry.subject] || 0) + 1;
        }
      }
      // Redistribute any shortfall: largest-blueprint subjects first.
      let guard = 0;
      while (placedRaw.length < slots && guard < slots * 2) {
        guard += 1;
        let progressed = false;
        const byBlueprint = [...SUBJECT_ORDER].sort((a, b) =>
          (BLUEPRINT[b] - BLUEPRINT[a]) || (SUBJECT_RANK.get(a) - SUBJECT_RANK.get(b)));
        for (const s of byBlueprint) {
          if (placedRaw.length >= slots) break;
          const entry = pickDonor(ctx, s);
          if (entry) {
            placedRaw.push(place(ctx, selections, entry, 'redistribution'));
            counts[entry.subject] = (counts[entry.subject] || 0) + 1;
            progressed = true;
          }
        }
        if (!progressed) {
          report.failures.push({ target: targetId, reason: 'no eligible donor anywhere for redistribution' });
          break;
        }
      }
    }

    // Number the added questions by their slot after the paper's own questions.
    placedRaw.forEach((q, i) => { q.n = own.length + i + 1; });
    additions.set(targetId, placedRaw);

    const addedBySubject = {};
    const donorsUsed = {};
    for (const s of selections) {
      addedBySubject[s.subject] = (addedBySubject[s.subject] || 0) + 1;
      if (!donorsUsed[s.fromPaper]) donorsUsed[s.fromPaper] = { label: s.fromLabel, count: 0, fromN: [] };
      donorsUsed[s.fromPaper].count += 1;
      donorsUsed[s.fromPaper].fromN.push(s.fromN);
    }
    report.targets[targetId] = {
      label: p.label,
      ownCount: own.length,
      slots,
      filled: placedRaw.length,
      is2026,
      allocation,
      addedBySubject,
      donorsUsed,
      surplusFallback: selections.filter((s) => s.via === 'surplus')
        .map((s) => ({ subject: s.subject, fromPaper: s.fromPaper, fromN: s.fromN })),
      redistributed: selections.filter((s) => s.via === 'redistribution').length,
      rejectedDup: ctx.rejectedDup,
      rejectedUsed: ctx.rejectedUsed,
      beforeCounts: is2026 ? null : beforeCounts,
      afterCounts: is2026 ? null : { ...counts },
    };
  }

  report.totalAdded = [...additions.values()].reduce((s, arr) => s + arr.length, 0);
  report.ledgerSize = ledger.size;
  return { additions, report };
}
