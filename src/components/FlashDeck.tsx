'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FlashCard } from '../lib/notes';

/**
 * A flashcard deck that lives entirely in this tab: flip, sort into
 * "Got it" / "Still learning", shuffle, and finish with a round of only
 * the cards still being learned. Nothing is stored anywhere.
 */
export function FlashDeck({ cards, subject }: { cards: FlashCard[]; subject: string }) {
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [learning, setLearning] = useState<Set<number>>(new Set());
  const [round, setRound] = useState(1);

  const current = order[pos];
  const card = cards[current];
  const marked = known.size + learning.size;
  const finished = order.length > 0 && pos >= order.length;

  const go = useCallback(
    (next: number) => {
      setFlipped(false);
      // brief pause so the flip resets before the card changes
      setTimeout(() => setPos(next), 60);
    },
    []
  );

  const mark = (gotIt: boolean) => {
    if (current === undefined) return;
    if (gotIt) {
      setKnown((s) => new Set(s).add(current));
      setLearning((s) => {
        const n = new Set(s);
        n.delete(current);
        return n;
      });
    } else {
      setLearning((s) => new Set(s).add(current));
      setKnown((s) => {
        const n = new Set(s);
        n.delete(current);
        return n;
      });
    }
    go(pos + 1);
  };

  const shuffle = () => {
    const arr = cards.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setOrder(arr);
    setPos(0);
    setFlipped(false);
    setKnown(new Set());
    setLearning(new Set());
    setRound(1);
  };

  const reviewLearning = () => {
    const arr = [...learning];
    if (!arr.length) return;
    setOrder(arr);
    setPos(0);
    setFlipped(false);
    setKnown(new Set());
    setLearning(new Set());
    setRound((r) => r + 1);
  };

  const restart = () => {
    setOrder(cards.map((_, i) => i));
    setPos(0);
    setFlipped(false);
    setKnown(new Set());
    setLearning(new Set());
    setRound(1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === 'ArrowRight') go(Math.min(pos + 1, order.length));
      else if (e.key === 'ArrowLeft') go(Math.max(pos - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pos, order.length, finished, go]);

  const topics = useMemo(() => [...new Set(cards.map((c) => c.topic))], [cards]);

  if (finished) {
    return (
      <div className="rise-in rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-med-deep">
          Round {round} complete
        </p>
        <h2 className="mt-2 text-2xl font-bold text-ink">
          {subject}: {known.size} of {order.length} cards known
        </h2>
        <p className="mx-auto mt-2 max-w-md text-body2 leading-relaxed text-inksoft">
          {learning.size === 0
            ? 'Every card in this round is in the "got it" pile. A short re-run tomorrow is what moves them into long-term memory.'
            : `${learning.size} card${learning.size === 1 ? ' is' : 's are'} still being learned — run one more round with only those, and the pile shrinks fast.`}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {learning.size > 0 && (
            <button
              onClick={reviewLearning}
              className="btn-primary rounded-full px-6 py-3 text-sm font-bold text-white"
            >
              Review the {learning.size} still-learning cards →
            </button>
          )}
          <button
            onClick={restart}
            className="rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-med-deep shadow-card transition hover:bg-mist"
          >
            Restart the full deck
          </button>
          <button
            onClick={shuffle}
            className="rounded-full border border-line bg-white px-6 py-3 text-sm font-bold text-med-deep shadow-card transition hover:bg-mist"
          >
            Shuffle &amp; restart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* progress */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <p className="font-semibold tabular-nums text-ink">
          Card {Math.min(pos + 1, order.length)} of {order.length}
          {round > 1 && <span className="text-inksoft"> · round {round}</span>}
        </p>
        <p className="tabular-nums text-inksoft">
          <span className="font-semibold text-ok">Got it: {known.size}</span>
          {'  ·  '}
          <span className="font-semibold text-accent-deep">Still learning: {learning.size}</span>
        </p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded bg-med-soft" role="progressbar" aria-valuenow={marked} aria-valuemax={order.length}>
        <div className="h-full rounded bg-gradient-to-r from-med-bright to-med-deep transition-all" style={{ width: `${(marked / order.length) * 100}%` }} />
      </div>

      {/* the card */}
      <div className="fc-scene mt-6 select-none">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Show the question' : 'Show the answer'}
          className="block w-full text-left"
        >
          <div className={`fc-card relative h-[320px] sm:h-[300px] ${flipped ? 'flipped' : ''}`}>
            <div className="fc-face absolute inset-0 flex flex-col rounded-2xl border border-med/25 bg-white p-7 shadow-lift ring-1 ring-med-line/40 sm:p-9">
              <span className="self-start rounded bg-med-soft px-2.5 py-1 text-micro font-bold uppercase tracking-[0.1em] text-med-deep">
                {card.topic}
              </span>
              <span className="flex flex-1 items-center">
                <span className="text-h3 font-semibold leading-snug text-ink sm:text-title">{card.front}</span>
              </span>
              <span className="text-sm font-semibold text-med">Tap to reveal the answer →</span>
            </div>
            <div className="fc-face fc-back absolute inset-0 flex flex-col rounded-2xl bg-gradient-to-br from-med to-med-abyss p-7 text-white shadow-lift sm:p-9">
              <span className="self-start rounded bg-white/15 px-2.5 py-1 text-micro font-bold uppercase tracking-[0.1em] text-white/90">
                {card.topic}
              </span>
              <span className="flex flex-1 items-center">
                <span className="text-xl font-semibold leading-snug sm:text-2xl">{card.back}</span>
              </span>
              <span className="text-sm font-semibold text-white/75">Tap to see the question again</span>
            </div>
          </div>
        </button>
      </div>

      {/* controls */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => mark(false)}
          className="rounded-lg border border-accent/50 bg-accent-soft px-4 py-3.5 text-body2 font-bold text-accent-deep transition-colors hover:bg-accent hover:text-white"
        >
          Still learning
        </button>
        <button
          onClick={() => mark(true)}
          className="btn-primary rounded-full px-6 py-3.5 text-body2 font-bold text-white"
        >
          Got it ✓
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          onClick={() => go(Math.max(pos - 1, 0))}
          disabled={pos === 0}
          className="rounded-md px-3 py-2 font-semibold text-med-deep transition-colors hover:bg-mist disabled:opacity-40"
        >
          ← Previous
        </button>
        <p className="hidden text-caption text-inksoft sm:block">Space to flip · arrow keys to move</p>
        <div className="flex gap-1">
          <button onClick={shuffle} className="rounded-md px-3 py-2 font-semibold text-med-deep transition-colors hover:bg-mist">
            Shuffle
          </button>
          <button onClick={restart} className="rounded-md px-3 py-2 font-semibold text-med-deep transition-colors hover:bg-mist">
            Restart
          </button>
        </div>
      </div>

      <p className="mt-6 text-caption leading-relaxed text-inksoft">
        This deck covers {topics.length} high-yield topics in {subject}. Your sorting lives only in
        this tab — close it and the deck starts fresh.
      </p>
    </div>
  );
}
