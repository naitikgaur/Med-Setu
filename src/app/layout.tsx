import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = 'https://med-setu.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'MedSetu — Complete FMGE Preparation Platform for Medical Students',
  description:
    'MedSetu is the complete FMGE preparation platform for medical students: previous-year papers (2020–2026) as full mock tests in the real exam manner, a 30-test grand test series, subject-wise tests, a question bank of 13,934 questions, rapid-revision short notes with mind maps, 950 flashcards, and 150 free guides. Free, no sign-up, no data collected. A Naitik Library effort.',
  openGraph: {
    type: 'website',
    siteName: 'MedSetu by Naitik Library',
    title: 'MedSetu — Complete FMGE Preparation Platform for Medical Students',
    description:
      'Previous-year FMGE papers as full mocks, 30 grand tests, subject-wise tests, a 13,934-question bank, short notes, mind maps and flashcards — the complete preparation, free. By Naitik Library, New Delhi.',
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'MedSetu — complete FMGE preparation by Naitik Library' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MedSetu — Complete FMGE Preparation Platform for Medical Students',
    description:
      'FMGE previous-year mocks, 30 grand tests, a 13,934-question bank, short notes, mind maps and flashcards. Free, no sign-up.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Naitik Library',
      url: `${SITE_URL}/naitik-library/`,
      description:
        'Naitik Library is a study hall for medical students in Gautam Nagar, New Delhi, founded by Naitik Gaur. It publishes MedSetu, the complete free FMGE preparation platform for medical students.',
      founder: { '@type': 'Person', name: 'Naitik Gaur' },
      sameAs: [
        'https://www.instagram.com/naitiklibrary/',
        'https://chat.whatsapp.com/BAxhL36HFnvC3o8Rqp7q07',
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Gautam Nagar',
        addressLocality: 'New Delhi',
        addressRegion: 'Delhi',
        addressCountry: 'IN',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-89209-22167',
        contactType: 'customer support',
        areaServed: 'IN',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'MedSetu',
      alternateName: 'MedSetu by Naitik Library',
      description:
        'The complete FMGE preparation platform for medical students: previous-year papers as full mock tests, the MedSetu Test Series of 30 grand tests, subject-wise tests, a question bank of 13,934 questions, short notes with mind maps, flashcards and guides — with a detailed analysis after every test.',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
      </body>
    </html>
  );
}
