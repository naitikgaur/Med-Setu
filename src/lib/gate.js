// The /start gate: pure helpers for the name + human check.
// Everything runs on the student's device. The check is a small ritual of
// intent — it keeps casual bots and accidental taps out of the library, and
// it is labelled honestly in the UI as exactly that, nothing more.

/**
 * Build one arithmetic challenge. `rng` is injectable so tests can pin the
 * output; operands are kept small and friendly (2..9 + 3..12).
 */
export function makeChallenge(rng = Math.random) {
  const a = 2 + Math.floor(rng() * 8); // 2..9
  const b = 3 + Math.floor(rng() * 10); // 3..12
  return { a, b, answer: a + b };
}

/**
 * Validate the gate form.
 * input: { name, robotChecked, answer, challenge }
 * answer may be a string (from the input) or a number.
 * Returns { ok, errors } where errors names each failing field so the UI
 * can say precisely what to fix.
 */
export function validateGate({ name, robotChecked, answer, challenge }) {
  const errors = {};
  if (!name || !String(name).trim()) errors.name = true;
  if (!robotChecked) errors.robot = true;
  const parsed =
    typeof answer === 'number' ? answer : parseInt(String(answer ?? '').trim(), 10);
  if (!challenge || Number.isNaN(parsed) || parsed !== challenge.answer) errors.sum = true;
  return { ok: Object.keys(errors).length === 0, errors };
}
