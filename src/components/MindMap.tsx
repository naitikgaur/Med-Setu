import type { SubjectNotes } from '../lib/notes';

/**
 * A subject on one screen: the centre node and its branches, rendered as a
 * clean map of cards. Leaves are the facts each branch must trigger in the
 * student's head — read it top to bottom the night before the exam.
 */
export function MindMap({ notes }: { notes: SubjectNotes }) {
  const { mindmap } = notes;
  return (
    <div>
      <div className="flex justify-center">
        <div className="rounded-2xl bg-med-deep px-8 py-4 text-center text-white shadow-lift">
          <p className="mt-0.5 text-xl font-bold">{mindmap.center}</p>
        </div>
      </div>
      <div aria-hidden className="mx-auto h-6 w-px bg-med/50" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mindmap.branches.map((b) => (
          <div key={b.label} className="rounded-xl border border-med/25 bg-white p-5 shadow-card">
            <h3 className="flex items-center gap-2 text-body2 font-bold text-med-deep">
              <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-med" />
              {b.label}
            </h3>
            <ul className="mt-3 space-y-1.5">
              {b.leaves.map((leaf) => (
                <li key={leaf} className="flex gap-2 text-sm leading-relaxed text-ink">
                  <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-inksoft/60" />
                  <span>{leaf}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
