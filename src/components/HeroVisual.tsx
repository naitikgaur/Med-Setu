/**
 * The hero visual: a faithful, static composition of MedSetu's own two
 * product surfaces — the TCS-style exam window on top, the analysis
 * verdict card overlapping below — built from the app's real components'
 * shapes and colours. Decorative depiction; the real thing is one click
 * away via Let's Start.
 */
export default function HeroVisual() {
  return (
    <div role="img" aria-label="The MedSetu exam window and a sample analysis verdict" className="relative">
      {/* Soft glow behind the composition */}
      <div aria-hidden className="absolute -inset-6 rounded-[36px] bg-med-bright/25 blur-3xl" />
      {/* Floating flashcard chip */}
      <div aria-hidden className="absolute -top-7 right-2 z-20 hidden w-[218px] rotate-[4deg] rounded-2xl bg-gradient-to-br from-med-deep to-med-abyss p-3.5 text-white shadow-lift ring-1 ring-white/25 sm:block">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-med-glow">Flashcard · Microbiology</p>
        <p className="mt-1 text-[12px] font-semibold leading-snug">Bubo is seen in… <span className="text-med-glow">LGV</span></p>
      </div>
      {/* Exam window */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-black/20">
        <div className="flex items-center justify-between gap-3 bg-cbt-head px-4 py-2.5 text-white">
          <p className="truncate text-[12px] font-semibold leading-snug">
            Foreign Medical Graduate Examination (FMGE)
            <span className="block text-[10px] font-medium text-white/75">MedSetu practice window · FMGE January 2024 · Part I</span>
          </p>
          <p className="shrink-0 text-right text-[10px] font-medium uppercase tracking-wide text-white/75">
            Time left
            <span className="block text-[15px] font-bold tabular-nums tracking-normal text-white">149 : 32</span>
          </p>
        </div>
        <div className="flex items-stretch justify-between border-b border-line bg-cbt-band px-4 py-1.5 text-[11px] font-medium text-ink">
          <span>Marks for correct answer: <strong>1</strong> · Negative Marks: <strong>0</strong></span>
          <span className="hidden tabular-nums sm:inline">Question time 00 : 41</span>
        </div>
        <div className="flex">
          <div className="min-w-0 flex-1 px-4 py-3.5">
            <p className="text-[13px] font-bold text-ink">
              Question No. 86 <span className="ml-1 text-[11px] font-medium text-inksoft">(Q86 of 300 in the full paper)</span>
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink">
              Bubo is seen in which of the following conditions?
            </p>
            <ul className="mt-3 space-y-1.5 text-[12.5px] text-ink">
              <li className="flex items-center gap-2 rounded-md bg-cbt-panel px-2.5 py-1.5 font-medium">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-cbt-head">
                  <span className="h-1.5 w-1.5 rounded-full bg-cbt-head" />
                </span>
                LGV
              </li>
              {['Herpes', 'Syphilis', 'Donovanosis'].map((o) => (
                <li key={o} className="flex items-center gap-2 px-2.5 py-1.5">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-inksoft/50" />
                  {o}
                </li>
              ))}
            </ul>
            <div className="mt-3.5 flex gap-2 border-t border-line pt-3">
              <span className="rounded bg-cbt-purple px-2.5 py-1.5 text-[11px] font-semibold text-white">Mark for Review &amp; Next</span>
              <span className="rounded border border-line px-2.5 py-1.5 text-[11px] font-semibold text-ink">Clear Response</span>
              <span className="ml-auto rounded bg-cbt-green px-2.5 py-1.5 text-[11px] font-semibold text-white">Save &amp; Next</span>
            </div>
          </div>
          <div className="hidden w-[132px] shrink-0 border-l border-line bg-cbt-panel px-3 py-3 sm:block">
            <p className="text-[11px] font-bold text-ink">Question Palette</p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              <span className="tile-down flex h-6 items-center justify-center bg-cbt-green text-[10px] font-bold text-white">1</span>
              <span className="tile-up flex h-6 items-center justify-center bg-cbt-red text-[10px] font-bold text-white">2</span>
              <span className="flex h-6 items-center justify-center rounded-full bg-cbt-purple text-[10px] font-bold text-white">3</span>
              {['4', '5', '6', '7', '8', '9', '10', '11', '12'].map((n) => (
                <span key={n} className="flex h-6 items-center justify-center border border-line bg-white text-[10px] font-semibold text-inksoft">
                  {n}
                </span>
              ))}
            </div>
            <ul className="mt-3 space-y-1 text-[10px] font-medium text-inksoft">
              <li className="flex items-center gap-1.5"><span className="tile-down inline-block h-3 w-3 bg-cbt-green" /> Answered</li>
              <li className="flex items-center gap-1.5"><span className="tile-up inline-block h-3 w-3 bg-cbt-red" /> Not Answered</li>
              <li className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-cbt-purple" /> Marked for Review</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Analysis verdict, overlapping */}
      <div className="relative z-10 ml-auto -mt-5 w-[270px] max-w-[85%] -rotate-1 rounded-2xl border border-line bg-white p-4 shadow-lift">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-inksoft">Your analysis</p>
          <span className="rounded bg-ok px-2 py-0.5 text-[11px] font-bold text-white">PASS</span>
        </div>
        <p className="mt-1.5 text-[26px] font-bold leading-none tabular-nums text-ink">
          161 <span className="text-[15px] font-semibold text-inksoft">/ 300</span>
        </p>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-mist">
          <div className="h-full w-[54%] rounded-full bg-gradient-to-r from-med-bright to-ok" />
        </div>
        <p className="mt-2 text-[11.5px] leading-snug text-inksoft">
          11 marks clear of the 150 pass mark · subject-wise breakdown, every solution, full answer key
        </p>
      </div>
    </div>
  );
}
