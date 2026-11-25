// Shared TCS-iON-style palette visuals: the five question states with the
// real TCS shapes — square (not visited), pentagon-up (not answered),
// pentagon-down (answered), circle (marked), circle + green dot (answered
// & marked). Used by the runner palette, the instructions screen and the
// paper-page legend so all three always agree.

export type QState = 'notVisited' | 'notAnswered' | 'answered' | 'marked' | 'answeredMarked';

export const LEGEND_ITEMS: { state: QState; label: string; desc: string }[] = [
  { state: 'notVisited', label: 'Not Visited', desc: 'You have not visited the question yet.' },
  { state: 'notAnswered', label: 'Not Answered', desc: 'You have not answered the question.' },
  { state: 'answered', label: 'Answered', desc: 'You have answered the question.' },
  {
    state: 'marked',
    label: 'Marked for Review',
    desc: 'You have not answered the question, but have marked the question for review.',
  },
  {
    state: 'answeredMarked',
    label: 'Answered & Marked for Review',
    desc: 'You have answered the question and also marked it for review. It will be considered for evaluation.',
  },
];

const STATE_BG: Record<QState, string> = {
  notVisited: 'bg-white text-ink border border-cbt-grey/70',
  notAnswered: 'bg-cbt-red text-white',
  answered: 'bg-cbt-green text-white',
  marked: 'bg-cbt-purple text-white',
  answeredMarked: 'bg-cbt-purple text-white',
};

const STATE_SHAPE: Record<QState, string> = {
  notVisited: '',
  notAnswered: 'tile-up',
  answered: 'tile-down',
  marked: 'rounded-full',
  answeredMarked: 'rounded-full',
};

/** A palette tile. `label` is the question number (or a legend swatch when empty). */
export function PaletteTile({
  state,
  label,
  current = false,
  size = 'md',
  onClick,
}: {
  state: QState;
  label?: string;
  current?: boolean;
  size?: 'sm' | 'md';
  onClick?: () => void;
}) {
  const dims = size === 'sm' ? 'h-6 w-6 text-tiny' : 'h-9 w-9 text-caption';
  const inner = (
    <span
      className={`relative flex ${dims} items-center justify-center font-semibold transition hover:brightness-110 ${STATE_BG[state]} ${STATE_SHAPE[state]}`}
    >
      {label}
      {state === 'answeredMarked' && (
        <span className="absolute bottom-[3px] right-[3px] h-2 w-2 rounded-full bg-cbt-green ring-1 ring-white" aria-hidden />
      )}
    </span>
  );
  const wrapped = current ? (
    <span className="inline-block rounded-full outline outline-2 outline-offset-1 outline-cbt-head">{inner}</span>
  ) : (
    inner
  );
  if (!onClick) return wrapped;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ? `Go to question ${label}` : undefined}
      aria-current={current || undefined}
      className="inline-flex"
    >
      {wrapped}
    </button>
  );
}

/** Legend swatch (no number) for instruction screens. */
export function LegendSwatch({ state }: { state: QState }) {
  return <PaletteTile state={state} size="sm" />;
}
