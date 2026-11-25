import type { Config } from 'tailwindcss';

// MedSetu v3 design system — premium clinical.
// Light blue-grey surfaces, one deep petrol-teal primary with a brighter
// teal for gradient accents on dark bands and primary buttons, layered
// soft shadows and large radii for depth, one sparing amber accent.
const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F7F9', // app background — very light blue-grey
        mist: '#E8EEF1', // alt surface / wells
        ink: '#1B2A32', // primary text
        inksoft: '#546A75', // secondary text
        med: {
          DEFAULT: '#006D77', // deep medical petrol-teal
          deep: '#004F58', // headings, primary buttons (hover/active darker)
          abyss: '#03363D', // darkest teal — hero band, footer band
          bright: '#0E9594', // bright teal — gradient accents on dark bands
          glow: '#7FE7DC', // pale aqua — hero gradient text / glows
          soft: '#E1EDEF', // tinted surface for primary accents
          line: '#BFD9DB',
        },
        accent: {
          DEFAULT: '#B45309', // sparing amber — donate + rare highlights only
          soft: '#FAF0E2',
          deep: '#92400E',
        },
        line: '#D7E0E5',
        ok: { DEFAULT: '#2E7D43', soft: '#E4F0E7' }, // semantic correct green (analysis)
        bad: { DEFAULT: '#C0392B', soft: '#F9E9E7' }, // semantic wrong red (analysis)
        // TCS-iON style CBT palette (exam window only — faithful to the real UI)
        cbt: {
          head: '#2F5D8A', // TCS header blue
          headdeep: '#23496E',
          band: '#DCE9F5', // pale blue info bands
          panel: '#EFF5FB',
          green: '#3E9B4F',
          red: '#D64541',
          grey: '#7E858C',
          purple: '#7A4FA3',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      // Deliberate type roles (Impeccable typeset): one scale, used by role.
      fontSize: {
        display: ['3.5rem', { lineHeight: '1.06', letterSpacing: '-0.02em', fontWeight: '800' }],
        h1: ['2.75rem', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '800' }],
        h2: ['2.125rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '800' }],
        h3: ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        lead: ['1.0625rem', { lineHeight: '1.65' }],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,42,50,.05), 0 10px 30px -14px rgba(16,42,50,.14)',
        lift: '0 24px 48px -16px rgba(3,54,61,.30), 0 4px 12px -4px rgba(3,54,61,.12)',
        btn: '0 10px 24px -8px rgba(0,109,119,.55)',
        inset: 'inset 0 1px 0 rgba(255,255,255,.08)',
      },
    },
  },
  plugins: [],
};
export default config;
