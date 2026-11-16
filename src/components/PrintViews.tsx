import { LETTERS } from '../lib/analysis';
import { fmtDuration, fmtClock } from '../lib/store';
import type { Analysis } from '../lib/analysis';
import type { Attempt, TestData, TestDescriptor } from '../lib/types';
import { classifyPerQ, breakdownRows, topicRows, journeyChanges, CLASS_META, CLASS_ORDER } from '../lib/classes';
import { CREDIT_LINE, PHONES } from './SiteChrome';
import { explanationParagraphs } from './Explanation';

const MED_DEEP = '#004F58';
const ACCENT = '#B45309';
const OK = '#2E7D43';
const BAD = '#C0392B';

function PrintHeader({ desc, attempt, title }: { desc: TestDescriptor; attempt: Attempt; title: string }) {
  const when = attempt.finishedAt ? new Date(attempt.finishedAt) : new Date(attempt.startedAt);
  return (
    <div style={{ borderBottom: `2.5px solid ${MED_DEEP}`, paddingBottom: 8, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span data-brand-lockup style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: MED_DEEP }}>
            Med<span style={{ color: '#006D77' }}>Setu</span>
          </span>
          <span style={{ fontSize: 9.5, fontWeight: 500, letterSpacing: '0.08em', color: '#555', marginTop: 3 }}>
            by Naitik Library
          </span>
        </span>
        <span style={{ fontSize: 11, color: '#555' }}>{title}</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 12 }}>
        <strong>Candidate:</strong> {attempt.name} &nbsp;·&nbsp;{' '}
        <strong>{desc.kind === 'paper' ? 'Paper' : 'Test'}:</strong> {desc.heading} ({desc.subline})
        &nbsp;·&nbsp; <strong>Attempted on:</strong>{' '}
        {when.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  );
}

function PrintFooter() {
  return (
    <div style={{ borderTop: '1px solid #bbb', marginTop: 14, paddingTop: 6, fontSize: 9.5, color: '#555' }}>
      <p>{CREDIT_LINE}</p>
      <p>
        Contact: {PHONES} · Donate (UPI): naitikdev@fam · MedSetu is not affiliated with NBEMS or NMC.
        NBEMS never releases official FMGE papers — previous-year papers here are recall-based editions
        for practice only. Generated on the student&apos;s device; no data was uploaded or stored.
      </p>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: 'left', borderBottom: '1.5px solid #999', padding: '3px 5px', fontSize: 10.5 };
const td: React.CSSProperties = { borderBottom: '0.5px solid #ddd', padding: '3px 5px', fontSize: 10.5 };

function PSection({ n, title, blurb, children }: { n: number; title: string; blurb: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14 }}>
      <h2 style={{ borderTop: '1.5px solid #999', paddingTop: 7, marginBottom: 2 }}>
        {n}. {title}
      </h2>
      <p style={{ fontSize: 10.5, color: '#555', margin: '0 0 6px' }}>{blurb}</p>
      {children}
    </div>
  );
}

export function PrintReport({
  desc, paper, attempt, a,
}: { desc: TestDescriptor; paper: TestData; attempt: Attempt; a: Analysis }) {
  const v = a.verdict;
  const isBenchmark = desc.kind !== 'paper';
  const benchMark = Math.ceil(a.total / 2);
  const benchPassed = v.score >= benchMark;
  const breakdown = breakdownRows(a);
  const classified = classifyPerQ(a);
  const classCount = (cls: string) => classified.filter((c) => c.cls === cls).length;
  const topics = topicRows(paper, a);
  const journey = journeyChanges(attempt, paper);
  const markedQs = a.perQ.filter((r) => r.marked);
  const revisited = a.perQ.filter((r) => r.visits >= 3);

  const sections: { title: string; blurb: string; body: React.ReactNode }[] = [];

  // 1 · Overview
  sections.push({
    title: 'Overview',
    blurb: 'This section helps you understand your overall performance in the test attempt.',
    body: (
      <>
        <h1>
          Score: {v.score} / {v.total} ({v.percentage}%)
          {isBenchmark
            ? benchPassed
              ? ` — at/above the 50% mark (${benchMark} of ${v.total}; the FMGE pass proportion — a benchmark for this ${desc.kind === 'qbank' ? 'question-bank set' : 'test'}, not an official verdict)`
              : ` — below the 50% mark (${benchMark} of ${v.total}; the FMGE pass proportion — ${benchMark - v.score} more correct answers needed)`
            : v.full
              ? v.passed
                ? ' — PASS (real FMGE pass mark: 150/300)'
                : ` — NOT YET (real FMGE pass mark: 150/300; short by ${v.gapToPass})`
              : ` — Pass pace: the real FMGE pass mark is 150/300 = 50%; on this ${v.total}-question recall edition, 50% = ${v.passMark} marks.`}
        </h1>
        <p>
          Correct {a.correct} · Wrong {a.wrong} · Skipped {a.skipped} · Accuracy {a.accuracy}% of attempted ·
          Time used {fmtDuration(a.timeUsedSec)} of {fmtDuration(a.timeDetail.availableSec)} · Marking: +1 correct,
          0 wrong/skipped, no negative marking.
        </p>
        {desc.addedCount > 0 && (
          <p>
            On this paper&apos;s own {a.original.total} questions: {a.original.correct} correct. This mock was
            completed to 300 with {desc.addedCount} questions added from other years&apos; papers (marked
            “Added · from …” in the on-screen review); they are included in the score above.
          </p>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={th}>Measure</th><th style={th}>Value</th></tr>
          </thead>
          <tbody>
            <tr><td style={td}>Attempted</td><td style={td}>{a.attempted} of {a.total}</td></tr>
            <tr><td style={td}>Correct</td><td style={td}>{a.correct}</td></tr>
            <tr><td style={td}>Wrong</td><td style={td}>{a.wrong}</td></tr>
            <tr><td style={td}>Skipped</td><td style={td}>{a.skipped}</td></tr>
            <tr><td style={td}>Accuracy (of attempted)</td><td style={td}>{a.accuracy}%</td></tr>
            <tr><td style={td}>Average time per attempted question</td><td style={td}>{fmtClock(a.timeDetail.avgPerAttempted)}</td></tr>
            <tr><td style={td}>Average time on correct answers</td><td style={td}>{fmtClock(a.timeDetail.avgOnCorrect)}</td></tr>
            <tr><td style={td}>Average time on wrong answers</td><td style={td}>{fmtClock(a.timeDetail.avgOnWrong)}</td></tr>
            <tr><td style={td}>Rushed answers (under 10 s)</td><td style={td}>{a.rushed.count} attempted · {a.rushed.correct} correct</td></tr>
          </tbody>
        </table>
      </>
    ),
  });

  // 2 · Performance Analysis
  if (a.hasSubjects) {
    sections.push({
      title: 'Performance Analysis',
      blurb: 'This section helps you quickly analyse your performance in terms of attempts that were correct, incorrect, unattempted and questions that were not visited at all.',
      body: (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Subject</th><th style={th}>Score</th><th style={th}>Attempted · Correct</th>
                <th style={th}>Attempted · Wrong</th><th style={th}>Not Attempted</th><th style={th}>Not Visited</th>
              </tr>
            </thead>
            <tbody>
              {[breakdown.overall, ...breakdown.rows].map((r) => (
                <tr key={r.subject} style={r.subject === 'Overall' ? { fontWeight: 700 } : undefined}>
                  <td style={td}>{r.subject} ({r.total} Qs)</td>
                  <td style={td}>{r.score} / {r.total}</td>
                  <td style={td}>{r.correct}</td>
                  <td style={td}>{r.wrong}</td>
                  <td style={td}>{r.notAttempted}</td>
                  <td style={td}>{r.notVisited}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr>
                <th style={th}>Subject</th><th style={th}>Attempted</th>
                <th style={th}>Accuracy</th><th style={th}>Avg time / Q</th>
              </tr>
            </thead>
            <tbody>
              {a.subjects.map((s) => (
                <tr key={s.subject}>
                  <td style={td}>{s.subject}</td><td style={td}>{s.attempted} of {s.total}</td>
                  <td style={td}>{s.accuracy}%</td>
                  <td style={td}>{Math.round(s.avgTimeSec)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
          {desc.kind === 'paper' && (
            <p style={{ fontSize: 9.5, color: '#555' }}>
              Subject groups follow the source book&apos;s sections. Recall compilations group some questions
              differently from the official NBEMS blueprint, so treat subjects with very few questions as indicative.
            </p>
          )}
          {a.rollups && (
            <p>
              Pre &amp; Para-clinical: {a.rollups.prepara.correct} correct of {a.rollups.prepara.total} questions
              (blueprint 100/300) · Clinical: {a.rollups.clinical.correct} correct of {a.rollups.clinical.total}{' '}
              questions (blueprint 200/300).
            </p>
          )}
          <p>
            <strong>Confidence.</strong> Sure: {a.guessReport.sure.count} attempted, {a.guessReport.sure.correct}{' '}
            correct ({a.guessReport.sure.count ? `${a.guessReport.sure.accuracy}%` : '—'}) · Unsure:{' '}
            {a.guessReport.unsure.count} attempted, {a.guessReport.unsure.correct} correct (
            {a.guessReport.unsure.count ? `${a.guessReport.unsure.accuracy}%` : '—'}) · Guessed:{' '}
            {a.guessReport.guessed.count} attempted, {a.guessReport.guessed.correct} correct (
            {a.guessReport.guessed.count ? `${a.guessReport.guessed.accuracy}%` : '—'}).
          </p>
        </>
      ),
    });
  }

  // 3 · Score Potential
  sections.push({
    title: 'Score Potential',
    blurb: 'This section shows where your lost marks sit, and what your score becomes as you fix more of your mistakes — pure arithmetic on this attempt, no predictions.',
    body: (
      <>
        {desc.kind !== 'subject' && (
          <p>
            <strong>Biggest recovery pools (marks lost, by subject):</strong>{' '}
            {a.topPools.map((p) => `${p.subject}: ${p.lostMarks}`).join(' · ') || 'No wrong answers — a clean paper.'}
            {a.wrong > 0 && a.topPools.length > 0 && ` — together ${a.topPoolMarks} of your ${a.wrong} lost marks.`}
          </p>
        )}
        {a.wrong > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th style={th}>If you had fixed…</th><th style={th}>Your score would be</th></tr>
            </thead>
            <tbody>
              <tr><td style={td}>¼ of your {a.wrong} mistakes</td><td style={td}>{v.score + Math.ceil(a.wrong / 4)} / {v.total}</td></tr>
              <tr><td style={td}>½ of your mistakes</td><td style={td}>{v.score + Math.ceil(a.wrong / 2)} / {v.total}</td></tr>
              <tr><td style={td}>¾ of your mistakes</td><td style={td}>{v.score + Math.ceil((a.wrong * 3) / 4)} / {v.total}</td></tr>
              <tr><td style={td}>Every mistake</td><td style={td}>{v.score + a.wrong} / {v.total}</td></tr>
              <tr><td style={td}>Skipped questions (blind guesses, expected value at ¼)</td><td style={td}>≈ +{a.skipDividend} marks — FMGE has no negative marking</td></tr>
            </tbody>
          </table>
        ) : (
          <p>No wrong answers — there is nothing to recover.</p>
        )}
      </>
    ),
  });

  // 4 · Attempt Analysis
  sections.push({
    title: 'Attempt Analysis',
    blurb: `Every question classified by what you did with it, against the ${fmtClock(a.timeDetail.availableSec / a.total)} allotted per question. The on-screen analysis explains each label question by question.`,
    body: (
      <>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={th}>Class</th><th style={th}>Questions</th><th style={th}>What it means</th></tr>
          </thead>
          <tbody>
            {CLASS_ORDER.map((cls) => (
              <tr key={cls}>
                <td style={td}><strong>{CLASS_META[cls].label}</strong></td>
                <td style={td}>{classCount(cls)}</td>
                <td style={td}>{CLASS_META[cls].blurb}</td>
              </tr>
            ))}
            <tr>
              <td style={td}>Everything else</td>
              <td style={td}>{classified.filter((c) => c.cls === null).length}</td>
              <td style={td}>Answered at a normal pace, or skipped quickly — outside the five labels.</td>
            </tr>
          </tbody>
        </table>
        {CLASS_ORDER.filter((cls) => cls !== 'perfect').map((cls) => {
          const items = classified.filter((c) => c.cls === cls);
          if (!items.length) return null;
          return (
            <p key={cls} style={{ margin: '4px 0 0' }}>
              <strong>{CLASS_META[cls].label}:</strong> {items.map((c) => `Q${c.row.idx + 1}`).join(', ')}
            </p>
          );
        })}
      </>
    ),
  });

  // 5 · Time Analysis
  sections.push({
    title: 'Time Analysis',
    blurb: 'This section shows where your minutes went — and what they bought you.',
    body: (
      <>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>{isBenchmark ? 'Half' : 'Part'}</th><th style={th}>Attempted</th>
              <th style={th}>Correct</th><th style={th}>Wrong</th><th style={th}>Skipped</th>
              <th style={th}>Accuracy</th><th style={th}>Avg time / Q</th>
            </tr>
          </thead>
          <tbody>
            {a.segments.map((s, i) => (
              <tr key={s.key}>
                <td style={td}>{isBenchmark ? (i === 0 ? 'First half' : 'Second half') : (i === 0 ? 'Part I' : 'Part II')} (Q{s.from + 1}–{s.to})</td>
                <td style={td}>{s.attempted}</td><td style={td}>{s.correct}</td><td style={td}>{s.wrong}</td>
                <td style={td}>{s.skipped}</td><td style={td}>{s.accuracy}%</td><td style={td}>{fmtClock(s.avgTimeSec)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr><th style={th}>Time per question</th><th style={th}>Questions</th><th style={th}>Correct</th><th style={th}>Accuracy</th></tr>
          </thead>
          <tbody>
            {a.buckets.map((b) => (
              <tr key={b.key}>
                <td style={td}>{b.label}</td><td style={td}>{b.count}</td><td style={td}>{b.correct}</td><td style={td}>{b.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Answer changes: {a.changeReport.total} · gained a mark {a.changeReport.gained} · lost a mark{' '}
          {a.changeReport.lost} · wrong→wrong {a.changeReport.wrongToWrong} · net {a.changeReport.net >= 0 ? '+' : ''}
          {a.changeReport.net}. Guesses: {a.guessReport.guessed.count} marked as guessed, {a.guessReport.marksFromGuesses}{' '}
          of them correct. Rushed wrong (&lt;15s): {a.recklessness.rushedWrong} ·
          Slow wrong (≥60s, knowledge gaps): {a.recklessness.gapWrong}.
        </p>
      </>
    ),
  });

  // 6 · Topic Analysis (only where questions carry topics)
  if (topics.length > 0) {
    const shown = topics.filter((t) => t.total >= 2).slice(0, 25);
    sections.push({
      title: 'Topic Analysis',
      blurb: 'Your questions grouped by the topic they test, weakest first — the most direct revision list in this report.',
      body: (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Topic</th><th style={th}>Subject</th><th style={th}>Qs</th>
              <th style={th}>Correct</th><th style={th}>Wrong</th><th style={th}>Skipped</th><th style={th}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t) => (
              <tr key={`${t.subject}-${t.topic}`}>
                <td style={td}>{t.topic}</td><td style={td}>{t.subject}</td><td style={td}>{t.total}</td>
                <td style={td}>{t.correct}</td><td style={td}>{t.wrong}</td><td style={td}>{t.skipped}</td>
                <td style={td}>{t.correct + t.wrong ? `${t.accuracy}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    });
  }

  // 7 · Question Journey
  sections.push({
    title: 'Question Journey',
    blurb: 'How you travelled through the test — the answers you changed, the questions you kept returning to, and the ones you never opened.',
    body: (
      <>
        <p>
          <strong>Answer changes ({journey.length}):</strong>{' '}
          {journey.length
            ? journey.map((c) => `Q${c.q} ${c.from}→${c.to}${c.effect === 'gained' ? ' (+1)' : c.effect === 'lost' ? ' (−1)' : ''}`).join(' · ')
            : 'none — you never changed an answer.'}
        </p>
        <p>
          <strong>Marked for review ({markedQs.length}):</strong>{' '}
          {markedQs.length ? markedQs.map((r) => `Q${r.idx + 1}`).join(', ') : 'none.'}
        </p>
        <p>
          <strong>Visited 3+ times ({revisited.length}):</strong>{' '}
          {revisited.length ? revisited.map((r) => `Q${r.idx + 1} (${r.visits}×)`).join(', ') : 'none.'}
        </p>
        <p>
          <strong>Never visited:</strong> {breakdown.overall.notVisited} of {a.total} questions.
        </p>
      </>
    ),
  });

  // 8 · Qs by Qs Analysis (compact key; the full review is the Answer Key PDF)
  sections.push({
    title: 'Qs by Qs Analysis',
    blurb: 'Every question with its correct answer and your result. The full question-by-question review — with explanations and, in the Test Series, the learning from every question — is in the Answer Key & Solutions download.',
    body: (
      <>
        <div style={{ columns: 6, columnGap: 14, fontSize: 9.5 }}>
          {a.answerKey.map((k, ki) => (
            <div key={ki} style={{ breakInside: 'avoid', padding: '1px 0' }}>
              Q{ki + 1}: <strong>{k.correctLetter}</strong>
              {k.status === 'correct' ? ' ✓' : k.status === 'wrong' ? ` ✗ (you: ${k.yourLetter})` : ' – skipped'}
            </div>
          ))}
        </div>
      </>
    ),
  });

  return (
    <div className="print-area">
      <PrintHeader desc={desc} attempt={attempt} title={desc.kind === 'qbank' ? 'Question Bank — Session Report' : 'Full Mock-Test Report'} />
      <p style={{ fontSize: 12.5, margin: '2px 0 4px' }}>
        👋 Hey {attempt.name}, here is your {desc.heading} analysis.
      </p>
      <div style={{ border: '1px solid #bbb', padding: '7px 10px', marginBottom: 6 }}>
        <strong>Contents</strong>
        <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#333' }}>
          This section gives you a list of all the parts of your test analysis. Use it to quickly find
          the details you want to look at.
        </p>
        <ol style={{ margin: '5px 0 2px', paddingLeft: 18, fontSize: 11 }}>
          {sections.map((s) => (
            <li key={s.title}>{s.title}</li>
          ))}
        </ol>
      </div>
      {sections.map((s, i) => (
        <PSection key={s.title} n={i + 1} title={s.title} blurb={s.blurb}>
          {s.body}
        </PSection>
      ))}
      <PrintFooter />
    </div>
  );
}

/**
 * Book-style detailed answer key: a compact key grid up front, then every
 * question in order with its correct option highlighted, the student's own
 * answer marked, its figure (if any), the learning (Test Series) and the
 * FULL explanation — the same detailed answer the student sees on screen.
 */
export function PrintKey({
  desc, paper, attempt, a,
}: { desc: TestDescriptor; paper: TestData; attempt: Attempt; a: Analysis }) {
  const isBenchmark = desc.kind !== 'paper';
  return (
    <div className="print-area">
      <PrintHeader desc={desc} attempt={attempt} title="Answer Key & Solutions" />
      <h1>{desc.heading} — Answer Key &amp; Solutions</h1>
      <p>
        {paper.questions.length} questions with the correct option, your answer, and the detailed
        explanation for every question.{' '}
        {desc.kind === 'series' &&
          'Every question also carries its one-line learning — the key fact it was testing — taken from its own explanation. '}
        {isBenchmark
          ? desc.kind === 'qbank'
            ? 'Explanations are reproduced from the question-bank sources; the images they refer to are included where they could be recovered, and any that could not are noted at the question.'
            : 'Explanations are reproduced from the source material; the images they refer to are included where they could be recovered, and any that could not are noted at the question.'
          : 'For the book papers the explanations are reproduced from the source book\u2019s answer sections; for the 2026 papers the answers are verified from the recall compilations (which carry no explanations).'}
      </p>

      <h2>Key at a glance</h2>
      <div style={{ columns: 6, columnGap: 14, fontSize: 9.5 }}>
        {a.answerKey.map((k, ki) => (
          <div key={ki} style={{ breakInside: 'avoid', padding: '1px 0' }}>
            Q{ki + 1}: <strong>{k.correctLetter}</strong>
            {k.status === 'correct' ? ' ✓' : k.status === 'wrong' ? ` ✗ (you: ${k.yourLetter})` : ' – skipped'}
          </div>
        ))}
      </div>

      <h2>Detailed solutions</h2>
      {paper.questions.map((q, i) => {
        const row = a.perQ[i];
        const hasExplanation = !!(q.explanation && q.explanation.trim());
        return (
          <div key={i} style={{ borderTop: '1px solid #ccc', marginTop: 10, paddingTop: 8 }}>
            <p style={{ fontSize: 11.5, margin: 0 }}>
              <strong>Q{i + 1}.</strong>
              {q.subject && <span style={{ color: '#555' }}> {q.subject} ·</span>}{' '}
              <span style={{ fontWeight: 700, color: row.status === 'correct' ? OK : row.status === 'wrong' ? BAD : '#555' }}>
                {row.status === 'correct' ? '✓ Correct' : row.status === 'wrong' ? '✗ Wrong' : 'Skipped'}
              </span>
              {q.added && <span style={{ color: ACCENT }}> · Added · from {q.fromLabel}</span>}
              {row.marked && <span style={{ color: '#555' }}> · marked for review</span>}
            </p>
            <p style={{ whiteSpace: 'pre-wrap', margin: '4px 0 0' }}>{q.text}</p>
            {q.img && (
              <p style={{ fontSize: 10, color: ACCENT, margin: '3px 0 0' }}>
                {isBenchmark
                  ? desc.kind === 'qbank'
                    ? 'This question refers to an image in the source material; the image is not included in this edition.'
                    : 'This question refers to an image from the source test; the image could not be recovered for this edition.'
                  : 'This question refers to an image from the original paper; the image is not available in this recall edition.'}
              </p>
            )}
            {q.images && q.images.map((src, k) => (
              <img key={k} src={src} alt="" style={{ display: 'block', maxHeight: 170, maxWidth: '100%', marginTop: 4 }} />
            ))}
            <div style={{ marginTop: 5 }}>
              {(q.options.length ? q.options : q.optionImages ?? []).map((opt, oi) => {
                const isCorrect = oi === q.correct;
                const isYours = row.yours === oi;
                return (
                  <p
                    key={oi}
                    style={{
                      margin: '2px 0',
                      padding: '2.5px 6px',
                      background: isCorrect ? '#E7F2E9' : isYours ? '#FBEAE8' : 'transparent',
                      borderLeft: isCorrect ? `3px solid ${OK}` : isYours ? `3px solid ${BAD}` : '3px solid transparent',
                    }}
                  >
                    <strong>{LETTERS[oi]}.</strong>{' '}
                    {q.optionImages ? (
                      <img src={q.optionImages[oi]} alt={`Option ${LETTERS[oi]}`} style={{ height: 54, verticalAlign: 'middle' }} />
                    ) : (
                      opt
                    )}
                    {isCorrect && <strong style={{ color: OK }}> ✓ correct answer</strong>}
                    {isYours && !isCorrect && <strong style={{ color: BAD }}> ✗ your answer</strong>}
                    {isYours && isCorrect && <span style={{ color: OK }}> (your answer)</span>}
                  </p>
                );
              })}
            </div>
            {row.yours === null && (
              <p style={{ fontSize: 10.5, color: '#555', margin: '3px 0 0' }}>
                You skipped this question. Correct answer: {LETTERS[q.correct]}.
              </p>
            )}
            {q.learning && (
              <p style={{ marginTop: 5, background: '#EFF6F7', borderLeft: `3px solid ${MED_DEEP}`, padding: '4px 7px' }}>
                <strong style={{ color: MED_DEEP }}>Learning. </strong>
                {q.learning}
              </p>
            )}
            <div style={{ marginTop: 5 }}>
              <strong style={{ color: MED_DEEP }}>Explanation. </strong>
              {hasExplanation ? (
                q.explBlocks ? (
                  q.explBlocks.map((b, bi) => {
                    if (b.t === 'text')
                      return explanationParagraphs(q.explanation).map((p, pi) => (
                        <span key={`${bi}-${pi}`} style={{ display: 'block', marginTop: pi > 0 ? 4 : 0, whiteSpace: 'pre-wrap' }}>
                          {p}
                        </span>
                      ));
                    if (b.t === 'img')
                      return (
                        <img
                          key={bi}
                          src={b.src}
                          alt=""
                          style={{ display: 'block', maxHeight: 240, maxWidth: '100%', marginTop: 6 }}
                        />
                      );
                    return (
                      <span key={bi} style={{ display: 'block', fontSize: 10, color: '#555', marginTop: 3 }}>
                        The source explanation also includes {b.count === 1 ? 'an image' : `${b.count} images`} that
                        could not be recovered for this edition.
                      </span>
                    );
                  })
                ) : (
                  explanationParagraphs(q.explanation).map((p, pi) => (
                    <span key={pi} style={{ display: 'block', marginTop: pi > 0 ? 4 : 0, whiteSpace: 'pre-wrap' }}>
                      {p}
                    </span>
                  ))
                )
              ) : (
                <span style={{ color: '#555' }}>
                  {isBenchmark
                    ? 'A detailed explanation is not available in the source for this question.'
                    : 'A detailed explanation is not available in the 2026 recall source for this question; the correct answer above is verified from the recall compilation.'}
                </span>
              )}
              {q.explImg && !q.explBlocks && (
                <span style={{ display: 'block', fontSize: 10, color: '#555', marginTop: 3 }}>
                  The source explanation for this question also includes image(s) that could
                  not be recovered for this edition.
                </span>
              )}
            </div>
          </div>
        );
      })}
      <PrintFooter />
    </div>
  );
}
