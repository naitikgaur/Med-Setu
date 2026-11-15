'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { ADSENSE, adSlotConfigured, adsConfigured, type AdSlotName } from '../lib/ads';

/**
 * Google AdSense — HOMEPAGE ONLY.
 *
 * This component is imported solely by src/app/page.tsx (the landing page).
 * It is never imported by the root layout or any other page, so no other
 * page loads the AdSense script or renders ad markup. While the publisher
 * ID in src/lib/ads.ts is still the placeholder, everything here renders
 * null: no script is requested and no ad markup is emitted.
 */

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

/** Loads the AdSense library once. Render once, near the top of the page. */
export function AdSenseLoader() {
  if (!adsConfigured()) return null;
  return (
    <Script
      id="adsense-loader"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE.publisherId}`}
    />
  );
}

/**
 * One responsive display unit. Renders only when AdSense is configured AND
 * this slot has been given a real slot ID in src/lib/ads.ts — otherwise it
 * renders nothing at all (no placeholder box, no filler text).
 */
export function AdUnit({ slot }: { slot: AdSlotName }) {
  const active = adSlotConfigured(slot);
  const pushed = useRef(false);

  useEffect(() => {
    if (!active || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* Loader blocked or not ready: the unit simply stays empty. */
    }
  }, [active]);

  if (!active) return null;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE.publisherId}
        data-ad-slot={ADSENSE.slots[slot]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
