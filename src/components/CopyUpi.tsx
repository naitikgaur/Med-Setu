'use client';
import { useState } from 'react';

export const UPI_ID = 'naitikdev@fam';

export default function CopyUpi({ dark = false }: { dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <span className="inline-flex items-center gap-2">
      <code
        className={`rounded px-2.5 py-1 font-mono text-sm font-semibold tracking-wide ${
          dark ? 'bg-white/10 text-white' : 'bg-med-soft text-med-deep'
        }`}
      >
        {UPI_ID}
      </code>
      <button
        type="button"
        onClick={copy}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          dark
            ? 'bg-white text-med-deep hover:bg-mist'
            : 'bg-med text-white hover:bg-med-deep'
        }`}
      >
        {copied ? 'Copied ✓' : 'Copy UPI ID'}
      </button>
    </span>
  );
}
