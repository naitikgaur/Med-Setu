import Link from 'next/link';
import { SiteFooter, DonateBlock } from '../../../components/SiteChrome';
import { SiteHeader } from '../../../components/SiteHeader';

export const metadata = {
  title: 'How to Attempt a 300-Question FMGE Grand Test \u2014 MedSetu',
  description:
    'A practical, minute-by-minute strategy for attempting a 300-question FMGE grand test \u2014 pacing for Part A and Part B, when to guess, and how to mine the analysis afterwards.',
  alternates: { canonical: '/resources/how-to-attempt-grand-test/' },
};

const GEARS: [string, string, string, string][] = [
  ['1 \u2014 Recall', 'One-liner facts, classic presentations, direct PYQ repeats', '20\u201340 seconds', 'Answer, tag, move. Banking time here funds everything else.'],
  ['2 \u2014 Reasoning', 'Clinical vignettes, two-step logic, image interpretation', '60\u201390 seconds', 'Read the last line first (what is being asked), then the stem. Eliminate two options before deliberating.'],
  ['3 \u2014 Stuck', 'Unfamiliar topic, conflicting options, long data sets', 'Cap at 2 minutes', 'Mark it, pick your current best guess, and go. A marked question is a plan; a stared-at question is a leak.'],
];

export default function HowToAttemptGrandTest() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">
            <Link href="/resources/" className="hover:underline">Resources</Link> \u00b7 Study guide
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            How to Attempt a 300-Question FMGE Grand Test: A Two-Part Strategy Guide
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            A grand test is not a reading exercise; it is a 300-decision performance under a clock.
            The FMGE itself, per the NBEMS Information Bulletin, is 300 multiple-choice questions
            split into <strong className="text-ink">two parts of 150</strong>, each part with its own
            sitting, <strong className="text-ink">no negative marking</strong>, and a qualifying score
            of <strong className="text-ink">150 out of 300</strong>. MedSetu&apos;s grand tests mirror
            that format exactly \u2014 300 questions, two parts of 150 \u2014 so the attempt strategy
            below is practice for the real hall, not just for this website.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            Most students lose marks in a grand test in three predictable ways: they run out of time
            in the last 40 questions, they change correct answers into wrong ones during a panicked
            review pass, and they walk away from the analysis without converting it into a revision
            list. This guide is built to close all three leaks.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Before you start: set the conditions</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">One sitting per part, no pausing mid-part.</strong> The real
              exam will not pause for you. Attempt Part A in one block, take a genuine break, then
              attempt Part B. If you train with pauses, your pacing data is fiction.
            </li>
            <li>
              <strong className="text-ink">Full time, every time.</strong> Each part of the real FMGE
              allows 150 minutes for 150 questions (Part A 9:00\u201311:30 AM, Part B 2:00\u20134:30 PM,
              per the NBEMS pattern \u2014 verified 2026-11-17). Practise at the real allowance even
              when a test feels easy; finishing 20 minutes early is data, not a reward.
            </li>
            <li>
              <strong className="text-ink">Attempt like it counts.</strong> Tag your confidence honestly
              as you go (sure / unsure / guessed) if the platform asks \u2014 MedSetu&apos;s analysis
              uses those tags, and dishonest tags produce a dishonest report.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">The pacing math (per part: 150 questions)</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            One minute per question is the average the format allows \u2014 but nobody attempts
            uniformly, and you shouldn&apos;t. Use a three-gear system:
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-white shadow-card">
            <table className="w-full min-w-[560px] text-left text-sm leading-relaxed">
              <thead>
                <tr className="border-b border-line bg-mist text-ink">
                  <th className="px-4 py-3 font-bold">Gear</th>
                  <th className="px-4 py-3 font-bold">Question type</th>
                  <th className="px-4 py-3 font-bold">Target time</th>
                  <th className="px-4 py-3 font-bold">What to do</th>
                </tr>
              </thead>
              <tbody className="text-inksoft">
                {GEARS.map(([gear, type, time, action]) => (
                  <tr key={gear} className="border-b border-line align-top last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-ink">{gear}</td>
                    <td className="px-4 py-2.5">{type}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">{time}</td>
                    <td className="px-4 py-2.5">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 max-w-3xl space-y-3 leading-relaxed text-inksoft">
            <p>
              <strong className="text-ink">Checkpoint rule:</strong> at question 75 you should be
              near the halfway mark of your time, with a small buffer banked from Gear-1 questions. If
              you are behind, the fix is not to read faster \u2014 it is to shorten Gear 3: cap stuck
              questions at 90 seconds for the rest of the part.
            </p>
            <p>
              <strong className="text-ink">The last 15 minutes are for marked questions only.</strong>{' '}
              Never start a fresh wrestling match with a new hard question while marked ones are still
              unvisited.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Guessing: the no-negative-marking rule changes everything</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            The FMGE has <strong className="text-ink">no negative marking</strong> (NBEMS Information
            Bulletin). Two consequences:
          </p>
          <ol className="mt-3 max-w-3xl list-decimal space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">A blank answer is the only guaranteed zero.</strong> Before
              any part ends, every question must have an answer selected. In the final two minutes,
              fill anything left with your most-plausible option \u2014 even a 1-in-4 guess is worth
              more than a skip.
            </li>
            <li>
              <strong className="text-ink">Guessing is a skill, not a sin \u2014 but track it.</strong>{' '}
              MedSetu&apos;s analysis separates your score by confidence tag (sure / unsure / guessed),
              so you can see whether your guesses are netting marks or masking a weak topic. If your
              &ldquo;sure&rdquo; accuracy is below your &ldquo;unsure&rdquo; accuracy in a subject, the problem is
              not knowledge \u2014 it is calibration, and it is fixable.
            </li>
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Changing answers: what the data pattern says</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            Every MedSetu analysis includes a change report: how many answers you changed, and whether
            changes gained or lost marks. Use it on yourself. The common pattern across candidates is
            that first-instinct changes made calmly (you misread the question, you recalled a fact
            mid-test) gain marks, while changes made in the final minutes under time pressure lose
            them. Your own change report tells you which kind of changer you are. Rule until your data
            says otherwise: <strong className="text-ink">change an answer only when you can state, in
            one sentence, why the new option is right \u2014 never merely because the old one
            &ldquo;feels wrong.&rdquo;</strong>
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">After the test: the analysis is the product</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            A grand test you don&apos;t analyse is 300 questions spent for one number. MedSetu&apos;s
            analysis breaks your attempt into named sections \u2014 use each one for a specific job:
          </p>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">Test Breakdown</strong> \u2014 your score, attempts, accuracy
              and time at a glance. This is the headline; spend two minutes here, not twenty.
            </li>
            <li>
              <strong className="text-ink">Score Potential</strong> \u2014 shows the marks available from
              error reduction: what your score becomes if specific error types disappear. This sets the
              target for the next test (e.g., &ldquo;recover the 11 marks lost to rushed errors before
              chasing new topics&rdquo;).
            </li>
            <li>
              <strong className="text-ink">Attempt Analysis</strong> \u2014 accuracy by confidence tag
              (sure / unsure / guessed). Finds calibration problems and guess quality.
            </li>
            <li>
              <strong className="text-ink">Time Analysis</strong> \u2014 time on correct vs wrong answers,
              fastest and slowest questions. If your wrong answers average far longer than your correct
              ones, you are paying premium time for zero marks: tighten the Gear-3 cap.
            </li>
            <li>
              <strong className="text-ink">Parts &amp; Pace</strong> \u2014 Part A vs Part B performance.
              A consistent Part B drop usually means stamina or break discipline, not knowledge \u2014
              fix the break, not the books.
            </li>
            <li>
              <strong className="text-ink">Topic Analysis</strong> \u2014 the most important section. It
              maps every question to its topic across the syllabus (699 topics in MedSetu&apos;s bank)
              and shows where your marks leaked, topic by topic.{' '}
              <strong className="text-ink">Convert this directly into your next revision list:</strong>{' '}
              every topic with two or more wrong answers goes on the list, in order of questions lost.
            </li>
            <li>
              <strong className="text-ink">Question Journey / Question-by-Question Review + Answer
              Key</strong> \u2014 revisit only three categories: questions you got wrong, questions
              you guessed right (a lucky correct is an unlearned topic), and marked questions. Reading
              all 300 explanations is how analysis turns into procrastination.
            </li>
          </ul>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            <strong className="text-ink">The 24-hour rule:</strong> do the analysis within a day, while
            you still remember <em>why</em> you picked each wrong option. A wrong answer whose
            reasoning you can&apos;t reconstruct teaches half as much.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">A rhythm that works across the series</h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-inksoft">
            With 30 grand tests in the series, don&apos;t burn them back-to-back. A sustainable cycle
            is: <strong className="text-ink">test day \u2192 analysis + topic list the same evening
            \u2192 two to three days revising exactly those topics (subject tests and PYQs) \u2192 next
            grand test.</strong> Each cycle should retire a few topics permanently. If your Topic
            Analysis shows the same topic leaking in two consecutive tests, it stops being a revision
            item and becomes a from-scratch study item \u2014 go back to the textbook chapter, not just
            the questions.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            The qualifying line is 150. Nobody reaches it by attempting harder on test day alone; they
            reach it by making each test hand them a shorter, sharper list than the one before. That is
            the entire strategy: attempt with gears and checkpoints, guess without fear but with tags
            on, change answers only with a reason \u2014 and let the analysis write your next three
            days.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Keep going</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <Link href="/tests/" className="font-semibold text-med hover:underline">Attempt Grand Test 1</Link>{' '}
              \u2014 put the three gears and the 75-question checkpoint into practice.
            </li>
            <li>
              <Link href="/resources/fmge-subject-wise-weightage/" className="font-semibold text-med hover:underline">
                Subject-wise weightage
              </Link>{' '}
              \u2014 the 19-subject split your revision days should follow.
            </li>
            <li>
              <Link href="/resources/fmge-30-day-revision-plan/" className="font-semibold text-med hover:underline">
                30-day revision plan
              </Link>{' '}
              \u2014 grand tests as scheduled checkpoints for the next sitting.
            </li>
            <li>
              <Link href="/subjects/" className="font-semibold text-med hover:underline">Subject tests for targeted revision</Link>{' '}
              \u2014 verify each repair day with a subject test.
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
            study resource published by MedSetu by Naitik Library to help FMGE aspirants plan and
            analyse their practice. It is not medical advice, and nothing here is guidance for the
            diagnosis or treatment of any patient.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-inksoft">
            <strong className="text-ink">Sources:</strong> NBEMS, FMGE Information Bulletin (300
            questions in two parts of 150; no negative marking; qualifying score 150/300); MedSetu
            grand-test analysis (section names and reports as implemented on med-setu.netlify.app).
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
