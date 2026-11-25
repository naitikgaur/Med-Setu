import Link from 'next/link';
import { SiteFooter, DonateBlock } from '../../../components/SiteChrome';
import { SiteHeader } from '../../../components/SiteHeader';

export const metadata = {
  title: 'FMGE Next Sitting: A 30-Day Revision Plan Using Grand Tests \u2014 MedSetu',
  description:
    'A week-by-week 30-day FMGE revision plan for the next sitting \u2014 grand tests as the spine, subject weightage as the map, and Topic Analysis as the steering wheel.',
  alternates: { canonical: '/resources/fmge-30-day-revision-plan/' },
};

export default function ThirtyDayRevisionPlan() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="content" className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6">
        <section className="border-b border-line pb-8 pt-8 sm:pt-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">
            <Link href="/resources/" className="hover:underline">Resources</Link> \u00b7 Study guide
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-snug tracking-tight text-ink sm:text-4xl">
            FMGE Next Sitting: A 30-Day Revision Plan Using Grand Tests
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-inksoft sm:text-lg">
            Thirty days before the FMGE, the question is no longer &ldquo;what should I study?&rdquo; \u2014
            it is &ldquo;in what order, and how do I know it&apos;s working?&rdquo; This plan answers both
            with one spine: <strong className="text-ink">MedSetu&apos;s 30 grand tests</strong>, used as
            scheduled checkpoints rather than a pile to rush through, and one map: the subject
            weightage of the paper itself.
          </p>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            The plan assumes you have a first reading of most subjects behind you (it is a{' '}
            <em>revision</em> plan), that you can give the exam most of your day, and that your target
            is the only number that matters in this exam \u2014{' '}
            <strong className="text-ink">150 out of 300</strong>, the qualifying score set by NBEMS.
          </p>
          <div className="mt-6 rounded-xl border border-line bg-white px-5 py-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-med-deep">
              Exam-date note \u2014 verified 17 Nov 2026
            </p>
            <p className="mt-1.5 leading-relaxed text-inksoft">
              <strong className="text-ink">NBEMS has not yet notified the date of the next
              sitting.</strong> Its 28 August 2026 notice moved the sitting once set for 9 January
              2027 to late January or February 2027, and the information bulletin for that sitting is
              not yet published. There is no December 2026 exam. Apply this plan as a 30-day
              countdown: <strong className="text-ink">Day 30 is exam day once NBEMS notifies the date
              at natboard.edu.in</strong> \u2014 start Day 1 thirty days before the notified date, not
              before. For context on why the plan is built this way: in the December 2025 session,
              10,262 of 42,872 candidates passed \u2014 23.95% (NBEMS results, as reported by
              Careers360 and Medical Dialogues). The plan below is designed around the failure pattern
              those numbers imply: not weak everywhere, but leaking marks in a few heavy subjects and
              never converting practice into a fix-list.
            </p>
          </div>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            <strong className="text-ink">How the days are organised.</strong> Every week has the same
            skeleton: grand tests on fixed days, analysis the same evening, and revision days that are{' '}
            <em>assigned by your own Topic Analysis</em> \u2014 not by a generic timetable. Where this
            plan names subjects, it follows the verified weightage of the paper (Medicine 33, Surgery
            32, OBG 30 and Community Medicine 30 questions per 300; see the companion{' '}
            <Link href="/resources/fmge-subject-wise-weightage/" className="font-semibold text-med hover:underline">
              weightage article
            </Link>{' '}
            for the full 19-subject table).
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Week 1 (Days 1\u20137): Diagnose before you revise</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">Day 1 \u2014 Grand Test 1, attempted cold, full
              conditions.</strong> Two parts of 150, one sitting each, no pausing. This test is a
              measuring instrument, not a judgement.
            </li>
            <li>
              <strong className="text-ink">Day 1 evening \u2014 full analysis.</strong> Work through
              every section (Test Breakdown \u2192 Score Potential \u2192 Attempt Analysis \u2192 Time
              Analysis \u2192 Parts &amp; Pace \u2192 Topic Analysis). Write down: (a) your score and its
              distance from 150, (b) the five topics that cost you the most questions, (c) your Part A
              vs Part B gap, (d) your guess accuracy.
            </li>
            <li>
              <strong className="text-ink">Days 2\u20136 \u2014 repair the leaks.</strong> Revise the
              Day-1 topic list first. Then give the big four (Medicine, Surgery, OBG, Community
              Medicine \u2014 125 of 300 questions) one full day each, PYQ-led: previous-year
              questions first, notes second. Use{' '}
              <Link href="/subjects/" className="font-semibold text-med hover:underline">subject tests</Link>{' '}
              to verify each day&apos;s repair.
            </li>
            <li>
              <strong className="text-ink">Day 7 \u2014 Grand Test 2 + analysis.</strong> Compare Topic
              Analysis across the two tests. Topics fixed in Week 1 should disappear from the leak
              list; anything leaking twice is promoted to &ldquo;study from scratch&rdquo; status.
            </li>
          </ul>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            <strong className="text-ink">Week 1 exit criteria:</strong> a written leak list, a known
            Part A/B pattern, and a score trend \u2014 not a feeling.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Week 2 (Days 8\u201314): The middle band and the pre-clinical trio</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">Grand tests on Days 8, 11 and 14</strong> (analysis same
              evening, every time). You are now testing every third day; the days between belong to
              the leak list.
            </li>
            <li>
              <strong className="text-ink">Subject focus:</strong> the middle band \u2014
              Ophthalmology, ENT, Paediatrics (15 questions each) and Pharmacology, Microbiology,
              Pathology (13 each) \u2014 84 questions, 28% of the paper, and the band where concepts
              and images repeat most. Alternate with the pre-clinical trio (Anatomy, Physiology,
              Biochemistry \u2014 51 questions): one trio subject per revision day, PYQs first.
            </li>
            <li>
              <strong className="text-ink">Image practice, deliberately.</strong> 2,154 of the 9,000
              questions in MedSetu&apos;s grand-test bank are image-based (23.9%). Schedule image-heavy
              subject tests (Ophthalmology, Radiology, Dermatology, Pathology) in this week rather
              than discovering image weakness in Week 4.
            </li>
            <li>
              <strong className="text-ink">Start the small-subject loop.</strong> Orthopaedics,
              Dermatology, Psychiatry, Anaesthesia carry only 5 questions each \u2014 cover one per
              day in 60\u201390 minute PYQ sprints, and revisit each once more before exam day (spaced,
              not crammed).
            </li>
          </ul>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            <strong className="text-ink">Week 2 exit criteria:</strong> middle-band accuracy rising in
            Topic Analysis; no subject in the bank still at &ldquo;never revised&rdquo; status.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Week 3 (Days 15\u201321): Volume with discipline</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">Grand tests on Days 15, 18 and 21.</strong> By now the
              attempt mechanics from the{' '}
              <Link href="/resources/how-to-attempt-grand-test/" className="font-semibold text-med hover:underline">
                strategy guide
              </Link>{' '}
              (three gears, 75-question checkpoint, marked-question discipline, no blank answers \u2014
              the FMGE has no negative marking) should be automatic; if your Time Analysis still shows
              long, expensive wrong answers, fix the Gear-3 cap this week, not next.
            </li>
            <li>
              <strong className="text-ink">Revision days are 100% leak-list driven.</strong> Whatever
              Topic Analysis flags after each test is the next two days&apos; syllabus. Resist restarting
              any subject &ldquo;from the beginning&rdquo; \u2014 with nine days of testing left, breadth is
              finished; this is depth-on-weakness only.
            </li>
            <li>
              <strong className="text-ink">Second pass of the big four</strong>, weighted by{' '}
              <em>your</em> numbers: whichever of Medicine / Surgery / OBG / Community Medicine has
              your lowest accuracy gets the extra day, regardless of the generic order.
            </li>
            <li>
              <strong className="text-ink">One full two-part simulation day (Day 21):</strong> attempt
              the grand test with the real exam&apos;s sitting structure and break, at the real
              exam&apos;s time of day if you know it. Stamina is a Week-3 problem; in Week 4 it is too
              late to build.
            </li>
          </ul>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            <strong className="text-ink">Week 3 exit criteria:</strong> two consecutive grand tests at
            or above your safety target (aim to be practising at 160+ so exam-day variance still
            clears 150), and a leak list that is shrinking, not rotating.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Week 4 (Days 22\u201330): Convert, taper, arrive fresh</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">Days 22\u201325 \u2014 Grand Tests on Days 22 and 24; revision
              strictly from their Topic Analyses.</strong> Cover Radiology and Forensic Medicine (10
              questions each) properly here if they have been deferred \u2014 they are compact, factual,
              and still worth 20 questions combined. Final spaced pass of the four small subjects.
            </li>
            <li>
              <strong className="text-ink">Day 26 \u2014 last full grand test.</strong> After this, no
              new full tests: the marginal value of one more 300-question attempt is lower than the
              value of sleeping and consolidating.
            </li>
            <li>
              <strong className="text-ink">Days 27\u201328 \u2014 PYQ and error-log revision only.</strong>{' '}
              Re-read your accumulated leak lists and the explanations of every question you got wrong
              twice. Revise volatile facts (Community Medicine programmes and data, Pharmacology
              classifications, Microbiology tables) \u2014 the content most likely to fade.
            </li>
            <li>
              <strong className="text-ink">Day 29 \u2014 light day.</strong> One subject test at most,
              early in the day. Prepare documents and logistics for the exam day per the NBEMS
              admit-card instructions (these arrive with this cycle&apos;s information bulletin, not yet
              published \u2014 check natboard.edu.in once it is out). Stop studying by evening.
            </li>
            <li>
              <strong className="text-ink">Day 30 \u2014 exam day.</strong> Attempt strategy only:
              gears, checkpoints, no blanks, changes only with a stated reason. The revision is done;
              today is execution.
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">If your 30 days don&apos;t look like this</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <strong className="text-ink">Starting below ~120 in Grand Test 1:</strong> spend Week 1
              on the big four only, and shift the whole plan&apos;s test cadence to every fourth day
              \u2014 you need repair hours more than measurement.
            </li>
            <li>
              <strong className="text-ink">Repeat attempt:</strong> your leak list from previous
              attempts is your Week 1 \u2014 skip the diagnostic framing and go straight to the topics
              that have now leaked across multiple cycles; they are worth more than any new material.
              (You are the majority of this exam&apos;s hall: most FMGE candidates in recent sessions
              were sitting again, so plan like a repeater even in Week 1 if that is your reality.)
            </li>
            <li>
              <strong className="text-ink">Working or in internship:</strong> halve the daily load and
              double the cycle \u2014 one grand test a week, analysis the same evening, leak-list
              revision on the other days. The structure matters more than the volume.
            </li>
          </ul>
          <p className="mt-4 max-w-3xl leading-relaxed text-inksoft">
            Thirty days is enough time to move a score by the margin this exam is usually lost by \u2014
            provided every test you take hands you a list, and every list gets worked before the next
            test. That loop, run eight to ten times, is the whole plan.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold text-ink">Keep going</h2>
          <ul className="mt-3 max-w-3xl list-disc space-y-2 pl-5 leading-relaxed text-inksoft">
            <li>
              <Link href="/tests/" className="font-semibold text-med hover:underline">The 30 grand tests</Link>{' '}
              \u2014 the spine of this plan, one test per scheduled day.
            </li>
            <li>
              <Link href="/resources/fmge-subject-wise-weightage/" className="font-semibold text-med hover:underline">
                Subject-wise weightage
              </Link>{' '}
              \u2014 the map behind the plan&apos;s subject order.
            </li>
            <li>
              <Link href="/resources/how-to-attempt-grand-test/" className="font-semibold text-med hover:underline">
                Grand-test attempt strategy
              </Link>{' '}
              \u2014 gears, checkpoints and guessing rules for every test day.
            </li>
            <li>
              <Link href="/subjects/" className="font-semibold text-med hover:underline">Subject tests</Link>{' '}
              \u2014 verify each repair day, one subject at a time.
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
            <strong className="text-ink">Sources:</strong> NBEMS, FMGE Information Bulletin (300
            questions in two parts of 150; no negative marking; qualifying score 150/300); NBEMS
            notice dated 28 August 2026 (FMGE three times a year; sitting once set for 9 January 2027
            moved to late January/February 2027, date and bulletin not yet announced \u2014 status
            verified 17 November 2026 via natboard.edu.in notices as reported by Moksh Academy,
            Sarvgyan, AglaSem and Times of India); NBEMS FMGE December 2025 session results (42,872
            appeared, 10,262 passed, 23.95%), as reported by Careers360 and Medical Dialogues;
            MedSetu grand-test series data (subject distribution across 9,000 questions; 2,154
            image-based questions).
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
