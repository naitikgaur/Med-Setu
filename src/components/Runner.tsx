'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadPaper } from '../lib/papers';
import { loadSubjectTest } from '../lib/subjects';
import { loadSeriesTest } from '../lib/series';
import { QBANK_META, isBookmarked, loadQBankTestData, toggleBookmark } from '../lib/qbank';
import {
  loadAttempt, saveAttempt, fmtClock,
} from '../lib/store';
import type { Attempt, Confidence, TestData, TestDescriptor } from '../lib/types';
import { PaletteTile, LEGEND_ITEMS, type QState } from './TcsPalette';
import { imgDims } from '../lib/imgdims';

export default function Runner({ desc }: { desc: TestDescriptor }) {
  const router = useRouter();
  const [paper, setPaper] = useState<TestData | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(150 * 60);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [agree, setAgree] = useState(false);
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [, setBmTick] = useState(0); // re-render on bookmark toggle (qbank)

  const attemptRef = useRef<Attempt | null>(null);
  const pendingRef = useRef<number | null>(null);
  const tickCount = useRef(0);

  useEffect(() => { pendingRef.current = pending; }, [pending]);

  const part1End = desc.part1Count; // index where Part II starts (== total when single-part)
  const total = desc.total;

  // ---------- load ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      const a = loadAttempt(desc.id);
      if (!a) { setLoadError('none'); return; }
      const p = desc.kind === 'paper'
        ? await loadPaper(desc.id)
        : desc.kind === 'qbank'
          ? await loadQBankTestData(desc.id)
          : desc.kind === 'series'
            ? await loadSeriesTest(desc.id)
            : await loadSubjectTest(desc.id);
      if (!alive) return;
      setPaper(p);
      attemptRef.current = a;
      setAttempt(a);
      setPending(a.answers[a.current] ?? null);
      setRemaining(a.phase === 'part2' ? a.part2Remaining : a.part1Remaining);
    })();
    return () => { alive = false; };
  }, [desc.id, desc.kind]);

  const persist = useCallback((a: Attempt) => {
    attemptRef.current = a;
    saveAttempt(a);
  }, []);

  const partRange = useCallback(
    (a: Attempt): [number, number] => (a.phase === 'part2' ? [part1End, total] : [0, part1End]),
    [part1End, total]
  );

  const qState = useCallback(
    (a: Attempt, i: number): QState => {
      const answered = a.answers[i] !== undefined;
      const marked = !!a.marked[i];
      if (answered && marked) return 'answeredMarked';
      if (answered) return 'answered';
      if (marked) return 'marked';
      if ((a.visits[i] || 0) > 0) return 'notAnswered';
      return 'notVisited';
    },
    []
  );

  // ---------- commit + navigation ----------
  const commitInto = useCallback(
    (a: Attempt, value: number | null): Attempt => {
      const i = a.current;
      const prev = a.answers[i] ?? null;
      const answers = { ...a.answers };
      const changes = [...a.changes];
      if (value === null) {
        delete answers[i];
      } else {
        if (prev !== null && prev !== value) changes.push({ q: i, from: prev, to: value });
        answers[i] = value;
      }
      return { ...a, answers, changes };
    },
    []
  );

  const goTo = useCallback(
    (idx: number) => {
      const cur = attemptRef.current;
      if (!cur) return;
      let a = commitInto(cur, pending);
      const visits = { ...a.visits };
      if (idx !== a.current) visits[idx] = (visits[idx] || 0) + 1;
      a = { ...a, visits, current: idx };
      persist(a);
      setAttempt(a);
      setPending(a.answers[idx] ?? null);
    },
    [commitInto, pending, persist]
  );

  const submitPart = useCallback(() => {
    const cur = attemptRef.current;
    if (!cur || !paper) return;
    // Remaining seconds are read from the ref-tracked attempt (always current,
    // including on timer auto-submit), never from render-scope state.
    let a = commitInto(cur, pendingRef.current);
    if (a.phase === 'part1' && desc.singlePart) {
      // Subject-wise test: one part only — submitting ends the test.
      a = { ...a, phase: 'done', finishedAt: Date.now() };
      persist(a);
      router.push(desc.analysisHref);
    } else if (a.phase === 'part1') {
      const answered = Object.keys(a.answers).filter((k) => Number(k) < part1End).length;
      const marked = Object.keys(a.marked).filter((k) => Number(k) < part1End && a.marked[Number(k)]).length;
      a = {
        ...a,
        phase: 'break',
        part1Summary: { answered, marked, total: part1End },
      };
      persist(a);
      setAttempt(a);
      setConfirmSubmit(false);
    } else if (a.phase === 'part2') {
      a = { ...a, phase: 'done', finishedAt: Date.now() };
      persist(a);
      router.push(desc.analysisHref);
    }
  }, [commitInto, part1End, paper, persist, router, desc.singlePart, desc.analysisHref]);

  // ---------- timer ----------
  useEffect(() => {
    if (!attempt || (attempt.phase !== 'part1' && attempt.phase !== 'part2')) return;
    const id = setInterval(() => {
      const cur = attemptRef.current;
      if (!cur || (cur.phase !== 'part1' && cur.phase !== 'part2')) return;
      // The clock does not run while the instructions are being read.
      if (cur.phase === 'part1' && !cur.instructionsSeen) return;
      const key = cur.phase === 'part2' ? 'part2Remaining' : 'part1Remaining';
      const left = (key === 'part2Remaining' ? cur.part2Remaining : cur.part1Remaining) - 1;
      const timeSec = { ...cur.timeSec };
      timeSec[cur.current] = (timeSec[cur.current] || 0) + 1;
      const next = { ...cur, timeSec, [key]: Math.max(0, left) } as Attempt;
      tickCount.current += 1;
      if (tickCount.current % 5 === 0 || left <= 0) persist(next); else attemptRef.current = next;
      setAttempt(next);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearInterval(id);
        // auto-submit the part on timeout
        setTimeout(() => submitPart(), 50);
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt?.phase, paper]);

  // save on unmount / tab hide
  useEffect(() => {
    const save = () => { if (attemptRef.current) saveAttempt(attemptRef.current); };
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', save);
    return () => {
      window.removeEventListener('beforeunload', save);
      document.removeEventListener('visibilitychange', save);
    };
  }, []);

  // Esc closes the image zoom
  useEffect(() => {
    if (!zoomImg) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomImg(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoomImg]);

  const counts = useMemo(() => {
    if (!attempt) return null;
    const [s, e] = partRange(attempt);
    const c = { notVisited: 0, notAnswered: 0, answered: 0, marked: 0, answeredMarked: 0 };
    for (let i = s; i < e; i++) c[qState(attempt, i)] += 1;
    return { ...c, from: s, to: e };
  }, [attempt, partRange, qState]);

  if (loadError === 'none') {
    return (
      <Shell desc={desc}>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-ink">No test in progress</h1>
          <p className="mt-3 text-inksoft">
            There is no attempt of this {desc.kind === 'paper' ? 'paper' : 'test'} in this browser
            tab. Start from the {desc.kind === 'paper' ? 'paper page' : desc.kind === 'qbank' ? 'question bank' : 'subject page'} — remember,
            closing the tab erases an attempt by design.
          </p>
          <Link href={desc.detailHref} className="mt-6 inline-block rounded-md bg-med px-6 py-3 font-semibold text-white hover:bg-med-deep">
            {desc.detailLabel}
          </Link>
        </div>
      </Shell>
    );
  }

  if (!paper || !attempt) {
    return (
      <Shell desc={desc}>
        <div className="mx-auto max-w-xl px-4 py-20 text-center text-inksoft">Loading your test…</div>
      </Shell>
    );
  }

  const partLabel = desc.singlePart
    ? (desc.singleSubject ?? (desc.kind === 'qbank' ? 'Question Bank' : 'Subject test'))
    : attempt.phase === 'part2' ? 'Part II' : 'Part I';

  // ---------- instructions screen (before Part I) ----------
  if (attempt.phase === 'part1' && !attempt.instructionsSeen) {
    const begin = () => {
      const a = { ...attempt, instructionsSeen: true };
      persist(a);
      setAttempt(a);
    };
    return (
      <div className="flex min-h-screen flex-col bg-[#EDF2F7]">
        <ExamHeader desc={desc} attempt={attempt} partLabel={partLabel} remaining={null} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-3 py-4 sm:px-4">
          <div className="rounded-md border border-cbt-grey/40 bg-white shadow-card">
            <div className="border-b border-line bg-cbt-panel px-5 py-3">
              <h1 className="text-lg font-bold text-cbt-headdeep">Please read the instructions carefully</h1>
            </div>
            <div className="grid gap-0 md:grid-cols-[1fr_300px]">
              <div className="px-5 py-4 text-[14px] leading-relaxed text-ink">
                <h2 className="font-bold">General Instructions:</h2>
                <ol className="mt-2 list-decimal space-y-2 pl-5">
                  <li>
                    The total duration of this {desc.singlePart ? 'test' : 'part'} is{' '}
                    <strong>{desc.part1Min} minutes</strong> for {desc.part1Count} questions. The
                    clock is set on this device; the countdown timer in the top right corner of
                    the screen displays the remaining time available to complete the{' '}
                    {desc.singlePart ? 'test' : 'part'}. When the timer reaches zero, the{' '}
                    {desc.singlePart ? 'test' : 'part'} will end by itself — you will not be
                    required to submit it.
                  </li>
                  <li>
                    The Question Palette displayed on the right side of the screen shows the status
                    of each question using one of the following symbols:
                    <div className="mt-2 space-y-1.5">
                      {LEGEND_ITEMS.map((item) => (
                        <p key={item.state} className="flex items-center gap-2.5">
                          <PaletteTile state={item.state} size="sm" />
                          <span>{item.desc}</span>
                        </p>
                      ))}
                    </div>
                  </li>
                  <li>
                    The <strong>Mark for Review</strong> status simply indicates that you would like
                    to look at that question again. If a question is answered and marked for review,
                    the answer will be considered for evaluation unless the status is modified.
                  </li>
                  <li>
                    You can click on the <strong>›</strong> arrow to the left of the question palette
                    to collapse it and maximise the question window; click <strong>‹</strong> to
                    view the palette again.
                  </li>
                  <li>
                    Marking scheme: <strong>+1 mark for every correct answer, 0 for wrong or
                    unattempted answers. There is no negative marking.</strong>{' '}
                    {desc.singlePart
                      ? desc.kind === 'qbank'
                        ? 'This is a question-bank set in Exam mode, not a full FMGE paper: your analysis measures your score against the 50% mark — the FMGE pass proportion, used here as a benchmark.'
                        : 'This is a subject test, not a full FMGE paper: your analysis measures your score against the 50% mark — the FMGE pass proportion.'
                      : 'The FMGE pass mark is a fixed 150 of 300 across both parts.'}
                  </li>
                </ol>

                <h2 className="mt-5 font-bold">Navigating to a Question:</h2>
                <ol className="mt-2 list-decimal space-y-2 pl-5" start={6}>
                  <li>
                    Click on the question number in the palette to go directly to that question,
                    or use <strong>Save &amp; Next</strong> / <strong>Previous</strong> below the
                    question.
                  </li>
                </ol>

                <h2 className="mt-5 font-bold">Answering a Question:</h2>
                <ol className="mt-2 list-decimal space-y-2 pl-5" start={7}>
                  <li>
                    Click on the circle before the option you choose. Clicking another option
                    changes your choice; <strong>Clear Response</strong> removes the selected
                    option. Then click <strong>Save &amp; Next</strong> to save your answer and
                    move on.
                  </li>
                  <li>
                    To save your answer and mark the question for review, click{' '}
                    <strong>Mark for Review &amp; Next</strong>.
                  </li>
                  <li>
                    MedSetu extra (not in the real exam): under each question you may mark{' '}
                    <strong>Sure / Unsure / Guessed</strong> to record your confidence. It never
                    affects your score — your analysis uses it to show how your guesses performed.
                  </li>
                </ol>

                <h2 className="mt-5 font-bold">About this mock:</h2>
                <ol className="mt-2 list-decimal space-y-2 pl-5" start={10}>
                  {desc.singlePart ? (
                    <li>
                      This is a subject-wise practice test: {desc.total} questions on{' '}
                      {desc.singleSubject} only, in the same exam-style window. There is no second
                      part — when you submit this test (or its time ends), your full analysis opens
                      at once.
                    </li>
                  ) : (
                    <li>
                      This is a recall-based practice mock of {desc.heading} ({desc.subline.split(' · ')[0]}),
                      modelled on the real exam window. Part I has {desc.part1Count} questions; after you
                      submit it (or its time ends) you will see only your attempt counts — no score —
                      and Part II ({desc.part2Count} questions) follows after a break, exactly in the FMGE
                      manner. Your full analysis unlocks after Part II.
                    </li>
                  )}
                  <li>
                    Your name and answers stay in this browser tab only. Nothing is uploaded or
                    stored anywhere.
                  </li>
                </ol>
              </div>

              <aside className="border-t border-line bg-cbt-panel/60 px-5 py-4 md:border-l md:border-t-0">
                <div className="flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-sm border border-cbt-grey/50 bg-white text-xl font-bold text-cbt-headdeep" aria-hidden>
                    {attempt.name.trim().charAt(0).toUpperCase() || 'C'}
                  </span>
                  <div className="text-[13px] leading-snug">
                    <p><span className="text-inksoft">Candidate Name :</span><br /><strong>{attempt.name}</strong></p>
                    <p className="mt-1.5"><span className="text-inksoft">Subject :</span><br /><strong>{desc.kind === 'paper' ? `${desc.heading} — ${partLabel}` : desc.heading}</strong></p>
                  </div>
                </div>
                <div className="mt-4 border-t border-line pt-3 text-[13px] leading-relaxed text-inksoft">
                  <p><strong className="text-ink">Questions:</strong> {desc.part1Count} in this {desc.singlePart ? 'test' : 'part'}</p>
                  <p><strong className="text-ink">Duration:</strong> {desc.part1Min} minutes</p>
                  <p><strong className="text-ink">Marking:</strong> +1 correct · 0 wrong · no negative marking</p>
                </div>
              </aside>
            </div>

            <div className="border-t border-line px-5 py-4">
              <label className="flex cursor-pointer items-start gap-2.5 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#2F5D8A]"
                />
                I have read and understood the instructions and agree to adhere to them
              </label>
              <button
                type="button"
                disabled={!agree}
                onClick={begin}
                className="mt-4 rounded-sm bg-cbt-green px-6 py-2.5 text-[15px] font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                I am ready to begin
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---------- break screen ----------
  if (attempt.phase === 'break') {
    const s = attempt.part1Summary;
    let answered = 0, markedOnly = 0, markedAll = 0, notAnswered = 0, notVisited = 0;
    for (let i = 0; i < part1End; i++) {
      const st = qState(attempt, i);
      if (st === 'answered' || st === 'answeredMarked') answered += 1;
      if (st === 'marked') markedOnly += 1;
      if (st === 'marked' || st === 'answeredMarked') markedAll += 1;
      if (st === 'notAnswered') notAnswered += 1;
      if (st === 'notVisited') notVisited += 1;
    }
    const startPart2 = () => {
      const visits = { ...attempt.visits };
      visits[part1End] = (visits[part1End] || 0) + 1;
      const a: Attempt = { ...attempt, phase: 'part2', current: part1End, visits, part2Remaining: desc.part2Sec };
      persist(a);
      setAttempt(a);
      setPending(null);
      setRemaining(desc.part2Sec);
    };
    return (
      <div className="flex min-h-screen flex-col bg-[#EDF2F7]">
        <ExamHeader desc={desc} attempt={attempt} partLabel="Part I" remaining={null} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
          <div className="rounded-md border border-cbt-grey/40 bg-white shadow-card">
            <div className="border-b border-line bg-cbt-panel px-5 py-3">
              <h1 className="text-lg font-bold text-cbt-headdeep">Part I submitted — summary</h1>
            </div>
            <div className="px-5 py-5">
              <p className="text-[14px] leading-relaxed text-inksoft">
                Just like the real FMGE, no score is shown between parts. Part II has{' '}
                {desc.part2Count} questions and a fresh {desc.part2Sec / 60} minutes.
              </p>
              <table className="mt-4 w-full border-collapse text-sm tabular-nums">
                <thead>
                  <tr className="bg-cbt-band text-left text-cbt-headdeep">
                    <th className="border border-line px-3 py-2 font-semibold">Section</th>
                    <th className="border border-line px-3 py-2 font-semibold">No. of Questions</th>
                    <th className="border border-line px-3 py-2 font-semibold">Answered</th>
                    <th className="border border-line px-3 py-2 font-semibold">Not Answered</th>
                    <th className="border border-line px-3 py-2 font-semibold">Marked for Review</th>
                    <th className="border border-line px-3 py-2 font-semibold">Not Visited</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-line px-3 py-2 font-medium">Part I</td>
                    <td className="border border-line px-3 py-2">{s ? s.total : part1End}</td>
                    <td className="border border-line px-3 py-2">{answered}</td>
                    <td className="border border-line px-3 py-2">{notAnswered + markedOnly}</td>
                    <td className="border border-line px-3 py-2">{markedAll}</td>
                    <td className="border border-line px-3 py-2">{notVisited}</td>
                  </tr>
                </tbody>
              </table>
              <button
                type="button"
                onClick={startPart2}
                className="mt-6 rounded-sm bg-cbt-green px-6 py-2.5 text-[15px] font-bold text-white hover:brightness-110"
              >
                Proceed to Part II
              </button>
              <p className="mt-3 text-xs text-inksoft">
                Part II: {desc.part2Count} questions · {desc.part2Sec / 60} minutes · the clock starts when the part opens.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (attempt.phase === 'done') {
    return (
      <Shell desc={desc}>
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-ink">This attempt is complete</h1>
          <Link href={desc.analysisHref} className="mt-6 inline-block rounded-md bg-med px-6 py-3 font-semibold text-white hover:bg-med-deep">
            View your analysis
          </Link>
        </div>
      </Shell>
    );
  }

  // ---------- runner ----------
  const [rangeStart, rangeEnd] = partRange(attempt);
  const idx = attempt.current;
  const q = paper.questions[idx];
  const inPartPos = idx - rangeStart + 1;
  const inPartTotal = rangeEnd - rangeStart;
  const isLast = idx === rangeEnd - 1;
  const isFirst = idx === rangeStart;
  const conf = attempt.confidence[idx];
  const lowTime = remaining <= 300;

  const setConfidence = (c: Confidence) => {
    const confidence = { ...attempt.confidence };
    if (confidence[idx] === c) delete confidence[idx]; else confidence[idx] = c;
    const a = { ...attempt, confidence };
    persist(a);
    setAttempt(a);
  };

  const markAndNext = () => {
    const cur = attemptRef.current;
    if (!cur) return;
    let a = commitInto(cur, pending);
    a = { ...a, marked: { ...a.marked, [a.current]: true } };
    persist(a);
    setAttempt(a);
    if (!isLast) {
      const nIdx = idx + 1;
      const visits = { ...a.visits, [nIdx]: (a.visits[nIdx] || 0) + 1 };
      const b = { ...a, visits, current: nIdx };
      persist(b);
      setAttempt(b);
      setPending(b.answers[nIdx] ?? null);
    }
  };

  const clearResponse = () => {
    const cur = attemptRef.current;
    if (!cur) return;
    const a = commitInto(cur, null);
    persist(a);
    setAttempt(a);
    setPending(null);
  };

  const legendCounts: Record<QState, number> = counts
    ? {
        answered: counts.answered + counts.answeredMarked,
        notAnswered: counts.notAnswered,
        notVisited: counts.notVisited,
        marked: counts.marked,
        answeredMarked: counts.answeredMarked,
      }
    : { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, answeredMarked: 0 };

  const palette = (
    <div className="flex h-full flex-col">
      <div className="space-y-1 border-b border-line pb-2.5 text-[11.5px] font-medium text-ink">
        {LEGEND_ITEMS.map((item) => (
          <p key={item.state} className="flex items-center gap-2">
            <PaletteTile state={item.state} size="sm" />
            <span className="flex-1">{item.label}</span>
            <strong className="tabular-nums">{legendCounts[item.state]}</strong>
          </p>
        ))}
      </div>
      <div className="mt-3 grid flex-1 content-start grid-cols-5 gap-1.5 overflow-y-auto pr-0.5">
        {paper.questions.slice(rangeStart, rangeEnd).map((qq, k) => {
          const gi = rangeStart + k;
          return (
            <PaletteTile
              key={qq.n}
              state={qState(attempt, gi)}
              label={String(gi - rangeStart + 1)}
              current={gi === idx}
              onClick={() => { goTo(gi); setPaletteOpen(false); }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-[11px] leading-snug text-inksoft">
        {desc.singlePart
          ? desc.kind === 'qbank'
            ? `This set has ${inPartTotal} questions in a single part.`
            : `This subject test has ${inPartTotal} questions in a single part.`
          : `Palette shows this part only (${inPartTotal} questions).`}
      </p>
      <button
        type="button"
        onClick={() => { goTo(idx); setConfirmSubmit(true); }}
        className="mt-2 w-full rounded-sm bg-cbt-headdeep px-4 py-2.5 text-sm font-bold text-white hover:brightness-125"
      >
        Submit
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#EDF2F7]">
      <ExamHeader desc={desc} attempt={attempt} partLabel={partLabel} remaining={remaining} lowTime={lowTime} />

      {/* Section band */}
      <div className="border-b border-cbt-grey/40 bg-cbt-band">
        <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-1.5 sm:px-4">
          <span className="text-[13px] font-semibold text-cbt-headdeep">Sections:</span>
          <span className="rounded-t-sm bg-white px-3 py-1 text-[13px] font-bold text-cbt-headdeep shadow-sm">
            {partLabel}
          </span>
          <span className="ml-2 hidden text-xs text-inksoft sm:inline">
            {desc.singlePart
              ? `${inPartTotal} questions · single part`
              : `${inPartTotal} questions · palette shows this part only`}
          </span>
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
        {/* Question pane */}
        <section className="flex min-w-0 flex-1 flex-col border border-cbt-grey/40 bg-white shadow-card">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line px-4 pt-3 sm:px-5">
            <p className="text-[13px] text-inksoft">
              Marks for correct answer: <strong className="text-ink">1</strong> | Negative Marks:{' '}
              <strong className="text-ink">0</strong>
            </p>
            <span className="ml-auto text-xs text-inksoft">
              Time on this question:{' '}
              <span className="font-mono font-semibold tabular-nums text-ink">{fmtClock(attempt.timeSec[idx] || 0)}</span>
            </span>
          </div>
          <div className="flex items-baseline gap-2 px-4 pt-2.5 sm:px-5">
            <h1 className="text-[17px] font-bold text-ink">Question No. {inPartPos}</h1>
            <span className="text-xs text-inksoft">
              {desc.singlePart
                ? `(Q${idx + 1} of ${total} in this test)`
                : `(Q${idx + 1} of ${total} in the full paper)`}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 sm:px-5">
            {q.img && (
              <p className="mt-3 rounded-sm bg-accent-soft px-3 py-2 text-[13px] font-medium text-accent-deep">
                {desc.singlePart
                  ? desc.kind === 'qbank'
                    ? 'This question refers to an image in the source material. The image is not included in this edition — answer from the stem, or skip it.'
                    : 'This question refers to an image from the source test. The image could not be recovered for this edition — answer from the stem, or skip it.'
                  : 'This question refers to an image from the original paper. The image is not available in this recall edition — answer from the stem, or skip it.'}
              </p>
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
                      width={imgDims(src)?.width}
                      height={imgDims(src)?.height}
                      className="max-h-[420px] w-auto max-w-full rounded-sm border border-line bg-white object-contain"
                    />
                    <span className="mt-1 block text-left text-[11px] text-inksoft">Click the image to enlarge</span>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-1" role="radiogroup" aria-label="Options">
              {(q.options.length ? q.options : q.optionImages ?? []).map((opt, oi) => {
                const selected = pending === oi;
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-start gap-3 rounded-sm px-2.5 py-2.5 text-[15px] leading-relaxed transition focus-within:ring-2 focus-within:ring-inset focus-within:ring-cbt-head/40 ${
                      selected ? 'bg-cbt-panel' : 'hover:bg-[#F4F8FC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${idx}`}
                      checked={selected}
                      onChange={() => setPending(oi)}
                      onClick={() => { if (selected) setPending(null); }}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                        selected ? 'border-cbt-head' : 'border-inksoft/60'
                      }`}
                    >
                      {selected && <span className="h-[9px] w-[9px] rounded-full bg-cbt-head" />}
                    </span>
                    {q.optionImages ? (
                      <img
                        src={q.optionImages[oi]}
                        alt={`Option ${oi + 1}`}
                        loading="lazy"
                        width={imgDims(q.optionImages[oi])?.width}
                        height={imgDims(q.optionImages[oi])?.height}
                        className="max-h-44 w-auto max-w-full rounded-sm border border-line bg-white object-contain"
                      />
                    ) : (
                      <span className={selected ? 'font-medium text-ink' : 'text-ink'}>{opt}</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Confidence — MedSetu extra, kept subtle */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
              <span className="text-xs font-medium text-inksoft">
                Your confidence (optional — for your analysis):
              </span>
              {(['sure', 'unsure', 'guessed'] as Confidence[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConfidence(c)}
                  aria-pressed={conf === c}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                    conf === c
                      ? 'bg-med text-white'
                      : 'border border-line bg-white text-inksoft hover:border-med hover:text-med'
                  }`}
                >
                  {c === 'guessed' ? 'Guessed' : c}
                </button>
              ))}
              {desc.kind === 'qbank' && q.bankId && q.subject && (() => {
                const slug = QBANK_META.subjects.find((s) => s.name === q.subject)?.slug;
                if (!slug) return null;
                const marked = isBookmarked(q.bankId);
                return (
                  <button
                    type="button"
                    aria-pressed={marked}
                    onClick={() => { toggleBookmark({ id: q.bankId!, slug }); setBmTick((t) => t + 1); }}
                    className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold transition ${
                      marked
                        ? 'bg-accent text-white'
                        : 'border border-line bg-white text-inksoft hover:border-accent hover:text-accent-deep'
                    }`}
                  >
                    {marked ? '★ Bookmarked' : '☆ Bookmark'}
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Bottom action bar — TCS order */}
          <div className="flex flex-wrap items-center gap-2 border-t border-cbt-grey/40 bg-cbt-panel px-4 py-2.5 sm:px-5">
            <button
              type="button"
              onClick={markAndNext}
              className="rounded-sm border border-cbt-purple bg-white px-4 py-2 text-sm font-semibold text-cbt-purple transition hover:bg-cbt-purple hover:text-white"
            >
              Mark for Review &amp; Next
            </button>
            <button
              type="button"
              onClick={clearResponse}
              className="rounded-sm border border-cbt-grey/60 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist"
            >
              Clear Response
            </button>
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                disabled={isFirst}
                onClick={() => goTo(idx - 1)}
                className="rounded-sm border border-cbt-grey/60 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-mist disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => { if (!isLast) goTo(idx + 1); else goTo(idx); }}
                className="rounded-sm bg-cbt-green px-5 py-2 text-sm font-bold text-white transition hover:brightness-110"
              >
                Save &amp; Next
              </button>
              <button
                type="button"
                onClick={() => { goTo(idx); setConfirmSubmit(true); }}
                className="rounded-sm bg-cbt-headdeep px-5 py-2 text-sm font-bold text-white hover:brightness-125 lg:hidden"
              >
                Submit
              </button>
            </div>
          </div>
        </section>

        {/* Palette — desktop */}
        {paletteCollapsed ? (
          <div className="sticky top-3 ml-2 hidden h-fit lg:block">
            <button
              type="button"
              onClick={() => setPaletteCollapsed(false)}
              aria-label="Show question palette"
              className="rounded-sm bg-cbt-head px-2 py-3 text-sm font-bold text-white shadow-card hover:brightness-110"
            >
              ‹
            </button>
          </div>
        ) : (
          <aside className="sticky top-3 ml-3 hidden h-[calc(100vh-8.5rem)] w-[248px] shrink-0 border border-cbt-grey/40 bg-white shadow-card lg:block">
            <div className="flex items-center justify-between bg-cbt-band px-3 py-2">
              <h2 className="text-[13px] font-bold text-cbt-headdeep">Question Palette</h2>
              <button
                type="button"
                onClick={() => setPaletteCollapsed(true)}
                aria-label="Collapse question palette"
                className="rounded-sm px-1.5 text-sm font-bold text-cbt-headdeep hover:bg-white"
              >
                ›
              </button>
            </div>
            <div className="h-[calc(100%-37px)] px-3 py-2.5">{palette}</div>
          </aside>
        )}
      </div>

      {/* Palette — mobile drawer */}
      {paletteOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Question palette">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPaletteOpen(false)} />
          <div className="sheet-in-up absolute bottom-0 left-0 right-0 max-h-[78vh] overflow-hidden rounded-t-xl bg-white">
            <div className="flex items-center justify-between bg-cbt-band px-4 py-2.5">
              <h2 className="text-sm font-bold text-cbt-headdeep">Question Palette</h2>
              <button type="button" onClick={() => setPaletteOpen(false)} className="rounded-sm border border-cbt-grey/50 bg-white px-3 py-1 text-sm font-semibold">
                Close
              </button>
            </div>
            <div className="max-h-[62vh] px-4 py-3">{palette}</div>
          </div>
        </div>
      )}

      {/* Image zoom */}
      {zoomImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged figure"
          onClick={() => setZoomImg(null)}
        >
          <img src={zoomImg} alt="Enlarged figure" className="max-h-[90vh] max-w-full rounded-sm bg-white object-contain" />
          <button
            type="button"
            onClick={() => setZoomImg(null)}
            aria-label="Close enlarged figure"
            className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-ink shadow-lift"
          >
            ✕ Close
          </button>
        </div>
      )}

      {/* Submit confirmation — TCS summary table */}
      {confirmSubmit && counts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirm submission">
          <div className="absolute inset-0 bg-black/45" onClick={() => setConfirmSubmit(false)} />
          <div className="sheet-in-up relative w-full max-w-2xl rounded-md bg-white shadow-lift">
            <div className="border-b border-line bg-cbt-panel px-5 py-3">
              <h2 className="text-base font-bold text-cbt-headdeep">
                Submit {partLabel}? — please confirm the summary
              </h2>
            </div>
            <div className="px-5 py-4">
              <table className="w-full border-collapse text-sm tabular-nums">
                <thead>
                  <tr className="bg-cbt-band text-left text-cbt-headdeep">
                    <th className="border border-line px-3 py-2 font-semibold">Section</th>
                    <th className="border border-line px-3 py-2 font-semibold">No. of Questions</th>
                    <th className="border border-line px-3 py-2 font-semibold">Answered</th>
                    <th className="border border-line px-3 py-2 font-semibold">Not Answered</th>
                    <th className="border border-line px-3 py-2 font-semibold">Marked for Review</th>
                    <th className="border border-line px-3 py-2 font-semibold">Not Visited</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-line px-3 py-2 font-medium">{partLabel}</td>
                    <td className="border border-line px-3 py-2">{counts.to - counts.from}</td>
                    <td className="border border-line px-3 py-2">{counts.answered + counts.answeredMarked}</td>
                    <td className="border border-line px-3 py-2">{counts.notAnswered + counts.marked}</td>
                    <td className="border border-line px-3 py-2">{counts.marked + counts.answeredMarked}</td>
                    <td className="border border-line px-3 py-2">{counts.notVisited}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-sm leading-relaxed text-inksoft">
                Time left: <strong className="text-ink">{fmtClock(remaining)}</strong>.{' '}
                {desc.singlePart
                  ? desc.kind === 'qbank'
                    ? 'Submitting ends this set and opens your full analysis. This cannot be undone.'
                    : 'Submitting ends this subject test and opens your full analysis. This cannot be undone.'
                  : attempt.phase === 'part2'
                    ? 'Submitting Part II ends the test and opens your full analysis. This cannot be undone.'
                    : 'You cannot return to Part I after submitting. No score is shown until Part II is done — just like the real exam.'}
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(false)}
                  className="flex-1 rounded-sm border border-cbt-grey/60 bg-white px-4 py-2.5 font-semibold text-ink hover:bg-mist"
                >
                  NO — keep writing
                </button>
                <button
                  type="button"
                  onClick={submitPart}
                  className="flex-1 rounded-sm bg-cbt-green px-4 py-2.5 font-bold text-white hover:brightness-110"
                >
                  YES — submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** TCS-style exam header: exam title left, candidate block right, timer. */
function ExamHeader({
  desc,
  attempt,
  partLabel,
  remaining,
  lowTime = false,
}: {
  desc: TestDescriptor;
  attempt: Attempt;
  partLabel: string;
  remaining: number | null;
  lowTime?: boolean;
}) {
  return (
    <header className="bg-cbt-head text-white">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-1 px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold leading-snug">
            Foreign Medical Graduate Examination (FMGE) — Mock Test
          </p>
          <p className="flex flex-wrap items-baseline gap-x-2 text-xs leading-snug">
            <span data-brand-lockup className="inline-flex items-baseline gap-1.5">
              <span className="text-[13px] font-bold tracking-tight">MedSetu</span>
              <span className="text-[11px] font-medium opacity-80">by Naitik Library</span>
            </span>
            <span className="opacity-85">
              · practice window · {desc.kind === 'paper' ? <>Paper: {desc.heading} · {partLabel}</> : desc.heading}
            </span>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {remaining !== null && (
            <div className="text-right">
              <p className="text-[11px] font-medium uppercase tracking-wide opacity-85">Time Left</p>
              <p
                className={`font-mono text-[22px] font-bold leading-none tabular-nums ${lowTime ? 'text-red-300' : ''}`}
                aria-label="Time remaining"
              >
                {fmtClock(remaining)}
              </p>
            </div>
          )}
          <span className="flex h-11 w-11 items-center justify-center rounded-sm border border-white/50 bg-white/15 text-base font-bold" aria-hidden>
            {attempt.name.trim().charAt(0).toUpperCase() || 'C'}
          </span>
          <div className="hidden text-[12.5px] leading-snug sm:block">
            <p><span className="opacity-80">Candidate Name :</span> <strong>{attempt.name}</strong></p>
            <p><span className="opacity-80">Subject :</span> <strong>{desc.heading}</strong></p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Shell({ desc, children }: { desc: TestDescriptor; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="bg-cbt-head text-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-snug">
              Foreign Medical Graduate Examination (FMGE) — Mock Test
              <span className="ml-2 text-xs font-medium opacity-80">{desc.heading}</span>
            </p>
            <p className="flex flex-wrap items-baseline gap-x-2 text-xs leading-snug">
              <span data-brand-lockup className="inline-flex items-baseline gap-1.5">
                <span className="text-[13px] font-bold tracking-tight">MedSetu</span>
                <span className="text-[11px] font-medium opacity-80">by Naitik Library</span>
              </span>
              <span className="opacity-85">· practice window</span>
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
