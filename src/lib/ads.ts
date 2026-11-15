/**
 * Google AdSense configuration — HOMEPAGE ONLY.
 *
 * MedSetu shows ads only on the landing page (src/app/page.tsx). No other
 * page imports the AdSense component, and the root layout never loads the
 * AdSense script. Test, practice and analysis pages stay ad-free by design.
 *
 * ACTIVATION STATE:
 *   1. `publisherId` below is the real AdSense publisher ID (set
 *      2026-11-15), so the AdSense loader script now ships on the
 *      homepage. (If it were ever reset to a non-numeric placeholder,
 *      NOTHING ad-related would render or load anywhere — the component
 *      goes inert.)
 *   2. Create display ad units in AdSense (after Google approves the
 *      site) and paste their slot IDs into `slots` — a unit renders only
 *      when its slot ID is non-empty, so no ad boxes appear until then.
 *   3. public/ads.txt carries the same publisher ID (pub-…, without the
 *      "ca-" prefix) — keep the two in sync.
 *   4. CSP: RESOLVED (2026-11-15). public/_headers keeps the strict,
 *      security-audited policy (script-src 'self') for every page, and
 *      adds a homepage-scoped ("/") rule whose CSP extends ONLY
 *      script-src / frame-src / img-src / connect-src with Google's ad
 *      domains, so the AdSense loader can run on the landing page while
 *      all other pages keep the strict policy unchanged.
 */
export const ADSENSE = {
  publisherId: 'ca-pub-4650304896817293',
  slots: {
    /** Mid-homepage unit, after the "Inside a solution" artefact section. */
    homeMid: '',
    /** Bottom-homepage unit, just above the footer band. */
    homeBottom: '',
  },
} as const;

export type AdSlotName = keyof typeof ADSENSE.slots;

/** True only when a real publisher ID has been pasted in above. */
export const adsConfigured = (): boolean => /^ca-pub-\d{10,}$/.test(ADSENSE.publisherId);

/** True when the given slot has been given a real AdSense slot ID. */
export const adSlotConfigured = (slot: AdSlotName): boolean =>
  adsConfigured() && /^\d+$/.test(ADSENSE.slots[slot]);
