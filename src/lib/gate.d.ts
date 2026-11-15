export interface GateChallenge {
  a: number;
  b: number;
  answer: number;
}

export interface GateErrors {
  name?: boolean;
  robot?: boolean;
  sum?: boolean;
}

export function makeChallenge(rng?: () => number): GateChallenge;

export function validateGate(input: {
  name: string;
  robotChecked: boolean;
  answer: string | number;
  challenge: GateChallenge | null;
}): { ok: boolean; errors: GateErrors };
