import Link from 'next/link';
import { SiteFooter, PHONES } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';

export const metadata = {
  title: 'Contact MedSetu — Naitik Library, Gautam Nagar, New Delhi',
  description:
    'Contact MedSetu and Naitik Library: call or WhatsApp 8920922167, or visit the library at Gautam Nagar, New Delhi. Questions about the free FMGE preparation platform, a paper, or an explanation — ask us.',
  alternates: { canonical: '/contact/' },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <h1 className="text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            MedSetu is run by <strong className="text-ink">Naitik Library</strong>, a study hall
            for medical students in Gautam Nagar, New Delhi, founded by Naitik Gaur. If something
            on the site is wrong, unclear, or missing — or you simply need help using it — reach
            out. We read everything ourselves.
          </p>
        </section>

        <section className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">Call or WhatsApp</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
              The fastest way to reach us — for a question about a paper, an explanation you think
              is wrong, or help with a test that is not opening.
            </p>
            <p className="mt-3 text-2xl font-bold tabular-nums text-med-deep">{PHONES}</p>
            <a
              href={`tel:+91${PHONES}`}
              className="mt-3 inline-block rounded-md bg-med px-5 py-2.5 font-semibold text-white transition-colors hover:bg-med-deep"
            >
              Call {PHONES}
            </a>
          </div>
          <div className="rounded-xl border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">Visit the library</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
              Naitik Library is a physical study hall for medical students. If you are preparing
              for FMGE in Delhi, you are welcome to come and study with us.
            </p>
            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-ink">
              Naitik Library
              <br />
              Gautam Nagar, New Delhi, India
            </p>
            <Link
              href="/naitik-library/"
              className="mt-3 inline-block font-semibold text-med hover:underline"
            >
              About Naitik Library →
            </Link>
          </div>
          <div className="rounded-xl border border-line bg-white p-6 shadow-card sm:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-bold text-ink">Join the community</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-inksoft">
              Students preparing with MedSetu share papers, doubts and updates in our WhatsApp
              group, and Naitik Library posts on Instagram.
            </p>
            <p className="mt-3 flex flex-col gap-2 text-[15px] font-semibold">
              <a
                href="https://chat.whatsapp.com/BAxhL36HFnvC3o8Rqp7q07"
                target="_blank"
                rel="noopener noreferrer"
                className="text-med hover:underline"
              >
                Join the WhatsApp group →
              </a>
              <a
                href="https://www.instagram.com/naitiklibrary/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-med hover:underline"
              >
                Instagram — @naitiklibrary →
              </a>
            </p>
          </div>
        </section>

        <section className="pb-12">
          <h2 className="text-xl font-bold text-ink">What to write to us about</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">A wrong answer or explanation.</strong> Tell us the
              paper or test and the question number — we check it against the source and fix it.
            </li>
            <li>
              <strong className="text-ink">A broken image or page.</strong> Tell us which test and
              question; screenshots help.
            </li>
            <li>
              <strong className="text-ink">Studying at Naitik Library.</strong> Call the number
              above and ask.
            </li>
            <li>
              <strong className="text-ink">Supporting MedSetu.</strong> MedSetu is free and runs
              on donations — the UPI details are in the footer of every page.
            </li>
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-inksoft">
            Please do not send us your personal documents or exam credentials — MedSetu has no
            accounts and never needs them. Your name and answers on this site never leave your own
            device; see the <Link href="/privacy/" className="font-semibold text-med hover:underline">Privacy Policy</Link>.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
