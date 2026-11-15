import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MedSetu — Free FMGE Previous-Year Mock Tests with Detailed Analysis',
  description:
    'Attempt FMGE previous-year papers (2020–2026) as full mock tests in the real exam manner — 300 questions, two parts, no negative marking — and get a detailed analysis, answer key and explanations. Free, no sign-up, no data collected. A Naitik Library effort.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
