'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  addMistake, isBookmarked, loadMistakes, loadPracticeState,
  loadQBankQuestions, newPracticeState, recordProgress, removeMistake,
  savePracticeState, toggleBookmark, clearPracticeState,
} from '../lib/qbank';
import { fmtClock } from '../lib/store';
import { analyseAttempt } from '../lib/analysis';
import type { PerQ } from '../lib/analysis';
import type { Attempt, QBankPracticeState, QBankSessionDef, Question, TestData } from '../lib/types';
import { PaletteTile, type QState } from './TcsPalette';
import ExplanationText, { ExplanationBlocks } from './Explanation';
import { SolutionSheet } from './Solution';
import { BrandLockup } from './SiteChrome';

const QB_IMG_NOTE =
  'This question refers to an image in the source material. The image is not included in this edition — answer from the stem, or skip it.';

/**
 * Practice mode: the exam window with a learning posture. Pick an answer,
 * press Check, and the correct option, your result and the full explanation
 * appear inline. Wrong answers collect in My Mistakes; in a mistakes
 * session, answering one correctly removes it.
 */
export default function PracticeRunner({ def }: { def: QBankSessionDef }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [st, setSt] = useState<QBankPracticeState | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [, setBmTick] = useState(0);
  const stateRef = useRef<QBankPracticeState | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const qs = await loadQBankQuestions(def);
      if (!alive) return;
      const existing = loadPracticeState(def.id);
      const init = existing ?? newPracticeState(def.id);
      stateRef.current = init;
      setQuestions(qs);
      setSt(init);
    })();
    return () => { alive = false; };
  }, [def]);

  const update = (next: QBankPracticeState) => {
    stateRef.current = next;
    savePracticeState(next);
    setSt(next);
  };

  // Per-question timer: accrues until the answer is checked.
  useEffect(() => {
    const t = setInterval(() => {
      const cur = stateRef.current;
      if (!cur || cur.finished) return;
      if (cur.revealed[cur.idx]) return;
      const timeSec = { ...cur.timeSec, [cur.idx]: (cur.timeSec[cur.idx] || 0) + 1 };
      update({ ...cur, timeSec });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slugOf = (i: number) => def.refs[i]?.slug ?? '';

  const checkedCount = st ? Object.keys(st.revealed).length : 0;
  const correctCount = useMemo(() => {
    if (!st || !questions) return 0;
    return Object.keys(st.revealed).reduce(
      (acc, k) => acc + (st.picked[Number(k)] === questions[Number(k)].correct ? 1 : 0), 0);
  }, [st, questions]);

  if (!questions || !st) {
    return (
      <div className="flex min-h-screen flex-col bg-[#EDF2F7]">
        <div className="mx-auto max-w-xl px-4 py-20 text-center text-inksoft">Loading your practice set…</div>
      </div>
    );
  }

  const total = questions.length;
  const idx = Math.min(st.idx, total - 1);
  const q = questions[idx];
  const picked = st.picked[idx] ?? null;
  const revealed = !!st.revealed[idx];
  const isCorrect = revealed && picked === q.correct;
  const slug = slugOf(idx);
  const bookmarked = q.bankId ? isBookmarked(q.bankId) : false;

  const goTo = (i: number) => {
    if (i < 0 || i >= total) return;
    update({ ...st, idx: i, visits: { ...st.visits, [i]: (st.visits[i] || 0) + 1 } });
  };

  const pick = (oi: number) => {
    if (revealed) return;
    update({ ...st, picked: { ...st.picked, [idx]: oi } });
  };

  const check = () => {
    if (revealed || picked === null || !q.bankId) return;
    const correct = picked === q.correct;
    recordProgress(slug, correct);
    if (correct) {
      if (def.scope === 'mistakes') removeMistake(q.bankId);
    } else {
      addMistake({ id: q.bankId, slug });
    }
    update({ ...st, revealed: { ...st.revealed, [idx]: true } });
  };

  const qState = (i: number): QState => {
    if (st.revealed[i]) return st.picked[i] === questions[i].correct ? 'answered' : 'notAnswered';
    if (st.picked[i] !== null && st.picked[i] !== undefined) return 'marked';
    if (st.visits[i]) return 'notAnswered';
    return 'notVisited';
  };

  const finish = () => {
    update({ ...st, finished: true });
    setConfirmEnd(false);
  };

  // ---- summary -------------------------------------------------------------
  if (st.finished) {
    const answers: Record<number, number> = {};
    questions.forEach((qq, i) => {
      if (st.revealed[i] && st.picked[i] !== null && st.picked[i] !== undefined) answers[i] = st.picked[i];
    });
    const synthetic: Attempt = {
      paperId: def.id,
      name: '',
      startedAt: def.startedAt,
      finishedAt: Date.now(),
      phase: 'done',
      instructionsSeen: true,
      current: 0,
      answers,
      marked: {},
      confidence: {},
      timeSec: { ...st.timeSec },
      visits: { ...st.visits },
      changes: [],
      part1Remaining: 0,
      part2Remaining: 0,
      part1Summary: null,
    };
    const paper: TestData = { questions, durationMin: total };
    const a = analyseAttempt(paper, synthetic);
    const wrongRows = a.perQ.filter((r) => r.status === 'wrong');
    const mistakesLeft = loadMistakes().length;
    const openRow: PerQ | null = openIdx !== null ? a.perQ[openIdx] : null;
    const navPos = openRow ? wrongRows.findIndex((r) => r.idx === openRow.idx) : -1;
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <header className="bg-med-deep text-white">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
            <BrandLockup light size="sm" />
            <span className="ml-auto text-sm font-semibold">Practice session complete</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink">{def.heading} — session summary</h1>
          <p className="mt-1 text-sm text-inksoft">{def.subline} · Practice mode</p>
          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line text-center sm:grid-cols-4">
            {[
              [String(a.attempted), `checked of ${total}`],
              [String(a.correct), 'correct'],
              [`${a.accuracy}%`, 'accuracy (of checked)'],
              [fmtClock(Object.values(st.timeSec).reduce((x, y) => x + y, 0)), 'time answering'],
            ].map(([big, small]) => (
              <div key={small} className="bg-white px-3 py-4">
                <p className="text-[24px] font-bold leading-tight tabular-nums text-ink">{big}</p>
                <p className="mt-0.5 text-[11px] font-medium text-inksoft">{small}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-inksoft">
            Questions you opened but did not check are not counted. Every wrong answer is kept in{' '}
            <strong className="text-ink">My Mistakes</strong> ({mistakesLeft} question{mistakesLeft === 1 ? '' : 's'} there now) —
            replay them from the Question Bank home and a correct answer clears each one.
          </p>

          {wrongRows.length > 0 && (
            <section className="mt-6 rounded-xl border border-line bg-white p-5 shadow-card">
              <h2 className="text-lg font-bold text-ink">Wrong this session — review them now</h2>
              <div className="mt-2 divide-y divide-line">
                {wrongRows.map((r) => (
                  <button
                    key={r.idx}
                    type="button"
                    onClick={() => setOpenIdx(r.idx)}
                    className="group flex w-full items-center gap-3 px-2 py-3 text-left transition hover:bg-paper"
                    aria-label={`Open solution for question ${r.idx + 1}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bad text-[13px] font-bold tabular-nums text-white">
                      {r.idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{paper.questions[r.idx].text}</span>
                      <span className="text-xs text-inksoft">
                        {r.subject} · you answered {r.yours !== null ? String.fromCharCode(65 + r.yours) : '—'}, correct is {String.fromCharCode(65 + r.correct)}
                      </span>
                    </span>
                    <span aria-hidden className="shrink-0 text-inksoft transition-transform group-hover:translate-x-0.5">→</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/qbank/" className="rounded-md bg-med px-5 py-2.5 text-sm font-semibold text-white hover:bg-med-deep">
              Back to the Question Bank
            </Link>
            <button
              type="button"
              onClick={() => { clearPracticeState(); window.location.reload(); }}
              className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-mist"
            >
              Practise this set again
            </button>
            <Link href="/choose/" className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-mist">
              Choose another section
            </Link>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-inksoft">
            This session lives only in this browser tab. Closing the tab erases it — nothing is stored anywhere else.
          </p>
        </main>
        {openRow && (
          <SolutionSheet
            paper={paper}
            row={openRow}
            imgNote={QB_IMG_NOTE}
            noExplNote="A detailed explanation is not available in the source for this question. The correct answer above is as given in the source compilation — MedSetu does not invent explanations."
            onClose={() => setOpenIdx(null)}
            onPrev={() => { if (navPos > 0) setOpenIdx(wrongRows[navPos - 1].idx); }}
            onNext={() => { if (navPos >= 0 && navPos < wrongRows.length - 1) setOpenIdx(wrongRows[navPos + 1].idx); }}
            hasPrev={navPos > 0}
            hasNext={navPos >= 0 && navPos < wrongRows.length - 1}
          />
        )}
      </div>
    );
  }

  // ---- practice window -------------------------------------------------------
  const elapsed = Object.values(st.timeSec).reduce((x, y) => x + y, 0);
  const palette = (
    <div className="flex h-full flex-col px-3 py-3">
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] tabular-nums">
        {([
          [correctCount, 'Checked · correct', 'bg-ok'],
          [checkedCount - correctCount, 'Checked · wrong', 'bg-bad'],
          [Object.keys(st.picked).filter((k) => !st.revealed[Number(k)]).length, 'Picked, not checked', 'bg-cbt-purple'],
          [total - Object.keys(st.visits).length, 'Not visited', 'bg-cbt-grey'],
        ] as const).map(([n, label, dot]) => (
          <p key={label} className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1.5 text-inksoft"><span className={`h-2.5 w-2.5 rounded-sm ${dot}`} />{label}</span>
            <strong className="text-ink">{n}</strong>
          </p>
        ))}
      </div>
      <div className="mt-3 grid flex-1 content-start grid-cols-5 gap-1.5 overflow-y-auto pr-0.5">
        {questions.map((qq, i) => (
          <PaletteTile
            key={qq.bankId || i}
            state={qState(i)}
            label={String(i + 1)}
            current={i === idx}
            onClick={() => { goTo(i); setPaletteOpen(false); }}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-inksoft">
        Practice palette: green = checked correct, red = checked wrong or opened, purple = picked but not checked.
      </p>
      <button
        type="button"
        onClick={() => setConfirmEnd(true)}
        className="mt-2 w-full rounded-sm bg-cbt-headdeep px-4 py-2.5 text-sm font-bold text-white hover:brightness-125"
      >
        End session
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#EDF2F7]">
      {/* Header */}
      <div className="bg-med-deep text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 sm:px-4">
          <BrandLockup light size="sm" />
          <span className="hidden text-sm font-semibold md:inline">{def.heading}</span>
          <span className="rounded bg-white/15 px-2 py-0.5 text-xs font-bold">Practice mode</span>
          <span className="ml-auto flex items-center gap-3 text-sm">
            <span className="tabular-nums" aria-label="Score so far">
              Score: <strong>{correctCount}/{checkedCount}</strong> checked
            </span>
            <span className="hidden tabular-nums sm:inline">Time: <strong>{fmtClock(elapsed)}</strong></span>
          </span>
        </div>
      </div>

      {/* Section band */}
      <div className="border-b border-cbt-grey/40 bg-cbt-band">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-1.5 sm:px-4">
          <span className="text-[13px] font-semibold text-cbt-headdeep">Sections:</span>
          <span className="rounded-t-sm bg-white px-3 py-1 text-[13px] font-bold text-cbt-headdeep shadow-sm">
            {def.subjectName ?? 'Question Bank'}
          </span>
          <span className="ml-2 hidden text-xs text-inksoft sm:inline">{total} questions · check each answer as you go</span>
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="ml-auto rounded-sm bg-cbt-head px-3.5 py-1.5 text-[13px] font-semibold text-white lg:hidden"
          >
            Question Palette
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 items-stretch gap-0 px-0 sm:px-3 sm:py-3">
        <section className="flex min-w-0 flex-1 flex-col border border-cbt-grey/40 bg-white shadow-card">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line px-4 pt-3 sm:px-5">
            <p className="text-[13px] text-inksoft">
              Marks for correct answer: <strong className="text-ink">1</strong> | Negative Marks:{' '}
              <strong className="text-ink">0</strong>
            </p>
            <span className="ml-auto text-xs text-inksoft">
              Time on this question:{' '}
              <span className="font-mono font-semibold tabular-nums text-ink">{fmtClock(st.timeSec[idx] || 0)}</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 px-4 pt-2.5 sm:px-5">
            <h1 className="text-[17px] font-bold text-ink">Question No. {idx + 1}</h1>
            <span className="text-xs text-inksoft">(Q{idx + 1} of {total} in this set)</span>
            {q.subject && <span className="rounded bg-med-soft px-2 py-0.5 text-xs font-semibold text-med-deep">{q.subject}</span>}
            {q.topic && <span className="hidden text-xs text-inksoft md:inline">{q.topic}</span>}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
            {q.img && (
              <p className="mt-3 rounded-sm bg-accent-soft px-3 py-2 text-[13px] font-medium text-accent-deep">{QB_IMG_NOTE}</p>
            )}
            <p className="mt-3 whitespace-pre-wrap text-[15.5px] leading-relaxed text-ink">{q.text}</p>

            {q.images && q.images.length > 0 && (
              <div className="mt-4 space-y-3">
                {q.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setZoomImg(src)}
                    className="block cursor-zoom-in"
                    aria-label={`Enlarge figure for question ${idx + 1}`}
                  >
                    <img
                      src={src}
                      alt={`Figure for question ${idx + 1}`}
                      loading="lazy"
                      className="max-h-[420px] w-auto max-w-full rounded-sm border border-line bg-white object-contain"
                    />
                    <span className="mt-1 block text-left text-[11px] text-inksoft">Click the image to enlarge</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-1" role="radiogroup" aria-label="Options">
              {q.options.map((opt, oi) => {
                const isPicked = picked === oi;
                const isAnswer = q.correct === oi;
                let cls = 'hover:bg-[#F4F8FC]';
                if (!revealed && isPicked) cls = 'bg-cbt-panel';
                if (revealed && isAnswer) cls = 'bg-ok/10 ring-1 ring-inset ring-ok/50';
                if (revealed && isPicked && !isAnswer) cls = 'bg-bad/[0.08] ring-1 ring-inset ring-bad/50';
                return (
                  <label
                    key={oi}
                    className={`flex items-start gap-3 rounded-sm px-2.5 py-2.5 text-[15px] leading-relaxed transition focus-within:ring-2 focus-within:ring-inset focus-within:ring-cbt-head/40 ${revealed ? 'cursor-default' : 'cursor-pointer'} ${cls}`}
                  >
                    <input
                      type="radio"
                      name={`pq-${idx}`}
                      checked={isPicked}
                      disabled={revealed}
                      onChange={() => pick(oi)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                        revealed && isAnswer ? 'border-ok' : revealed && isPicked ? 'border-bad' : isPicked ? 'border-cbt-head' : 'border-inksoft/60'
                      }`}
                    >
                      {isPicked && <span className={`h-[9px] w-[9px] rounded-full ${revealed && !isAnswer ? 'bg-bad' : revealed ? 'bg-ok' : 'bg-cbt-head'}`} />}
                    </span>
                    <span className={isPicked || (revealed && isAnswer) ? 'font-medium text-ink' : 'text-ink'}>{opt}</span>
                    {revealed && isAnswer && <span className="ml-auto shrink-0 text-sm font-bold text-ok">✓ Correct</span>}
                    {revealed && isPicked && !isAnswer && <span className="ml-auto shrink-0 text-sm font-bold text-bad">✗ Your answer</span>}
                  </label>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                aria-pressed={bookmarked}
                onClick={() => { if (q.bankId) { toggleBookmark({ id: q.bankId, slug }); setBmTick((t) => t + 1); } }}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  bookmarked
                    ? 'bg-accent text-white'
                    : 'border border-line bg-white text-inksoft hover:border-accent hover:text-accent-deep'
                }`}
              >
                {bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              </button>
              <span className="text-xs text-inksoft">Bookmarks and mistakes are kept only in this tab.</span>
            </div>

            {revealed && (
              <div className={`sheet-in-up mt-5 rounded-md border px-4 py-4 ${isCorrect ? 'border-ok/40 bg-ok/[0.05]' : 'border-bad/40 bg-bad/[0.04]'}`}>
                <p className={`text-[15px] font-bold ${isCorrect ? 'text-ok' : 'text-bad'}`}>
                  {isCorrect
                    ? 'Correct — well done.'
                    : `Not quite — the correct answer is ${String.fromCharCode(65 + q.correct)}. This question is saved in your My Mistakes.`}
                </p>
                <div className="mt-2">
                  {q.explanation && q.explanation.trim() ? (
                    q.explBlocks ? (
                      <ExplanationBlocks
                        text={q.explanation}
                        blocks={q.explBlocks}
                        className="text-[14.5px] leading-relaxed text-ink"
                      />
                    ) : (
                      <ExplanationText text={q.explanation} className="text-[14.5px] leading-relaxed text-ink" />
                    )
                  ) : (
                    <p className="text-sm leading-relaxed text-inksoft">
                      A detailed explanation is not available in the source for this question. The
                      correct answer above is as given in the source compilation — MedSetu does not
                      invent explanations.
                    </p>
                  )}
                  {q.explImg && !q.explBlocks && (
                    <p className="mt-2 text-[13px] leading-relaxed text-inksoft">
                      The source explanation for this question also includes image(s) that are not
                      included in this edition.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 border-t border-cbt-grey/40 bg-cbt-panel px-4 py-2.5 sm:px-5">
            <button
              type="button"
              onClick={() => goTo(idx - 1)}
              disabled={idx === 0}
              className="rounded-sm border border-cbt-grey bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist disabled:opacity-40"
            >
              Previous
            </button>
            {!revealed ? (
              <button
                type="button"
                onClick={check}
                disabled={picked === null}
                className="rounded-sm bg-cbt-headdeep px-5 py-2 text-sm font-bold text-white transition hover:brightness-125 disabled:opacity-40"
              >
                Check answer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => (idx + 1 < total ? goTo(idx + 1) : setConfirmEnd(true))}
                className="rounded-sm bg-cbt-headdeep px-5 py-2 text-sm font-bold text-white transition hover:brightness-125"
              >
                {idx + 1 < total ? 'Next question' : 'Finish — see summary'}
              </button>
            )}
            {!revealed && picked !== null && (
              <button
                type="button"
                onClick={() => { const p = { ...st.picked }; delete p[idx]; update({ ...st, picked: p }); }}
                className="rounded-sm border border-cbt-grey bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
              >
                Clear response
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmEnd(true)}
              className="ml-auto rounded-sm border border-bad/50 bg-white px-4 py-2 text-sm font-semibold text-bad transition hover:bg-bad hover:text-white"
            >
              End session
            </button>
          </div>
        </section>

        {/* Desktop palette */}
        <aside className="sticky top-3 ml-3 hidden h-[calc(100vh-120px)] w-[290px] shrink-0 self-start overflow-hidden rounded-md border border-cbt-grey/40 bg-white shadow-card lg:block">
          {palette}
        </aside>
      </div>

      {/* Mobile palette drawer */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Question palette">
          <div className="absolute inset-0 bg-black/45" onClick={() => setPaletteOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[300px] max-w-[85vw] bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="text-sm font-bold text-ink">Question Palette</h2>
              <button type="button" onClick={() => setPaletteOpen(false)} className="rounded-md border border-line px-2.5 py-1 text-sm font-semibold">✕</button>
            </div>
            <div className="h-[calc(100%-57px)]">{palette}</div>
          </div>
        </div>
      )}

      {/* End-session confirmation */}
      {confirmEnd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="End practice session">
          <div className="absolute inset-0 bg-black/45" onClick={() => setConfirmEnd(false)} />
          <div className="sheet-in-up relative w-full max-w-md rounded-md bg-white shadow-lift">
            <div className="border-b border-line bg-cbt-panel px-5 py-3">
              <h2 className="text-base font-bold text-cbt-headdeep">End this practice session?</h2>
            </div>
            <div className="px-5 py-4 text-sm leading-relaxed text-ink">
              You have checked {checkedCount} of {total} questions ({correctCount} correct). Unchecked
              questions are not counted. Your mistakes and bookmarks stay saved in this tab.
              <div className="mt-5 flex gap-3">
                <button type="button" onClick={finish} className="rounded-sm bg-cbt-headdeep px-5 py-2.5 text-sm font-bold text-white hover:brightness-125">
                  End session — show summary
                </button>
                <button type="button" onClick={() => setConfirmEnd(false)} className="rounded-sm border border-cbt-grey bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-mist">
                  Keep practising
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image zoom */}
      {zoomImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Enlarged figure" onClick={() => setZoomImg(null)}>
          <img src={zoomImg} alt="Enlarged figure" className="max-h-[92vh] max-w-full rounded bg-white object-contain" />
          <button type="button" className="absolute right-4 top-4 rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-ink" onClick={() => setZoomImg(null)}>
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}

