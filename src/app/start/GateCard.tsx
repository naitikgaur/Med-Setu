'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getName, setName } from '../../lib/store';
import { makeChallenge, validateGate, type GateChallenge } from '../../lib/gate';

/** Only ever send the student to a page on this site after Enter. */
function safeNext(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) return raw;
  return '/choose/';
}

export default function GateCard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [existing, setExisting] = useState('');
  const [editing, setEditing] = useState(false);
  const [next, setNext] = useState('/choose/');

  const [name, setLocalName] = useState('');
  const [robot, setRobot] = useState(false);
  const [challenge, setChallenge] = useState<GateChallenge | null>(null);
  const [answer, setAnswer] = useState('');
  const [touched, setTouched] = useState(false);

  const newChallenge = useCallback(() => {
    setChallenge(makeChallenge());
    setAnswer('');
  }, []);

  useEffect(() => {
    const stored = getName().trim();
    setExisting(stored);
    setLocalName(stored);
    setNext(safeNext(new URLSearchParams(window.location.search).get('next')));
    newChallenge();
    setReady(true);
  }, [newChallenge]);

  const result = useMemo(
    () => validateGate({ name, robotChecked: robot, answer, challenge }),
    [name, robot, answer, challenge]
  );
  const canEnter = ready && result.ok;
  const showSumError = touched && answer.trim() !== '' && !!result.errors.sum;

  const enter = () => {
    if (!canEnter) return;
    setName(name.trim());
    router.push(next);
  };

  if (!ready) {
    return <div className="h-72 animate-pulse rounded-2xl bg-mist" aria-hidden />;
  }

  // A name is already stored in this tab: one tap continues.
  if (existing && !editing) {
    return (
      <div className="rounded-2xl border border-line bg-white p-6 shadow-lift sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
          You entered as <span className="font-semibold text-ink">{existing}</span> in this tab.
          Your papers, subject tests, the question bank and any test in progress are waiting.
        </p>
        <button
          type="button"
          onClick={() => router.push(next)}
          className="mt-6 w-full rounded-md bg-med px-6 py-3 text-base font-bold text-white transition-colors hover:bg-med-deep"
        >
          Continue as {existing}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 w-full rounded-md border border-line bg-white px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-med-line hover:text-med-deep"
        >
          Use a different name
        </button>
        <p className="mt-4 text-xs leading-relaxed text-inksoft">
          The name lives only in this browser tab. Closing the tab erases it — nothing is uploaded
          or stored anywhere.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6 shadow-lift sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Let&apos;s start</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
        Tell us the name to put on your test screen, pass one quick human check, and the whole
        package — twelve previous-year papers, thirty subject-wise tests and the question bank —
        is yours. No account, no password, nothing leaves this device.
      </p>

      <form
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          enter();
        }}
      >
        <label htmlFor="gate-name" className="text-sm font-semibold text-ink">
          Your name
        </label>
        <input
          id="gate-name"
          type="text"
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(e) => setLocalName(e.target.value)}
          placeholder="e.g. Dr. Aisha Khan"
          className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] outline-none placeholder:text-[#5F737E] focus:border-med focus:ring-2 focus:ring-med/20"
        />
        <p className="mt-1.5 text-xs leading-relaxed text-inksoft">
          Shown on your test screen and your printed report. It stays in this browser tab.
        </p>

        {/* Human check: a checkbox and one small addition, checked on-device. */}
        <div className="mt-5 rounded-xl border border-line bg-paper px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={robot}
              aria-label="I'm not a robot"
              onClick={() => setRobot((v) => !v)}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                robot ? 'border-med bg-med' : 'border-inksoft/50 bg-white hover:border-med'
              }`}
            >
              {robot && (
                <svg viewBox="0 0 12 12" className="h-4 w-4" fill="none" aria-hidden>
                  <path d="M2 6.5 4.8 9 10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span className="text-[15px] font-medium text-ink">I&apos;m not a robot</span>
            <span className="ml-auto text-right text-[11px] leading-tight text-inksoft">
              quick human check,
              <br />
              done on your device
            </span>
          </div>

          <div className="mt-4 border-t border-line pt-4">
            <label htmlFor="gate-sum" className="text-sm font-semibold text-ink">
              {challenge ? (
                <>
                  What is {challenge.a} + {challenge.b}?
                </>
              ) : (
                'One small addition:'
              )}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                id="gate-sum"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value.replace(/[^0-9]/g, ''));
                  setTouched(true);
                }}
                placeholder="Your answer"
                aria-invalid={showSumError}
                className="w-32 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] tabular-nums outline-none placeholder:text-[#5F737E] focus:border-med focus:ring-2 focus:ring-med/20"
              />
              <button
                type="button"
                onClick={newChallenge}
                className="rounded-md px-2.5 py-2 text-sm font-semibold text-med transition-colors hover:bg-med-soft"
              >
                New question
              </button>
            </div>
            {showSumError ? (
              <p className="mt-1.5 text-xs font-medium text-accent-deep" role="alert">
                That&apos;s not quite it — check the addition and try again.
              </p>
            ) : (
              <p className="mt-1.5 text-xs leading-relaxed text-inksoft">
                A small step that keeps the library for students. It runs entirely on your
                device — nothing is sent anywhere.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canEnter}
          className="mt-6 w-full rounded-md bg-med px-6 py-3 text-base font-bold text-white transition-colors hover:bg-med-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enter
        </button>
        {!canEnter && (
          <p className="mt-2 text-center text-xs text-inksoft">
            Enter unlocks when your name is filled, the box is ticked and the addition is right.
          </p>
        )}
      </form>
    </div>
  );
}
