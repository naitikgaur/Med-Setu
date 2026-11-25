import Link from 'next/link';
import { SiteFooter, DonateBlock } from '../../../components/SiteChrome';
import { SiteHeader } from '../../../components/SiteHeader';

export const metadata = {
  title: 'FMGE Subject-Wise Weightage: What 9,000 Practice Questions Reveal \u2014 MedSetu',
  description:
    'The exact subject-wise split behind MedSetu\u2019s 9,000-question FMGE grand-test bank \u2014 all 19 subjects counted, so you can plan revision by weight, not by guesswork.',
  alternates: { canonical: '/resources/fmge-subject-wise-weightage/' },
};

const ROWS: [string, number, number, string][] = [
  ['Medicine', 33, 990, '11.0%'],
  ['Surgery', 32, 960, '10.7%'],
  ['Obstetrics & Gynaecology', 30, 900, '10.0%'],
  ['Community Medicine (PSM)', 30, 900, '10.0%'],
  ['Anatomy', 17, 510, '5.7%'],
  ['Physiology', 17, 510, '5.7%'],
  ['Biochemistry', 17, 510, '5.7%'],
  ['Ophthalmology', 15, 450, '5.0%'],
  ['ENT', 15, 450, '5.0%'],
  ['Paediatrics', 15, 450, '5.0%'],
  ['Pharmacology', 13, 390, '4.3%'],
  ['Microbiology', 13, 390, '4.3%'],
  ['Pathology', 13, 390, '4.3%'],
  ['Radiology', 10, 300, '3.3%'],
  ['Forensic Medicine', 10, 300, '3.3%'],
  ['Orthopaedics', 5, 150, '1.7%'],
  ['Dermatology', 5, 150, '1.7%'],
  ['Psychiatry', 5, 150, '1.7%'],
  ['Anaesthesia', 5, 150, '1.7%'],
];

export default function SubjectWiseWeightage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">
            <Link href="/resources/" className="hover:underline">Resources</Link> \u00b7 Study guide
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            FMGE Subject-Wise Weightage: What 9,000 Practice Questions Reveal
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            Every FMGE aspirant asks the same question before they open a book:{' '}
            <em>where do the marks actually sit?</em> Advice on this is usually a screenshot of a
            screenshot \u2014 an &ldquo;approximate weightage&rdquo; table nobody can trace back to anything.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            So instead of repeating one, we counted our own bank. MedSetu&apos;s grand-test series is
            30 full-length tests of 300 questions each \u2014 <strong className="text-ink">9,000
            questions in total</strong>, built in the FMGE&apos;s two-part, 150 + 150 format and spread
            across all <strong className="text-ink">19 subjects</strong> and{' '}
            <strong className="text-ink">697 topics</strong>. Every one of the 30 tests uses the same
            subject blueprint, so the distribution below is not an average of averages: it is the
            exact split, question by question.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">The full count: 9,000 questions, 19 subjects</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white shadow-card">
            <table className="w-full min-w-[520px] text-left text-sm leading-relaxed">
              <thead>
                <tr className="border-b border-line bg-mist text-ink">
                  <th className="px-4 py-3 font-bold">Subject</th>
                  <th className="px-4 py-3 text-right font-bold">Questions per test</th>
                  <th className="px-4 py-3 text-right font-bold">Questions in 9,000</th>
                  <th className="px-4 py-3 text-right font-bold">Share</th>
                </tr>
              </thead>
              <tbody className="text-inksoft">
                {ROWS.map(([subject, perTest, total, share]) => (
                  <tr key={subject} className="border-b border-line last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-ink">{subject}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{perTest}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{total.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{share}</td>
                  </tr>
                ))}
                <tr className="bg-mist font-bold text-ink">
                  <td className="px-4 py-2.5">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">300</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">9,000</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-inksoft">
            <em>Source: MedSetu grand-test series data (series metadata for Grand Tests 1\u201330),
            counted 2026-11-17. This is the distribution of MedSetu&apos;s practice bank, built to
            mirror the subject spread of recent FMGE papers \u2014 it is a study-planning tool, not an
            NBEMS-published marks table. NBEMS does not publish an official per-subject weightage.</em>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">What the numbers actually tell you</h2>
          <div className="mt-3 max-w-3xl space-y-4 leading-relaxed text-inksoft">
            <p>
              <strong className="text-ink">1. Four subjects carry over 40% of the paper.</strong>{' '}
              Medicine, Surgery, Obstetrics &amp; Gynaecology and Community Medicine together account
              for 125 of every 300 questions (41.7%). A revision plan that treats all 19 subjects as
              equals is spending the same hour on 33 questions&apos; worth of Medicine as on 5
              questions&apos; worth of Anaesthesia. Weight your weeks the way the paper is weighted:
              the big four get daily slots; the 5-question subjects get sharp, PYQ-focused passes.
            </p>
            <p>
              <strong className="text-ink">2. The pre-clinical trio is bigger than it looks.</strong>{' '}
              Anatomy, Physiology and Biochemistry are 51 questions combined (17%) \u2014 more than
              Surgery alone. They are also the subjects students abandon earliest because they feel
              &ldquo;too basic.&rdquo; In a paper where roughly three-quarters of candidates do not qualify
              (see the pass figures below), 51 gettable questions is not a rounding error; it is
              often the margin.
            </p>
            <p>
              <strong className="text-ink">3. The middle band is where ranks of effort pay off.</strong>{' '}
              Ophthalmology, ENT and Paediatrics (15 each) plus Pharmacology, Microbiology and
              Pathology (13 each) make 84 questions \u2014 28% of the paper \u2014 from subjects whose
              questions lean heavily on repeated concepts, tables and images. This is the highest
              return-per-hour band in the bank.
            </p>
            <p>
              <strong className="text-ink">4. Small subjects are small \u2014 but never zero.</strong>{' '}
              Orthopaedics, Dermatology, Psychiatry and Anaesthesia contribute 5 questions each, 20 in
              total. Twenty questions is 13% of the 150 marks needed to qualify. The correct strategy
              is not to skip them; it is to cover them narrowly and late, from previous-year
              questions, in the final fortnight.
            </p>
            <p>
              <strong className="text-ink">5. This is a PYQ-heavy bank, deliberately.</strong> Of the
              9,000 grand-test questions, <strong className="text-ink">2,622 (29.1%) are
              previous-year questions</strong>, and <strong className="text-ink">2,154 (23.9%) are
              image-based</strong> \u2014 because the real paper rewards students who have practised
              both. When you review a grand test, the PYQ and image questions you missed are the
              highest-value revision list you own.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">How to turn this table into a timetable</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">Allocate revision days in proportion to share.</strong> In
              a 30-day revision block, the big four earn roughly 12\u201313 days between them; the
              pre-clinical trio about 5; the middle band about 8\u20139; Radiology and Forensic
              Medicine about 2; the four 5-question subjects share the remaining 1\u20132 days as PYQ
              sprints.
            </li>
            <li>
              <strong className="text-ink">Test in the same proportions.</strong> A mock that
              over-samples your favourite subject lies to you. MedSetu&apos;s grand tests hold the
              split above in every single test, so a weak subject cannot hide \u2014 your Topic Analysis
              after each test shows exactly which of the 697 topics the marks leaked from.
            </li>
            <li>
              <strong className="text-ink">Revisit the small subjects on a spaced loop.</strong> Five
              questions per test \u00d7 30 tests is 150 practice questions per small subject in this
              bank alone. Two spaced passes beat one long pre-exam cram.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">A note on what this data is \u2014 and is not</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            NBEMS, which conducts the FMGE, does not release an official subject-wise marks
            distribution, and any table anywhere claiming to be &ldquo;the official weightage&rdquo; should
            be treated with suspicion. What we can stand behind is our own count: 9,000 questions,
            assembled subject by subject, shown in full above. The exam itself, per the NBEMS FMGE
            Information Bulletin, is 300 multiple-choice questions in two parts of 150, with no
            negative marking, and a qualifying score of 150 out of 300. Recent results underline why
            planning matters: in the December 2025 session, 10,262 of 42,872 candidates passed
            (23.95%), and the June 2025 session&apos;s pass percentage was around 19% (NBEMS results,
            as reported by Careers360 and Medical Dialogues). Most candidates who miss 150 do not
            miss it everywhere \u2014 they miss it in two or three heavy subjects they under-weighted.
            This table exists so that doesn&apos;t happen by accident.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Keep going</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <Link href="/tests/" className="font-semibold text-med hover:underline">Start Grand Test 1</Link>{' '}
              \u2014 the 30-test series holds this exact split in every test.
            </li>
            <li>
              <Link href="/subjects/" className="font-semibold text-med hover:underline">Subject-wise tests</Link>{' '}
              for{' '}
              <Link href="/subject/medicine/" className="font-semibold text-med hover:underline">Medicine</Link>,{' '}
              <Link href="/subject/surgery/" className="font-semibold text-med hover:underline">Surgery</Link>,{' '}
              <Link href="/subject/obstetrics-gynaecology/" className="font-semibold text-med hover:underline">Obstetrics &amp; Gynaecology</Link>{' '}
              and{' '}
              <Link href="/subject/community-medicine/" className="font-semibold text-med hover:underline">Community Medicine</Link>.
            </li>
            <li>
              <Link href="/resources/how-to-attempt-grand-test/" className="font-semibold text-med hover:underline">
                How to attempt a grand test
              </Link>{' '}
              \u2014 pacing, guessing and analysis for the 300-question format.
            </li>
            <li>
              <Link href="/resources/fmge-30-day-revision-plan/" className="font-semibold text-med hover:underline">
                30-day revision plan
              </Link>{' '}
              \u2014 turn this weightage into a countdown to the next sitting.
            </li>
            <li>
              <Link href="/resources/" className="font-semibold text-med hover:underline">Books &amp; resources</Link>{' '}
              \u2014 all MedSetu study guides in one place.
            </li>
          </ul>
        </section>

        <section className="mt-10 border-t border-line pt-6">
          <p className="text-sm leading-relaxed text-inksoft">
            <strong className="text-ink">Study resource note:</strong> This article is an educational
            study resource published by MedSetu by Naitik Library to help FMGE aspirants plan their
            preparation. It is not medical advice, and nothing here is guidance for the diagnosis or
            treatment of any patient.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-inksoft">
            <strong className="text-ink">Sources:</strong> MedSetu grand-test series metadata (9,000
            questions, counted from Grand Tests 1\u201330); NBEMS, FMGE Information Bulletin (exam
            pattern and qualifying marks); NBEMS FMGE results for the December 2025 and June 2025
            sessions, as reported by Careers360 and Medical Dialogues.
          </p>
        </section>

        <div className="mt-10">
          <DonateBlock />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
