import { SiteFooter, PHONES } from '../../components/SiteChrome';
import { SiteHeader } from '../../components/SiteHeader';

export const metadata = {
  title: 'Privacy Policy — MedSetu',
  description:
    'MedSetu keeps no data: no server, no database, no accounts — your name and answers live only in your browser tab. The homepage carries Google AdSense ads; this page explains what that means for cookies.',
  alternates: { canonical: '/privacy/' },
};

const linkCls =
  'font-semibold text-med underline decoration-med/40 underline-offset-2 hover:decoration-med';

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <h1 className="max-w-2xl text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            Privacy policy
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            The short version: <strong className="text-ink">MedSetu itself collects nothing.</strong>{' '}
            There is no server and no database behind this site, and there are no accounts. The
            one exception to “nothing runs here but the site” is advertising on the homepage,
            explained plainly below.
          </p>
          <p className="mt-3 text-sm text-inksoft">Last updated: 16 November 2026</p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">What MedSetu itself does with your information</h2>
          <div className="mt-3 max-w-3xl space-y-3 leading-relaxed text-inksoft">
            <p>
              When you use MedSetu, you type a name and attempt tests or practise questions.
              That name, your answers, your mistakes list and your bookmarks are stored{' '}
              <strong className="text-ink">only in your own browser tab</strong> (in what is
              called session storage). They are never sent to us, never written to any database,
              and they disappear when you close the tab.
            </p>
            <p>
              MedSetu runs no analytics of its own and sets no cookies of its own. We cannot see
              who visited, which paper you attempted, or how you scored — by design, not just by
              promise: a static website with no server behind it has nowhere to send such
              information to.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Advertising on the homepage</h2>
          <div className="mt-3 max-w-3xl space-y-3 leading-relaxed text-inksoft">
            <p>
              The homepage — <strong className="text-ink">only the homepage</strong> — displays
              advertisements served by <strong className="text-ink">Google AdSense</strong>. The
              test pages, subject tests, question bank, analysis and every other page on MedSetu
              carry no advertising.
            </p>
            <p>
              Third party vendors, including Google, use cookies to serve ads based on a
              user&apos;s prior visits to your website or other websites. Google&apos;s use of
              advertising cookies enables it and its partners to serve ads based on visits to
              this site and/or other sites on the internet. Depending on your settings and
              choices, ads may be personalised or non-personalised.
            </p>
            <p>
              You can read how Google uses information from sites that use its services in{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                Google&apos;s advertising and privacy information
              </a>{' '}
              and in the{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                Google Privacy Policy
              </a>
              .
            </p>
            <p>
              You can opt out of personalised advertising at any time in{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                Google Ads Settings
              </a>
              , or via{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                aboutads.info
              </a>
              . You can also block or delete cookies in your browser settings — MedSetu works
              fully either way, and you never need an account.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Changes to this policy</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            If this policy changes, the updated version will be posted on this page. The
            commitment that does not change: MedSetu itself keeps no data about its students.
          </p>
        </section>

        <section className="mt-10 border-t border-line pb-4 pt-8">
          <h2 className="text-xl font-bold text-ink">Contact</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            Questions about privacy, or about MedSetu at all: call Naitik Library on{' '}
            <span className="font-semibold tabular-nums text-ink">{PHONES}</span> — Gautam Nagar,
            New Delhi.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
