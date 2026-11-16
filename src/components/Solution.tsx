'use client';
import { useEffect, useRef } from 'react';
import { LETTERS } from '../lib/analysis';
import type { PerQ } from '../lib/analysis';
import type { TestData } from '../lib/types';
import { fmtClock } from '../lib/store';
import ExplanationText, { ExplanationBlocks } from './Explanation';

// The full solution for one question: stem + figures, every option with its
// correct/your-answer state, the attempt facts (time, confidence, changes),
// provenance for completion questions, and the detailed book explanation.
// Used inside the slide-over sheet on the analysis page.

export function statusChip(status: PerQ['status']) {
  if (status === 'correct')
    return <span className="rounded bg-ok/10 px-2 py-0.5 text-xs font-bold text-ok">✓ Correct</span>;
  if (status === 'wrong')
    return <span className="rounded bg-bad/10 px-2 py-0.5 text-xs font-bold text-bad">✗ Wrong</span>;
  return <span className="rounded bg-mist px-2 py-0.5 text-xs font-bold text-inksoft">Skipped</span>;
}

export function SolutionBody({ paper, row, isSubject = false, imgNote, noExplNote }: { paper: TestData; row: PerQ; isSubject?: boolean; imgNote?: string; noExplNote?: string }) {
  const q = paper.questions[row.idx];
  const hasExplanation = !!(q.explanation && q.explanation.trim());
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {statusChip(row.status)}
        {row.subject && (
          <span className="rounded bg-med-soft px-2 py-0.5 text-xs font-semibold text-med-deep">{row.subject}</span>
        )}
        {row.added && (
          <span className="rounded bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-deep">
            Added · from {row.fromLabel}
          </span>
        )}
        {row.marked && (
          <span className="rounded bg-cbt-purple/10 px-2 py-0.5 text-xs font-semibold text-cbt-purple">
            Marked for review
          </span>
        )}
        {row.hasImages && (
          <span className="rounded bg-mist px-2 py-0.5 text-xs font-semibold text-inksoft">With figure</span>
        )}
      </div>

      {q.img && (
        <p className="mt-3 rounded-md bg-accent-soft px-3 py-2 text-[13px] font-medium text-accent-deep">
          {imgNote ??
            (isSubject
              ? 'This question refers to an image from the source test. The image could not be recovered for this edition.'
              : 'This question refers to an image from the original paper. The image is not available in this recall edition.')}
        </p>
      )}

      <p className="mt-3 whitespace-pre-wrap text-[15.5px] leading-relaxed text-ink">{q.text}</p>

      {q.images && q.images.length > 0 && (
        <div className="mt-3 space-y-3">
          {q.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Figure for question ${row.idx + 1}`}
              loading="lazy"
              className="max-h-[440px] w-auto max-w-full rounded-md border border-line bg-white object-contain"
            />
          ))}
        </div>
      )}

      <ul className="mt-4 space-y-1.5">
        {(q.options.length ? q.options : q.optionImages ?? []).map((opt, oi) => {
          const isCorrect = oi === q.correct;
          const isYours = row.yours === oi;
          return (
            <li
              key={oi}
              className={`flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm leading-relaxed ${
                isCorrect
                  ? 'border-ok/50 bg-ok/[0.07]'
                  : isYours
                    ? 'border-bad/50 bg-bad/[0.06]'
                    : 'border-line bg-white'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                  isCorrect
                    ? 'border-ok bg-ok text-white'
                    : isYours
                      ? 'border-bad bg-bad text-white'
                      : 'border-inksoft/50 text-inksoft'
                }`}
              >
                {LETTERS[oi]}
              </span>
              {q.optionImages ? (
                <img
                  src={q.optionImages[oi]}
                  alt={`Option ${LETTERS[oi]}`}
                  loading="lazy"
                  className="max-h-36 w-auto max-w-full flex-1 rounded-sm border border-line bg-white object-contain"
                />
              ) : (
                <span className="flex-1">{opt}</span>
              )}
              {isCorrect && <span className="shrink-0 font-bold text-ok">✓ correct answer</span>}
              {isYours && !isCorrect && <span className="shrink-0 font-bold text-bad">✗ your answer</span>}
              {isYours && isCorrect && <span className="shrink-0 font-semibold text-ok">your answer</span>}
            </li>
          );
        })}
      </ul>

      {row.yours === null && (
        <p className="mt-3 text-sm font-medium text-inksoft">
          You skipped this question. The correct answer is {LETTERS[q.correct]} — and with no
          negative marking in FMGE, a guess would have cost nothing.
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-paper px-3.5 py-3 text-[13px] tabular-nums sm:grid-cols-4">
        <div>
          <dt className="font-semibold text-inksoft">Time spent</dt>
          <dd className="mt-0.5 font-semibold text-ink">{fmtClock(row.timeSec)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-inksoft">Visits</dt>
          <dd className="mt-0.5 font-semibold text-ink">{row.visits}</dd>
        </div>
        <div>
          <dt className="font-semibold text-inksoft">Your confidence</dt>
          <dd className="mt-0.5 font-semibold capitalize text-ink">{row.confidence || 'Not marked'}</dd>
        </div>
        <div>
          <dt className="font-semibold text-inksoft">Answer changes</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            {!row.change
              ? 'None'
              : row.change.effect === 'gained'
                ? `Changed — gained a mark`
                : row.change.effect === 'lost'
                  ? `Changed — lost a mark`
                  : `Changed ${row.change.count}× — no mark effect`}
          </dd>
        </div>
      </dl>
      {row.change && (
        <p className="mt-2 text-[13px] text-inksoft">
          You first answered {LETTERS[row.change.firstFrom]} and finally saved{' '}
          {row.yours !== null ? LETTERS[row.yours] : '—'}.
        </p>
      )}

      {q.learning && (
        <div className="mt-4 rounded-lg border border-med-line bg-med-soft/60 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-med-deep">
            Learning from this question
          </p>
          <p className="mt-1 text-[14.5px] font-medium leading-relaxed text-ink">{q.learning}</p>
        </div>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-med-deep">Detailed solution</h3>
        {hasExplanation ? (
          q.explBlocks ? (
            <ExplanationBlocks
              text={q.explanation}
              blocks={q.explBlocks}
              className="mt-2 text-[14.5px] leading-relaxed text-ink"
            />
          ) : (
            <ExplanationText
              text={q.explanation}
              className="mt-2 text-[14.5px] leading-relaxed text-ink"
            />
          )
        ) : (
          <p className="mt-2 rounded-md bg-paper px-3.5 py-3 text-sm leading-relaxed text-inksoft">
            {noExplNote ??
              'A detailed explanation is not available in the 2026 recall source for this question. The correct answer above is verified from the recall compilation — MedSetu does not invent explanations.'}
          </p>
        )}
        {row.added && (
          <p className="mt-3 text-[13px] leading-relaxed text-inksoft">
            This is a completion question, added from FMGE {row.fromLabel} to bring this paper to a
            full 300. Its explanation is the book explanation from that paper.
          </p>
        )}
        {q.explImg && !q.explBlocks && (
          <p className="mt-3 rounded-md bg-paper px-3.5 py-3 text-sm leading-relaxed text-inksoft">
            The source explanation for this question also includes image(s) that are not included
            in this edition.
          </p>
        )}
      </div>
    </div>
  );
}

export function SolutionSheet({
  paper,
  row,
  isSubject = false,
  imgNote,
  noExplNote,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  paper: TestData;
  row: PerQ;
  isSubject?: boolean;
  imgNote?: string;
  noExplNote?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Solution for question ${row.idx + 1}`}>
      <div className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className="sheet-in-up absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-xl bg-white shadow-lift sm:sheet-in sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-none sm:w-[min(620px,100vw)] sm:rounded-none">
        <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
          <h2 className="text-lg font-bold text-ink">Question {row.idx + 1}</h2>
          {statusChip(row.status)}
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close solution"
            className="ml-auto rounded-md border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-mist focus:outline-none focus:ring-2 focus:ring-med/40"
          >
            ✕ Close
          </button>
        </div>
        <div key={row.idx} className="flex-1 overflow-y-auto px-5 py-4">
          <SolutionBody paper={paper} row={row} isSubject={isSubject} imgNote={imgNote} noExplNote={noExplNote} />
        </div>
        <div className="flex items-center gap-3 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-mist disabled:opacity-40"
          >
            ← Previous
          </button>
          <span className="flex-1 text-center text-xs text-inksoft">← → arrow keys work too</span>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-mist disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
