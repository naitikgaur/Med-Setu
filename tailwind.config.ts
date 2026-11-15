import type { Config } from 'tailwindcss';

// MedSetu v2 design system — clinical, restrained, medical.
// Predominantly white / very light blue-grey surfaces, one deep petrol-teal
// primary, one sparing amber accent, flat colours only (no gradients),
// subtle 1px borders instead of shadows, 8px spacing rhythm.
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
          soft: '#E1EDEF', // tinted surface for primary accents
          line: '#BFD9DB',
        },
        accent: {
          DEFAULT: '#B45309', // sparing amber — donate + rare highlights only
          soft: '#FAF0E2',
          deep: '#92400E',
        },
        line: '#D7E0E5',
        ok: '#2E7D43', // semantic correct green (analysis)
        bad: '#C0392B', // semantic wrong red (analysis)
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
      boxShadow: {
        card: '0 1px 2px rgba(27,42,50,.05)',
        lift: '0 8px 28px -12px rgba(27,42,50,.25)',
      },
    },
  },
  plugins: [],
};
export default config;
