'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { loadPaper } from '../lib/papers';
import { loadSubjectTest } from '../lib/subjects';
import { loadSeriesTest } from '../lib/series';
import { QBANK_META, addMistake, loadQBankTestData, recordProgress } from '../lib/qbank';
import { loadAttempt, fmtDuration, fmtClock } from '../lib/store';
import { analyseAttempt } from '../lib/analysis';
import type { Analysis, PerQ } from '../lib/analysis';
import type { Attempt, TestData, TestDescriptor } from '../lib/types';
import { SiteFooter } from './SiteChrome';
import { SiteHeader } from './SiteHeader';
import { PrintReport, PrintKey } from './PrintViews';
import { classifyPerQ, breakdownRows, topicRows, journeyChanges, CLASS_META, CLASS_ORDER } from '../lib/classes';
import { SolutionSheet, statusChip } from './Solution';

type Filter = 'wrong' | 'all' | 'correct' | 'skipped' | 'marked' | 'guessed' | 'added' | 'image';
type PrintTarget = 'report' | 'key' | null;

const SUBJECT_FOOTNOTE =
  "Subject groups follow the source book's sections. Recall compilations group some questions differently from the official NBEMS blueprint, so treat subjects with very few questions as indicative.";

function ScoreDonut({ score, total, passed, tickLabel }: { score: number; total: number; passed: boolean | null; tickLabel: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const frac = total ? score / total : 0;
  const colour = passed === null ? '#006D77' : passed ? '#2E7D43' : '#C0392B';
  return (
    <svg viewBox="0 0 128 128" className="h-32 w-32 shrink-0" role="img" aria-label={`Score ${score} of ${total}`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="#E8EEF1" strokeWidth="11" />
      <circle
        cx="64" cy="64" r={r} fill="none"
        stroke={colour} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={`${Math.max(0.001, frac) * c} ${c}`}
        transform="rotate(-90 64 64)"
      />
      {/* pass-mark tick at 50% */}
      <line x1="64" y1="2" x2="64" y2="12" stroke="#1B2A32" strokeWidth="2.5" />
      <text x="64" y="60" textAnchor="middle" fontSize="30" fontWeight="800" fill="#1B2A32">{score}</text>
      <text x="64" y="80" textAnchor="middle" fontSize="12.5" fill="#546A75">of {total}</text>
      <text x="64" y="95" textAnchor="middle" fontSize="9" fill="#546A75">{tickLabel}</text>
    </svg>
  );
}

const cellTh = 'py-2 pr-3 font-semibold';
const cellTd = 'py-2 pr-3 tabular-nums';

export default function AnalysisView({ desc }: { desc: TestDescriptor }) {
  const [paper, setPaper] = useState<TestData | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [state, setState] = useState<'loading' | 'none' | 'unfinished' | 'ready'>('loading');
  const [filter, setFilter] = useState<Filter>('wrong');
  const [printTarget, setPrintTarget] = useState<PrintTarget>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [navList, setNavList] = useState<PerQ[]>([]);
  const [jump, setJump] = useState('');

  const isSubject = desc.kind === 'subject';
  // Benchmarked tests (subject tests + question-bank sets) are measured
  // against the 50% mark; single-subject layout applies to subject tests
  // and to question-bank sets drawn from one subject.
  const isBenchmark = desc.kind !== 'paper';
  const isSingle = isSubject || (desc.kind === 'qbank' && !!desc.singleSubject);

  useEffect(() => {
    let alive = true;
    (async () => {
      const att = loadAttempt(desc.id);
      if (!att) { setState('none'); return; }
      if (att.phase !== 'done') { setState('unfinished'); return; }
      const p = desc.kind === 'paper'
        ? await loadPaper(desc.id)
        : desc.kind === 'qbank'
          ? await loadQBankTestData(desc.id)
          : desc.kind === 'series'
            ? await loadSeriesTest(desc.id)
            : await loadSubjectTest(desc.id);
      if (!alive) return;
      setPaper(p);
      setAttempt(att);
      setState('ready');
    })();
    return () => { alive = false; };
  }, [desc.id, desc.kind]);

  // Question-bank Exam mode: wrong answers join My Mistakes and answered
  // questions join this tab's progress — once per attempt.
  useEffect(() => {
    if (state !== 'ready' || !paper || !attempt || desc.kind !== 'qbank') return;
    const flag = 'medsetu-qb-counted';
    try {
      if (sessionStorage.getItem(flag) === desc.id) return;
      sessionStorage.setItem(flag, desc.id);
    } catch { return; }
    paper.questions.forEach((q, i) => {
      const ans = attempt.answers[i];
      if (ans === null || ans === undefined || !q.bankId || !q.subject) return;
      const slug = QBANK_META.subjects.find((s) => s.name === q.subject)?.slug;
      if (!slug) return;
      recordProgress(slug, ans === q.correct);
      if (ans !== q.correct) addMistake({ id: q.bankId, slug });
    });
  }, [state, paper, attempt, desc.kind]);

  useEffect(() => {
    if (!printTarget) return;
    const t = setTimeout(() => window.print(), 80);
    const clear = () => setPrintTarget(null);
    window.addEventListener('afterprint', clear);
    return () => { clearTimeout(t); window.removeEventListener('afterprint', clear); };
  }, [printTarget]);

  const a: Analysis | null = useMemo(
    () => (paper && attempt ? analyseAttempt(paper, attempt) : null),
    [paper, attempt]
  );

  const topics = useMemo(() => (paper && a ? topicRows(paper, a) : []), [paper, a]);
  const classified = useMemo(() => (a ? classifyPerQ(a) : []), [a]);

  if (state !== 'ready' || !paper || !attempt || !a) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-20 text-center">
          {state === 'loading' && <p className="text-inksoft">Preparing your analysis…</p>}
          {state === 'none' && (
            <>
              <h1 className="text-2xl font-bold text-ink">No completed attempt found</h1>
              <p className="mt-3 text-inksoft">
                Analysis appears here after you finish a {isSubject ? 'test' : 'mock'} in this
                browser tab. MedSetu stores nothing on any server, so a closed tab means a clean
                slate.
              </p>
            </>
          )}
          {state === 'unfinished' && (
            <>
              <h1 className="text-2xl font-bold text-ink">This attempt isn&apos;t finished yet</h1>
              <p className="mt-3 text-inksoft">
                {isSubject
                  ? 'Your full analysis opens when you submit this test.'
                  : 'Your full analysis unlocks after Part II — just like the real exam.'}
              </p>
            </>
          )}
          {state !== 'loading' && (
            <Link href={desc.detailHref} className="mt-6 inline-block rounded-md bg-med px-6 py-3 font-semibold text-white hover:bg-med-deep">
              {desc.detailLabel}
            </Link>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const v = a.verdict;
  // Subject tests are measured against the 50% mark — the FMGE pass
  // proportion. It is a benchmark, never an official pass/fail verdict.
  const benchMark = Math.ceil(a.total / 2);
  const benchPassed = v.score >= benchMark;
  const benchGap = benchMark - v.score;

  const filterCounts: Record<Filter, number> = {
    all: a.total,
    correct: a.correct,
    wrong: a.wrong,
    skipped: a.skipped,
    marked: a.perQ.filter((r) => r.marked).length,
    guessed: a.perQ.filter((r) => r.confidence === 'guessed' && r.status !== 'skipped').length,
    added: a.perQ.filter((r) => r.added).length,
    image: a.perQ.filter((r) => r.hasImages || r.img).length,
  };

  const explorerRows = a.perQ.filter((r) => {
    switch (filter) {
      case 'all': return true;
      case 'correct': return r.status === 'correct';
      case 'wrong': return r.status === 'wrong';
      case 'skipped': return r.status === 'skipped';
      case 'marked': return r.marked;
      case 'guessed': return r.confidence === 'guessed' && r.status !== 'skipped';
      case 'added': return r.added;
      case 'image': return r.hasImages || r.img;
    }
  });
  // The review queue is wrong-first: within the Wrong filter, slowest
  // attempts first (knowledge gaps before rushed slips).
  const displayRows = filter === 'wrong'
    ? [...explorerRows].sort((x, y) => y.timeSec - x.timeSec)
    : explorerRows;

  const openSolution = (idx: number, list: PerQ[]) => {
    setNavList(list);
    setOpenIdx(idx);
  };
  const openRow: PerQ | null = openIdx !== null ? a.perQ[openIdx] : null;
  const navPos = openRow ? navList.findIndex((r) => r.idx === openRow.idx) : -1;

  const doJump = () => {
    const n = parseInt(jump, 10);
    if (!Number.isFinite(n) || n < 1 || n > a.total) return;
    openSolution(n - 1, a.perQ);
    setJump('');
  };

  const downloadButtons = (
    <>
      <button type="button" onClick={() => setPrintTarget('report')} className="rounded-md bg-med px-4 py-2.5 text-sm font-semibold text-white hover:bg-med-deep">
        Download full report (PDF)
      </button>
      <button type="button" onClick={() => setPrintTarget('key')} className="rounded-md border border-med px-4 py-2.5 text-sm font-semibold text-med hover:bg-med-soft">
        Download answer key (PDF)
      </button>
    </>
  );

  const segLabel = (i: number, from: number, to: number) =>
    desc.kind === 'paper'
      ? `${i === 0 ? 'Part I' : 'Part II'} (Q${from + 1}–${to})`
      : `${i === 0 ? 'First half' : 'Second half'} (Q${from + 1}–${to})`;

  const subjectRow = a.subjects.length === 1 ? a.subjects[0] : null;

  const classGroups = CLASS_ORDER.map((cls) => ({ cls, items: classified.filter((c) => c.cls === cls) }));
  const unclassified = classified.filter((c) => c.cls === null).length;
  const breakdown = breakdownRows(a);
  const journey = journeyChanges(attempt, paper);
  const sectionList: [string, string][] = [
    ['overview', 'Overview'],
    ['performance', 'Performance Analysis'],
    ['potential', 'Score Potential'],
    ['attempts', 'Attempt Analysis'],
    ['time', 'Time Analysis'],
    ...(topics.length > 0 ? [['topics', 'Topic Analysis'] as [string, string]] : []),
    ['journey', 'Question Journey'],
    ['solutions', 'Qs by Qs Analysis'],
  ];
  const navItems: [string, string][] = [...sectionList, ['key', 'Answer key']];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="no-print">
        <SiteHeader />

        {/* Sticky sub-navigation */}
        <div className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden">
            {navItems.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="shrink-0 rounded-md px-2 py-1.5 text-[13px] font-semibold text-inksoft transition-colors hover:bg-mist hover:text-ink"
              >
                {label}
              </a>
            ))}
            <span className="ml-auto hidden shrink-0 items-center gap-2 md:flex">{downloadButtons}</span>
          </div>
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
          <p className="mt-5 text-sm">
            <Link href={desc.backHref} className="font-semibold text-med hover:underline">← {desc.backLabel}</Link>
          </p>
          <p className="mt-1.5 text-[15px] font-semibold text-med-deep">
            👋 Hey {attempt.name}, here is your analysis
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {desc.heading}
          </h1>
          <p className="mt-1 text-sm text-inksoft">
            {desc.subline} · attempted on{' '}
            {attempt.finishedAt
              ? new Date(attempt.finishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
              : '—'}{' '}
            · calculated on your device, stored nowhere.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 md:hidden">{downloadButtons}</div>

          {/* Contents — the parts of this analysis */}
          <section id="contents" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">Contents</h2>
            <p className="mt-1 text-sm text-inksoft">
              This analysis is organised in {sectionList.length} parts. Use this list to jump
              straight to the details you want.
            </p>
            <ol className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {sectionList.map(([id, label], i) => (
                <li key={id}>
                  <a href={`#${id}`} className="group flex items-baseline gap-3 text-[15px]">
                    <span className="font-bold tabular-nums text-med">{i + 1}.</span>
                    <span className="font-medium text-ink group-hover:underline">{label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>

          {/* 1 · Overview */}
          <section id="overview" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center gap-6">
              <ScoreDonut
                score={v.score}
                total={v.total}
                passed={isBenchmark ? benchPassed : v.full ? v.passed : null}
                tickLabel={isBenchmark ? `50% mark = ${benchMark} ↑` : 'pass mark 150 ↑'}
              />
              <div className="min-w-[240px] flex-1">
                {isBenchmark ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      {benchPassed ? (
                        <span className="rounded-md bg-ok px-3.5 py-1.5 text-base font-bold text-white">AT / ABOVE THE 50% MARK</span>
                      ) : (
                        <span className="rounded-md bg-bad px-3.5 py-1.5 text-base font-bold text-white">BELOW THE 50% MARK</span>
                      )}
                      <span className="text-lg font-semibold text-ink">{v.percentage}%</span>
                    </div>
                    <p className="mt-2.5 text-3xl font-bold tabular-nums text-ink">
                      {benchPassed
                        ? <>Cleared the 50% mark by {v.score - benchMark}</>
                        : <>{benchGap} more correct answer{benchGap === 1 ? '' : 's'} needed</>}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-inksoft">
                      50% of {v.total} = {benchMark} — {desc.benchmarkNote ??
                        'the FMGE pass proportion. This is a subject test, so there is no official pass; the 50% line is a benchmark only.'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      {v.full ? (
                        v.passed ? (
                          <span className="rounded-md bg-ok px-3.5 py-1.5 text-lg font-bold text-white">PASS</span>
                        ) : (
                          <span className="rounded-md bg-bad px-3.5 py-1.5 text-lg font-bold text-white">NOT YET</span>
                        )
                      ) : (
                        <span className="rounded-md bg-mist px-3.5 py-1.5 text-base font-bold text-ink">
                          Pass pace: 50% = {v.passMark} of {v.total}
                        </span>
                      )}
                      <span className="text-lg font-semibold text-ink">{v.percentage}%</span>
                    </div>
                    {v.full ? (
                      <p className="mt-2.5 text-sm leading-relaxed text-inksoft">
                        {v.passed
                          ? `You cleared the fixed FMGE pass mark of 150 by ${v.score - 150} marks.`
                          : `You are ${v.gapToPass} marks short of the fixed FMGE pass mark of 150.`}
                      </p>
                    ) : (
                      <p className="mt-2.5 text-sm leading-relaxed text-inksoft">
                        The real FMGE pass mark is 150/300 = 50%. This edition has {v.total} questions,
                        so no pass/fail verdict is printed against 150 — at 50% pace you would need{' '}
                        {v.passMark} of {v.total}; you scored {v.score}.
                      </p>
                    )}
                  </>
                )}
                <div className="mt-3">
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-mist">
                    <div
                      className={`h-full rounded-full ${isBenchmark ? (benchPassed ? 'bg-ok' : 'bg-bad') : v.full ? (v.passed ? 'bg-ok' : 'bg-bad') : 'bg-med'}`}
                      style={{ width: `${Math.min(100, (v.score / v.total) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-inksoft">
                    {isBenchmark ? 'Bar midpoint = the 50% mark' : 'Bar midpoint = pass mark (50%)'}
                  </p>
                </div>
              </div>
            </div>

            {desc.kind === 'paper' && desc.addedCount > 0 && (
              <p className="mt-4 rounded-lg bg-med-soft/60 px-4 py-3 text-sm leading-relaxed text-ink">
                On this paper&apos;s own {a.original.total} questions you scored{' '}
                <strong>{a.original.correct} / {a.original.total}</strong>. The score above also
                includes {desc.addedCount} completion questions added from other years&apos; papers
                to bring this mock to the full 300 — each is marked “Added · from …” in the
                solutions below.
              </p>
            )}

            {/* Accuracy breakdown — counts, shares, stacked bar */}
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line text-center sm:grid-cols-5">
              {[
                [String(a.attempted), `attempted · ${Math.round((a.attempted / a.total) * 1000) / 10}% of ${a.total}`],
                [String(a.correct), 'correct'],
                [String(a.wrong), 'wrong'],
                [String(a.skipped), `skipped · ${Math.round((a.skipped / a.total) * 1000) / 10}%`],
                [`${a.accuracy}%`, 'accuracy (of attempted)'],
              ].map(([big, small]) => (
                <div key={small} className="bg-white px-3 py-3">
                  <p className="text-[22px] font-bold leading-tight tabular-nums text-ink">{big}</p>
                  <p className="text-[11px] font-medium text-inksoft">{small}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full" role="img" aria-label={`Breakdown: ${a.correct} correct, ${a.wrong} wrong, ${a.skipped} skipped`}>
              <span className="block h-full bg-ok" style={{ width: `${(a.correct / a.total) * 100}%` }} />
              <span className="block h-full bg-bad" style={{ width: `${(a.wrong / a.total) * 100}%` }} />
              <span className="block h-full bg-cbt-grey" style={{ width: `${(a.skipped / a.total) * 100}%` }} />
            </div>
            <p className="mt-1.5 flex flex-wrap gap-x-4 text-[11px] font-medium tabular-nums text-inksoft">
              <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-ok" />Correct {a.correct}</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-bad" />Wrong {a.wrong}</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-cbt-grey" />Skipped {a.skipped}</span>
              <span>Time used {fmtDuration(a.timeUsedSec)} of {fmtDuration(a.timeDetail.availableSec)}</span>
            </p>

            {desc.kind === 'paper' && desc.passPct && (
              <p className="mt-4 border-t border-line pt-3.5 text-sm leading-relaxed text-inksoft">
                Context: in the real {desc.subline.split(' · ')[0]}, {desc.passPct.approx ? 'about ' : ''}
                <strong className="text-ink">{desc.passPct.pct}%</strong> of candidates passed.
                MedSetu shows no rank or percentile — with no cohort of test-takers here, any such
                number would be invented.
              </p>
            )}
          </section>
          {/* 2 · Performance Analysis */}
          <section id="performance" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">
              {isSingle ? `${desc.singleSubject} — result` : 'Performance Analysis'}
            </h2>
            {!isSingle && a.hasSubjects && (
              <>
                <h3 className="mt-5 text-[15px] font-bold text-ink">Test breakdown</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-mist/50 text-xs uppercase tracking-wide text-inksoft">
                        <th className={cellTh}>Subject</th>
                        <th className={cellTh}>Score</th>
                        <th className={cellTh}>Attempted · Correct</th>
                        <th className={cellTh}>Attempted · Wrong</th>
                        <th className={cellTh}>Not Attempted</th>
                        <th className="py-2 font-semibold">Not Visited</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[breakdown.overall, ...breakdown.rows].map((r) => (
                        <tr
                          key={r.subject}
                          className={`border-b border-line/70 ${r.subject === 'Overall' ? 'bg-med-soft/50 font-semibold' : ''}`}
                        >
                          <td className="py-2 pr-3 font-medium text-ink">
                            {r.subject}
                            <span className="text-inksoft"> · {r.total} Qs</span>
                          </td>
                          <td className={cellTd}>{r.score} / {r.total}</td>
                          <td className={cellTd}>{r.correct} / {r.total}</td>
                          <td className={cellTd}>{r.wrong} / {r.total}</td>
                          <td className={cellTd}>{r.notAttempted} / {r.total}</td>
                          <td className="py-2 tabular-nums">{r.notVisited} / {r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {isSingle ? (
              <>
                {subjectRow && (
                  <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line text-center sm:grid-cols-4">
                    {[
                      [String(subjectRow.attempted), `attempted of ${subjectRow.total}`],
                      [String(subjectRow.correct), 'correct'],
                      [`${subjectRow.accuracy}%`, 'accuracy (of attempted)'],
                      [fmtClock(subjectRow.avgTimeSec), 'avg time / attempted Q'],
                    ].map(([big, small]) => (
                      <div key={small} className="bg-white px-3 py-3">
                        <p className="text-[22px] font-bold leading-tight tabular-nums text-ink">{big}</p>
                        <p className="text-[11px] font-medium text-inksoft">{small}</p>
                      </div>
                    ))}
                  </div>
                )}
                <h3 className="mt-5 text-[15px] font-bold text-ink">Accuracy by time taken</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[440px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-mist/50 text-xs uppercase tracking-wide text-inksoft">
                        <th className={cellTh}>Time per question</th>
                        <th className={cellTh}>Attempted</th>
                        <th className={cellTh}>Correct</th>
                        <th className={cellTh}>Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.buckets.map((b) => (
                        <tr key={b.key} className="border-b border-line/70">
                          <td className="py-2 pr-3 font-medium text-ink">{b.label}</td>
                          <td className={cellTd}>{b.count}</td>
                          <td className={cellTd}>{b.correct}</td>
                          <td className={cellTd}>
                            <span className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist">
                                <span className="block h-full bg-med" style={{ width: `${b.accuracy}%` }} />
                              </span>
                              <span className="font-semibold">{b.count ? `${b.accuracy}%` : '—'}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : desc.kind === 'qbank' ? (
              <>
                <p className="mt-1.5 text-sm text-inksoft">
                  Where your marks came from, subject by subject. Accuracy counts only the questions
                  you attempted. This set was drawn from the question bank, so there is no blueprint
                  comparison — just your numbers.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-mist/50 text-xs uppercase tracking-wide text-inksoft">
                        <th className={cellTh}>Subject</th>
                        <th className={cellTh}>Qs</th>
                        <th className={cellTh}>Attempted</th>
                        <th className={cellTh}>Correct</th>
                        <th className={cellTh}>Accuracy</th>
                        <th className="py-2 font-semibold">Avg time / Q</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.subjects.map((s) => (
                        <tr key={s.subject} className="border-b border-line/70 transition-colors hover:bg-paper">
                          <td className="py-2 pr-3 font-medium text-ink">{s.subject}</td>
                          <td className={cellTd}>{s.total}</td>
                          <td className={cellTd}>{s.attempted}</td>
                          <td className={cellTd}>{s.correct}</td>
                          <td className={cellTd}>
                            <span className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist">
                                <span className="block h-full bg-med" style={{ width: `${s.accuracy}%` }} />
                              </span>
                              <span className="font-semibold">{s.accuracy}%</span>
                            </span>
                          </td>
                          <td className="py-2 tabular-nums">{fmtClock(s.avgTimeSec)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-med-soft/60 px-4 py-4">
                    <p className="text-sm font-bold text-med-deep">Strongest (accuracy, 8+ attempted)</p>
                    <ul className="mt-1.5 space-y-1 text-sm tabular-nums text-ink">
                      {a.strongest.length ? a.strongest.map((s) => (
                        <li key={s.subject}>{s.subject} — {s.accuracy}% ({s.correct}/{s.attempted})</li>
                      )) : <li>No subject had 8+ attempts.</li>}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-bad/[0.06] px-4 py-4">
                    <p className="text-sm font-bold text-bad">Weakest (accuracy, 8+ attempted)</p>
                    <ul className="mt-1.5 space-y-1 text-sm tabular-nums text-ink">
                      {a.weakest.length ? a.weakest.map((s) => (
                        <li key={s.subject}>{s.subject} — {s.accuracy}% ({s.correct}/{s.attempted})</li>
                      )) : <li>No subject had 8+ attempts.</li>}
                    </ul>
                  </div>
                </div>
                {a.tooFew.length > 0 && (
                  <p className="mt-3 text-sm text-inksoft">
                    Too few questions to judge (fewer than 8 attempted):{' '}
                    {a.tooFew.map((s) => `${s.subject} (${s.attempted})`).join(' · ')}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-1.5 text-sm text-inksoft">
                  Where your marks came from, subject by subject. Accuracy counts only the questions
                  you attempted; the share bars compare this paper&apos;s subject mix with the official
                  NBEMS blueprint.
                </p>
                {a.hasSubjects && a.rollups ? (
                  <>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {([
                        ['Pre & Para-clinical subjects', a.rollups.prepara],
                        ['Clinical subjects', a.rollups.clinical],
                      ] as const).map(([label, r]) => {
                        const paperShare = Math.round((r.total / a.total) * 1000) / 10;
                        const blueprintShare = Math.round((r.blueprint / 300) * 1000) / 10;
                        return (
                          <div key={label} className="rounded-lg bg-paper px-4 py-4">
                            <p className="text-sm font-semibold text-ink">{label}</p>
                            <div className="mt-3">
                              <div className="flex justify-between text-[11px] font-medium text-inksoft">
                                <span>Accuracy — {r.correct} of {r.attempted} attempted</span>
                                <span>{r.accuracy}%</span>
                              </div>
                              <div className="mt-1 h-2 overflow-hidden rounded-full bg-mist">
                                <div className="h-full bg-med" style={{ width: `${r.accuracy}%` }} />
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex justify-between text-[11px] font-medium text-inksoft">
                                <span>Share of this paper — {r.total} questions</span>
                                <span>{paperShare}% · blueprint {blueprintShare}%</span>
                              </div>
                              <div className="relative mt-1 h-2 overflow-hidden rounded-full bg-mist">
                                <div className="h-full bg-med/50" style={{ width: `${paperShare}%` }} />
                                <span className="absolute inset-y-0 w-0.5 bg-ink" style={{ left: `${blueprintShare}%` }} aria-hidden />
                              </div>
                              <p className="mt-1 text-[11px] text-inksoft">Black tick = official blueprint share ({r.blueprint} of 300)</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 overflow-x-auto">
                      <table className="w-full min-w-[600px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-line bg-mist/50 text-xs uppercase tracking-wide text-inksoft">
                            <th className={cellTh}>Subject</th>
                            <th className={cellTh}>Qs</th>
                            <th className={cellTh}>Attempted</th>
                            <th className={cellTh}>Correct</th>
                            <th className={cellTh}>Accuracy</th>
                            <th className="py-2 font-semibold">Avg time / Q</th>
                          </tr>
                        </thead>
                        <tbody>
                          {a.subjects.map((s) => (
                            <tr key={s.subject} className="border-b border-line/70 transition-colors hover:bg-paper">
                              <td className="py-2 pr-3 font-medium text-ink">{s.subject}</td>
                              <td className={cellTd}>{s.total}</td>
                              <td className={cellTd}>{s.attempted}</td>
                              <td className={cellTd}>{s.correct}</td>
                              <td className={cellTd}>
                                <span className="inline-flex items-center gap-2">
                                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist">
                                    <span className="block h-full bg-med" style={{ width: `${s.accuracy}%` }} />
                                  </span>
                                  <span className="font-semibold">{s.accuracy}%</span>
                                </span>
                              </td>
                              <td className="py-2 tabular-nums">{fmtClock(s.avgTimeSec)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-3 text-xs italic leading-relaxed text-inksoft">{SUBJECT_FOOTNOTE}</p>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg bg-med-soft/60 px-4 py-4">
                        <p className="text-sm font-bold text-med-deep">Strongest (accuracy, 8+ attempted)</p>
                        <ul className="mt-1.5 space-y-1 text-sm tabular-nums text-ink">
                          {a.strongest.length ? a.strongest.map((s) => (
                            <li key={s.subject}>{s.subject} — {s.accuracy}% ({s.correct}/{s.attempted})</li>
                          )) : <li>No subject had 8+ attempts.</li>}
                        </ul>
                      </div>
                      <div className="rounded-lg bg-bad/[0.06] px-4 py-4">
                        <p className="text-sm font-bold text-bad">Weakest (accuracy, 8+ attempted)</p>
                        <ul className="mt-1.5 space-y-1 text-sm tabular-nums text-ink">
                          {a.weakest.length ? a.weakest.map((s) => (
                            <li key={s.subject}>{s.subject} — {s.accuracy}% ({s.correct}/{s.attempted})</li>
                          )) : <li>No subject had 8+ attempts.</li>}
                        </ul>
                      </div>
                    </div>
                    {a.tooFew.length > 0 && (
                      <p className="mt-3 text-sm text-inksoft">
                        Too few questions to judge (fewer than 8 attempted):{' '}
                        {a.tooFew.map((s) => `${s.subject} (${s.attempted})`).join(' · ')}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 leading-relaxed text-inksoft">
                    This 2026 recall source has no subject tags, so subject-wise analysis isn&apos;t
                    available for this paper. Your overall, pace, time and behaviour analysis is
                    complete.
                    {desc.addedCount > 0 && (
                      <>
                        {' '}
                        The {desc.addedCount} added completion questions are subject-tagged, but this
                        paper&apos;s own recall questions are not, so subject-wise analysis isn&apos;t
                        shown for this paper.
                      </>
                    )}
                  </p>
                )}
              </>
            )}
          </section>
          {/* 3 · Score Potential */}
          <section id="potential" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">Score Potential</h2>
            {isBenchmark ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[440px] text-left text-sm">
                  <tbody>
                    {[
                      ['Score', `${v.score} / ${v.total}`],
                      ['50% mark', `${benchMark} of ${v.total}`],
                      [benchPassed ? 'Cleared by' : 'More correct answers needed', benchPassed ? `${v.score - benchMark}` : `${benchGap}`],
                      ['Marks lost (wrong answers)', String(a.wrong)],
                      ['Unattempted', String(a.skipped)],
                      ['Skip dividend (skips × ¼)', `≈ ${a.skipDividend}`],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-line/70">
                        <td className="py-2 pr-3 font-medium text-ink">{label}</td>
                        <td className="py-2 text-right font-bold tabular-nums text-ink">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                <p className="mt-1.5 text-sm text-inksoft">
                  Pure arithmetic on this attempt — no predictions, just where your {a.wrong} lost marks sit.
                </p>
                {a.wrong === 0 ? (
                  <p className="mt-3 font-medium text-med-deep">No wrong answers — there is nothing to recover. A clean paper.</p>
                ) : (
                  <>
                    {v.full && !v.passed && (
                      <p className="mt-3 text-[15px] text-ink">
                        You need <strong>{v.gapToPass} more marks</strong> to reach 150.
                        {a.topPoolMarks >= v.gapToPass
                          ? ' Your biggest recovery pools below hold more than that on their own.'
                          : ''}
                      </p>
                    )}
                    {a.topPools.length > 0 ? (
                      <>
                        <ul className="mt-4 space-y-2">
                          {a.topPools.map((p) => (
                            <li key={p.subject} className="flex items-center gap-3">
                              <span className="w-44 shrink-0 truncate text-sm font-semibold text-ink sm:w-56">{p.subject}</span>
                              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist">
                                <span className="block h-full bg-bad" style={{ width: `${a.wrong ? (p.lostMarks / a.wrong) * 100 : 0}%` }} />
                              </span>
                              <span className="text-sm font-bold tabular-nums text-bad">{p.lostMarks} marks</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 text-sm leading-relaxed text-inksoft">
                          Your 3 biggest recovery pools — {a.topPools.map((p) => p.subject).join(', ')} — hold{' '}
                          <strong className="text-ink">{a.topPoolMarks} of your {a.wrong} lost marks</strong>.
                          Revise those first; they are the cheapest marks in your next attempt.
                        </p>
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-inksoft">
                        This paper&apos;s questions carry no subject tags, so lost marks can&apos;t be
                        grouped by subject — they are all in the solutions below.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
            {a.wrong > 0 && (
              <div className="mt-5 border-t border-line pt-4">
                <h3 className="text-[15px] font-bold text-ink">Improved score by error reduction</h3>
                <p className="mt-1 text-sm text-inksoft">
                  If you had fixed a share of your {a.wrong} wrong answers, this is where your score
                  would stand — the same arithmetic, applied to this attempt only:
                </p>
                <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line text-center sm:grid-cols-4">
                  {[
                    ['Fix ¼ of mistakes', v.score + Math.ceil(a.wrong / 4)],
                    ['Fix ½ of mistakes', v.score + Math.ceil(a.wrong / 2)],
                    ['Fix ¾ of mistakes', v.score + Math.ceil((a.wrong * 3) / 4)],
                    ['Fix every mistake', v.score + a.wrong],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-white px-3 py-3">
                      <p className="text-[22px] font-bold leading-tight tabular-nums text-med-deep">
                        {val} <span className="text-sm font-semibold text-inksoft">/ {v.total}</span>
                      </p>
                      <p className="text-[11px] font-medium text-inksoft">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          {/* Attempt Analysis — every attempt classified */}
          <section id="attempts" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">Attempt Analysis</h2>
            <p className="mt-1 text-sm leading-relaxed text-inksoft">
              Every question is classified by what you did with it — your time against the{' '}
              {fmtClock(a.timeDetail.availableSec / a.total)} allotted per question, your visits and
              your answer changes. Every label explains itself; click a question to open its
              solution.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {classGroups.map(({ cls, items }) => (
                <div key={cls} className="rounded-lg border border-line bg-paper px-4 py-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[15px] font-bold text-ink">{CLASS_META[cls].label}</p>
                    <p className="text-xl font-bold tabular-nums text-med-deep">{items.length}</p>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-inksoft">{CLASS_META[cls].blurb}</p>
                  {items.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {items.map(({ row }) => (
                        <button
                          key={row.idx}
                          type="button"
                          onClick={() => openSolution(row.idx, items.map((x) => x.row))}
                          className="rounded-md bg-white px-2 py-1 text-xs font-bold tabular-nums text-ink ring-1 ring-line transition hover:ring-med"
                          title={`Open Q${row.idx + 1}'s solution`}
                        >
                          Q{row.idx + 1}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[13px] text-inksoft">None in this attempt.</p>
                  )}
                </div>
              ))}
              <div className="rounded-lg border border-dashed border-line px-4 py-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[15px] font-bold text-ink">Everything else</p>
                  <p className="text-xl font-bold tabular-nums text-inksoft">{unclassified}</p>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-inksoft">
                  Questions that fall outside the five labels — answered at a normal pace without
                  drama, or skipped quickly. Not every question needs a story.
                </p>
              </div>
            </div>
            {classGroups.some(({ cls, items }) => cls !== 'perfect' && items.length > 0) && (
              <div className="mt-5">
                <h3 className="text-[15px] font-bold text-ink">Why each label was given</h3>
                <ul className="mt-2 space-y-1.5">
                  {classGroups
                    .filter(({ cls }) => cls !== 'perfect')
                    .flatMap(({ cls, items }) =>
                      items.map(({ row, reason }) => (
                        <li key={`${cls}-${row.idx}`} className="text-sm leading-relaxed text-inksoft">
                          <button
                            type="button"
                            onClick={() => openSolution(row.idx, items.map((x) => x.row))}
                            className="font-bold tabular-nums text-med hover:underline"
                          >
                            Q{row.idx + 1}
                          </button>{' '}
                          <span className="font-semibold text-ink">{CLASS_META[cls].label}.</span>{' '}
                          {reason}
                        </li>
                      ))
                    )}
                </ul>
              </div>
            )}
          </section>

          {/* 5 · Time Analysis */}
          <section id="time" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">Time Analysis</h2>
            <p className="mt-1 text-sm text-inksoft">This section shows where your minutes went — and what they bought you.</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <tbody>
                  {[
                    ['Total time available', fmtDuration(a.timeDetail.availableSec)],
                    ['Time used', `${fmtDuration(a.timeDetail.usedSec)} (${a.timeDetail.availableSec ? Math.round((a.timeDetail.usedSec / a.timeDetail.availableSec) * 1000) / 10 : 0}%)`],
                    ['Average per attempted question', fmtClock(a.timeDetail.avgPerAttempted)],
                    ['Average on correct answers', `${fmtClock(a.timeDetail.avgOnCorrect)} · ${a.correct} answers · ${fmtDuration(a.timeDetail.timeOnCorrect)} total`],
                    ['Average on wrong answers', `${fmtClock(a.timeDetail.avgOnWrong)} · ${a.wrong} answers · ${fmtDuration(a.timeDetail.timeOnWrong)} total`],
                    ['Rushed answers (under 10 s)', `${a.rushed.count} attempted · ${a.rushed.correct} correct (${a.rushed.count ? `${a.rushed.accuracy}%` : '—'})`],
                  ].map(([label, value]) => (
                    <tr key={label} className="border-b border-line/70">
                      <td className="py-2 pr-3 font-medium text-ink">{label}</td>
                      <td className="py-2 text-right font-semibold tabular-nums text-ink">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-paper px-4 py-4">
                <p className="text-[15px] font-bold text-ink">Fastest answers</p>
                {a.timeDetail.fastest.length ? (
                  <table className="mt-2 w-full text-sm tabular-nums">
                    <tbody>
                      {a.timeDetail.fastest.map((r) => (
                        <tr key={r.idx} className="border-b border-line/60 last:border-0">
                          <td className="py-1.5 pr-2 font-semibold text-ink">Q{r.n}</td>
                          <td className="py-1.5 pr-2">{fmtClock(r.timeSec)}</td>
                          <td className="py-1.5 text-right">{r.status === 'correct' ? <span className="font-semibold text-ok">✓ correct</span> : <span className="font-semibold text-bad">✗ wrong</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="mt-1 text-sm text-inksoft">No attempted questions.</p>}
              </div>
              <div className="rounded-lg bg-paper px-4 py-4">
                <p className="text-[15px] font-bold text-ink">Slowest answers</p>
                {a.timeDetail.slowest.length ? (
                  <table className="mt-2 w-full text-sm tabular-nums">
                    <tbody>
                      {a.timeDetail.slowest.map((r) => (
                        <tr key={r.idx} className="border-b border-line/60 last:border-0">
                          <td className="py-1.5 pr-2 font-semibold text-ink">Q{r.n}</td>
                          <td className="py-1.5 pr-2">{fmtClock(r.timeSec)}</td>
                          <td className="py-1.5 text-right">{r.status === 'correct' ? <span className="font-semibold text-ok">✓ correct</span> : <span className="font-semibold text-bad">✗ wrong</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="mt-1 text-sm text-inksoft">No attempted questions.</p>}
              </div>
            </div>

            <h3 className="mt-5 text-[15px] font-bold text-ink">Questions by time taken</h3>
            <div className="mt-3 space-y-2.5">
              {a.buckets.map((b) => (
                <div key={b.key} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm font-medium text-ink">{b.label}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist">
                    <span className="block h-full bg-med" style={{ width: `${a.attempted ? (b.count / a.attempted) * 100 : 0}%` }} />
                  </span>
                  <span className="w-40 shrink-0 text-right text-sm tabular-nums text-inksoft">
                    {b.count} attempted · <strong className="text-ink">{b.count ? `${b.accuracy}%` : '—'}</strong> accurate
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-paper px-4 py-4">
                <p className="text-[15px] font-bold text-ink">Answer changes</p>
                <table className="mt-2 w-full text-sm tabular-nums">
                  <tbody>
                    {[
                      ['Answers changed', String(a.changeReport.total)],
                      ['Wrong → correct', a.changeReport.gained > 0 ? `+${a.changeReport.gained}` : '0'],
                      ['Correct → wrong', a.changeReport.lost > 0 ? `−${a.changeReport.lost}` : '0'],
                      ['Wrong → wrong', String(a.changeReport.wrongToWrong)],
                      ['Net marks effect', a.changeReport.net > 0 ? `+${a.changeReport.net}` : a.changeReport.net < 0 ? `−${-a.changeReport.net}` : '0'],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-line/60 last:border-0">
                        <td className="py-1.5 pr-2 text-inksoft">{label}</td>
                        <td className="py-1.5 text-right font-bold text-ink">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg bg-paper px-4 py-4">
                <p className="text-[15px] font-bold text-ink">Confidence</p>
                <table className="mt-2 w-full text-sm tabular-nums">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-inksoft">
                      <th className="pb-1.5 pr-2 font-semibold">Tag</th>
                      <th className="pb-1.5 pr-2 font-semibold">Attempted</th>
                      <th className="pb-1.5 pr-2 font-semibold">Correct</th>
                      <th className="pb-1.5 font-semibold">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ['Sure', a.guessReport.sure],
                      ['Unsure', a.guessReport.unsure],
                      ['Guessed', a.guessReport.guessed],
                    ] as const).map(([label, g]) => (
                      <tr key={label} className="border-b border-line/60 last:border-0">
                        <td className="py-1.5 pr-2 font-medium text-ink">{label}</td>
                        <td className="py-1.5 pr-2">{g.count}</td>
                        <td className="py-1.5 pr-2">{g.correct}</td>
                        <td className="py-1.5 font-semibold">{g.count ? `${g.accuracy}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-sm tabular-nums text-inksoft">
                  Guessed {a.guessReport.guessed.count} · {a.guessReport.marksFromGuesses} correct
                  {a.guessReport.untagged > 0 && <> · {a.guessReport.untagged} attempted without a tag</>}
                </p>
              </div>
              <div className="rounded-lg bg-med-soft/50 px-4 py-4">
                <p className="text-[15px] font-bold text-med-deep">Skipped &amp; rushed</p>
                <table className="mt-2 w-full text-sm tabular-nums">
                  <tbody>
                    {[
                      ['Skipped', String(a.skipped)],
                      ['Rushed wrong (under 15 s)', String(a.recklessness.rushedWrong)],
                      ['Slow wrong (60 s +, knowledge gaps)', String(a.recklessness.gapWrong)],
                      ['Skip dividend (skips × ¼, no negative marking)', `≈ ${a.skipDividend} marks`],
                    ].map(([label, value]) => (
                      <tr key={label} className="border-b border-line/60 last:border-0">
                        <td className="py-1.5 pr-2 text-inksoft">{label}</td>
                        <td className="py-1.5 text-right font-bold text-ink">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          {/* 5b · Pace */}
          <section id="pace" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">{isBenchmark ? 'Halves & pace' : 'Parts & pace'}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-mist/50 text-xs uppercase tracking-wide text-inksoft">
                    <th className={cellTh}>{isBenchmark ? 'Half' : 'Part'}</th>
                    <th className={cellTh}>Attempted</th>
                    <th className={cellTh}>Correct</th>
                    <th className={cellTh}>Wrong</th>
                    <th className={cellTh}>Skipped</th>
                    <th className={cellTh}>Accuracy</th>
                    <th className={cellTh}>Time</th>
                    <th className="py-2 font-semibold">Avg / Q</th>
                  </tr>
                </thead>
                <tbody>
                  {a.segments.map((s, i) => (
                    <tr key={s.key} className="border-b border-line/70">
                      <td className="py-2 pr-3 font-medium text-ink">{segLabel(i, s.from, s.to)}</td>
                      <td className={cellTd}>{s.attempted}</td>
                      <td className={cellTd}>{s.correct}</td>
                      <td className={cellTd}>{s.wrong}</td>
                      <td className={cellTd}>{s.skipped}</td>
                      <td className={cellTd}>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist">
                            <span className="block h-full bg-med" style={{ width: `${s.accuracy}%` }} />
                          </span>
                          <span className="font-semibold">{s.attempted ? `${s.accuracy}%` : '—'}</span>
                        </span>
                      </td>
                      <td className={cellTd}>{fmtDuration(s.timeSec)}</td>
                      <td className="py-2 tabular-nums">{fmtClock(s.avgTimeSec)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-5 text-[15px] font-bold text-ink">
              Accuracy per block of {a.paceBlocks[0] ? a.paceBlocks[0].to - a.paceBlocks[0].from : 0} questions
            </h3>
            <div className="mt-3 space-y-2">
              {a.paceBlocks.map((b) => (
                <div key={b.from} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm font-medium tabular-nums text-ink">{b.label}</span>
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-mist">
                    <span className="block h-full bg-med" style={{ width: `${b.accuracy}%` }} />
                  </span>
                  <span className="w-60 shrink-0 text-right text-sm tabular-nums text-inksoft">
                    {b.correct}/{b.attempted} correct · <strong className="text-ink">{b.attempted ? `${b.accuracy}%` : '—'}</strong> · avg {fmtClock(b.avgTimeSec)}
                  </span>
                </div>
              ))}
            </div>
          </section>
          {/* Topic Analysis — where the syllabus stands, topic by topic */}
          {topics.length > 0 && (
            <section id="topics" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
              <h2 className="text-xl font-bold text-ink">Topic Analysis</h2>
              <p className="mt-1 text-sm leading-relaxed text-inksoft">
                Your questions grouped by the topic they test, weakest first. This is the most
                direct revision list this analysis can give you: a topic with wrong answers is a
                topic to re-read before your next test.
              </p>
              {topics.filter((t) => t.wrong >= 2).length > 0 && (
                <p className="mt-3 rounded-lg bg-bad/[0.06] px-4 py-3 text-sm leading-relaxed text-ink">
                  <strong className="text-bad">Revise first:</strong>{' '}
                  {topics
                    .filter((t) => t.wrong >= 2)
                    .slice(0, 5)
                    .map((t) => `${t.topic} (${t.wrong} wrong)`)
                    .join(' · ')}
                </p>
              )}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line bg-mist/50 text-xs uppercase tracking-wide text-inksoft">
                      <th className={cellTh}>Topic</th>
                      <th className={cellTh}>Subject</th>
                      <th className={cellTh}>Qs</th>
                      <th className={cellTh}>Correct</th>
                      <th className={cellTh}>Wrong</th>
                      <th className={cellTh}>Skipped</th>
                      <th className="py-2 font-semibold">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics
                      .filter((t) => t.total >= 2)
                      .slice(0, 40)
                      .map((t) => (
                        <tr key={`${t.subject}-${t.topic}`} className="border-b border-line/70 transition-colors hover:bg-paper">
                          <td className="py-2 pr-3 font-medium text-ink">{t.topic}</td>
                          <td className="py-2 pr-3 text-inksoft">{t.subject}</td>
                          <td className={cellTd}>{t.total}</td>
                          <td className={cellTd}>{t.correct}</td>
                          <td className={cellTd}>{t.wrong}</td>
                          <td className={cellTd}>{t.skipped}</td>
                          <td className="py-2 tabular-nums">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist">
                                <span className="block h-full bg-med" style={{ width: `${t.accuracy}%` }} />
                              </span>
                              <span className="font-semibold">{t.correct + t.wrong ? `${t.accuracy}%` : '—'}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-inksoft">
                Topics with a single question in this test are counted in your subject analysis
                above; this table lists topics with 2 or more.
              </p>
            </section>
          )}

          {/* Question Journey — how you travelled through the test */}
          <section id="journey" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">Question Journey</h2>
            <p className="mt-1 text-sm leading-relaxed text-inksoft">
              How you moved through the test: every question coloured by its result, the visits you
              paid it, the answers you changed along the way, and what those changes cost or earned.
              Click any question to open its solution.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {a.perQ.map((r) => (
                <button
                  key={r.idx}
                  type="button"
                  onClick={() => openSolution(r.idx, a.perQ)}
                  className={`rounded-md px-1.5 py-1.5 text-center text-[11px] font-medium leading-tight tabular-nums transition hover:ring-2 hover:ring-med/50 ${
                    r.status === 'correct'
                      ? 'bg-ok/10 text-ink'
                      : r.status === 'wrong'
                        ? 'bg-bad/[0.08] text-ink'
                        : 'bg-mist text-inksoft'
                  }`}
                  title={`Q${r.idx + 1}: ${r.status} · ${r.visits} visit${r.visits === 1 ? '' : 's'} · ${fmtClock(r.timeSec)}`}
                >
                  <span className="block font-bold">Q{r.idx + 1}</span>
                  <span>
                    {r.visits === 0 ? 'not visited' : r.visits === 1 ? fmtClock(r.timeSec) : `${r.visits} visits`}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-paper px-4 py-4">
                <p className="text-[15px] font-bold text-ink">
                  Answer changes ({journey.length})
                </p>
                {journey.length ? (
                  <ul className="mt-2 space-y-1.5 text-sm tabular-nums text-inksoft">
                    {journey.slice(0, 40).map((c, i) => (
                      <li key={i} className="flex items-baseline justify-between gap-2">
                        <span>
                          <strong className="text-ink">Q{c.q}</strong> · {c.from} → {c.to}
                        </span>
                        {c.effect === 'gained' ? (
                          <span className="font-semibold text-ok">+1 gained</span>
                        ) : c.effect === 'lost' ? (
                          <span className="font-semibold text-bad">−1 lost</span>
                        ) : (
                          <span>no effect</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-inksoft">You never changed an answer in this attempt.</p>
                )}
                {journey.length > 40 && (
                  <p className="mt-2 text-xs text-inksoft">…and {journey.length - 40} more changes.</p>
                )}
                <p className="mt-2 text-sm tabular-nums text-inksoft">
                  Net effect of all changes:{' '}
                  <strong className="text-ink">
                    {a.changeReport.net > 0 ? `+${a.changeReport.net}` : a.changeReport.net} marks
                  </strong>
                </p>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-paper px-4 py-4">
                  <p className="text-[15px] font-bold text-ink">Marked for review</p>
                  {a.perQ.filter((r) => r.marked).length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.perQ
                        .filter((r) => r.marked)
                        .map((r) => (
                          <button
                            key={r.idx}
                            type="button"
                            onClick={() => openSolution(r.idx, a.perQ.filter((x) => x.marked))}
                            className="rounded-md bg-white px-2 py-1 text-xs font-bold tabular-nums text-ink ring-1 ring-line transition hover:ring-med"
                          >
                            Q{r.idx + 1}
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-inksoft">Nothing was marked for review.</p>
                  )}
                </div>
                <div className="rounded-lg bg-paper px-4 py-4">
                  <p className="text-[15px] font-bold text-ink">Visited 3+ times</p>
                  {a.perQ.filter((r) => r.visits >= 3).length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {a.perQ
                        .filter((r) => r.visits >= 3)
                        .map((r) => (
                          <button
                            key={r.idx}
                            type="button"
                            onClick={() => openSolution(r.idx, a.perQ.filter((x) => x.visits >= 3))}
                            className="rounded-md bg-white px-2 py-1 text-xs font-bold tabular-nums text-ink ring-1 ring-line transition hover:ring-med"
                          >
                            Q{r.idx + 1} · {r.visits}×
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-inksoft">No question needed three visits.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 8 · Qs by Qs Analysis */}
          <section id="solutions" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-ink">Qs by Qs Analysis</h2>
                <p className="mt-0.5 text-sm text-inksoft">
                  Click any question to open its full solution.
                  {filter === 'wrong' && ' Wrong answers are listed slowest-first — knowledge gaps before rushed slips.'}
                </p>
              </div>
              <form
                className="ml-auto flex items-center gap-2"
                onSubmit={(e) => { e.preventDefault(); doJump(); }}
              >
                <label htmlFor="jump-q" className="text-sm font-medium text-inksoft">Go to Q</label>
                <input
                  id="jump-q"
                  type="number"
                  min={1}
                  max={a.total}
                  value={jump}
                  onChange={(e) => setJump(e.target.value)}
                  className="w-20 rounded-md border border-line px-2.5 py-1.5 text-sm outline-none focus:border-med focus:ring-2 focus:ring-med/20"
                  placeholder={`1–${a.total}`}
                />
                <button type="submit" className="rounded-md bg-med px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-med-deep">
                  Open
                </button>
              </form>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Solution filters">
              {([
                ['wrong', 'Wrong'],
                ['all', 'All'],
                ['correct', 'Correct'],
                ['skipped', 'Skipped'],
                ['marked', 'Marked'],
                ['guessed', 'Guessed'],
                ...(desc.kind === 'paper' ? [['added', 'Added'] as [Filter, string]] : []),
                ['image', 'With image'],
              ] as [Filter, string][]).map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold tabular-nums transition ${
                    filter === f
                      ? 'bg-med text-white'
                      : 'border border-line bg-white text-inksoft hover:border-med hover:text-med'
                  }`}
                >
                  {label} ({filterCounts[f]})
                </button>
              ))}
            </div>

            <div className="mt-4 divide-y divide-line/80 border-y border-line">
              {displayRows.length === 0 && (
                <p className="py-6 text-center text-inksoft">Nothing in this filter — nicely done.</p>
              )}
              {displayRows.map((r) => {
                const q = paper.questions[r.idx];
                return (
                  <button
                    key={r.idx}
                    type="button"
                    onClick={() => openSolution(r.idx, displayRows)}
                    className="group flex w-full items-center gap-3 px-2 py-3 text-left transition hover:bg-paper focus:bg-paper focus:outline-none"
                    aria-label={`Open solution for question ${r.idx + 1}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[13px] font-bold tabular-nums text-white ${
                        r.status === 'correct' ? 'bg-ok' : r.status === 'wrong' ? 'bg-bad' : 'bg-cbt-grey'
                      }`}
                    >
                      {r.idx + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{q.text}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-inksoft">
                        {r.subject && <span className="font-medium">{r.subject}</span>}
                        <span>{fmtClock(r.timeSec)}</span>
                        {r.confidence && <span className="capitalize">· {r.confidence}</span>}
                        {r.marked && <span className="font-semibold text-cbt-purple">· marked</span>}
                        {r.added && <span className="font-semibold text-accent-deep">· added from {r.fromLabel}</span>}
                        {(r.hasImages || r.img) && <span>· figure</span>}
                      </span>
                    </span>
                    <span className="hidden shrink-0 sm:inline">{statusChip(r.status)}</span>
                    <span aria-hidden className="shrink-0 text-inksoft transition-transform group-hover:translate-x-0.5">→</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-inksoft">
              {displayRows.length} of {a.total} questions shown. The downloadable answer key &amp;
              solutions PDF below contains every question with its detailed explanation.
            </p>
          </section>
          {/* 8b · Answer key */}
          <section id="key" className="mt-6 scroll-mt-16 rounded-xl border border-line bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-xl font-bold text-ink">Answer key</h2>
            <p className="mt-1 text-sm text-inksoft">
              Every question and its correct option — green you had it, red you missed it, grey you
              skipped it. Click a cell to open that question&apos;s full solution.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              {a.answerKey.map((k, ki) => (
                <button
                  key={ki}
                  type="button"
                  onClick={() => openSolution(ki, a.perQ)}
                  className={`rounded-md px-1.5 py-1.5 text-center text-[11px] font-medium leading-tight tabular-nums transition hover:ring-2 hover:ring-med/50 ${
                    k.status === 'correct'
                      ? 'bg-ok/10 text-ink'
                      : k.status === 'wrong'
                        ? 'bg-bad/[0.08] text-ink'
                        : 'bg-mist text-inksoft'
                  }`}
                  title={`Q${ki + 1}: correct ${k.correctLetter}${k.status === 'wrong' ? `, you answered ${k.yourLetter}` : k.status === 'skipped' ? ', skipped' : ''} — open solution`}
                >
                  <span className="block font-bold">Q{ki + 1}</span>
                  <span>{k.correctLetter}{k.status === 'wrong' ? ` · you ${k.yourLetter}` : ''}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {downloadButtons}
              {isSubject ? (
                <Link href={desc.backHref} className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist">
                  Attempt another subject test
                </Link>
              ) : desc.kind === 'qbank' ? (
                <Link href={desc.backHref} className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist">
                  Practise more questions
                </Link>
              ) : (
                <Link href="/" className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-mist">
                  Attempt another paper
                </Link>
              )}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-inksoft">
              This analysis lives only in this browser tab. Closing the tab erases the attempt —
              download your report first if you want to keep it.
            </p>
          </section>
        </main>
        <SiteFooter />
      </div>

      {openRow && (
        <SolutionSheet
          paper={paper}
          row={openRow}
          isSubject={isSubject}
          imgNote={desc.kind === 'qbank' ? 'This question refers to an image in the source material. The image is not included in this edition.' : undefined}
          noExplNote={desc.kind === 'qbank' ? 'A detailed explanation is not available in the source for this question. The correct answer above is as given in the source compilation — MedSetu does not invent explanations.' : undefined}
          onClose={() => setOpenIdx(null)}
          onPrev={() => { if (navPos > 0) setOpenIdx(navList[navPos - 1].idx); }}
          onNext={() => { if (navPos >= 0 && navPos < navList.length - 1) setOpenIdx(navList[navPos + 1].idx); }}
          hasPrev={navPos > 0}
          hasNext={navPos >= 0 && navPos < navList.length - 1}
        />
      )}

      {printTarget === 'report' && <PrintReport desc={desc} paper={paper} attempt={attempt} a={a} />}
      {printTarget === 'key' && <PrintKey desc={desc} paper={paper} attempt={attempt} a={a} />}
    </div>
  );
}
