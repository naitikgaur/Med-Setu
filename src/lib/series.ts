import metaJson from './series-meta.json';
import type { SeriesTestData, SeriesTestMeta, TestDescriptor } from './types';

export const SERIES_META = metaJson as unknown as SeriesTestMeta[];

export function getSeriesTest(testId: string): SeriesTestMeta | undefined {
  return SERIES_META.find((t) => t.testId === testId);
}

// Per-test dynamic imports so each grand test's questions ship as their
// own lazy chunk, downloaded only when a student opens that test.
export async function loadSeriesTest(testId: string): Promise<SeriesTestData> {
  switch (testId) {
    case 'series-test-1': return (await import('../data/tests/series-test-01.json')).default as unknown as SeriesTestData;
    case 'series-test-2': return (await import('../data/tests/series-test-02.json')).default as unknown as SeriesTestData;
    case 'series-test-3': return (await import('../data/tests/series-test-03.json')).default as unknown as SeriesTestData;
    case 'series-test-4': return (await import('../data/tests/series-test-04.json')).default as unknown as SeriesTestData;
    case 'series-test-5': return (await import('../data/tests/series-test-05.json')).default as unknown as SeriesTestData;
    case 'series-test-6': return (await import('../data/tests/series-test-06.json')).default as unknown as SeriesTestData;
    case 'series-test-7': return (await import('../data/tests/series-test-07.json')).default as unknown as SeriesTestData;
    case 'series-test-8': return (await import('../data/tests/series-test-08.json')).default as unknown as SeriesTestData;
    case 'series-test-9': return (await import('../data/tests/series-test-09.json')).default as unknown as SeriesTestData;
    case 'series-test-10': return (await import('../data/tests/series-test-10.json')).default as unknown as SeriesTestData;
    case 'series-test-11': return (await import('../data/tests/series-test-11.json')).default as unknown as SeriesTestData;
    case 'series-test-12': return (await import('../data/tests/series-test-12.json')).default as unknown as SeriesTestData;
    case 'series-test-13': return (await import('../data/tests/series-test-13.json')).default as unknown as SeriesTestData;
    case 'series-test-14': return (await import('../data/tests/series-test-14.json')).default as unknown as SeriesTestData;
    case 'series-test-15': return (await import('../data/tests/series-test-15.json')).default as unknown as SeriesTestData;
    case 'series-test-16': return (await import('../data/tests/series-test-16.json')).default as unknown as SeriesTestData;
    case 'series-test-17': return (await import('../data/tests/series-test-17.json')).default as unknown as SeriesTestData;
    case 'series-test-18': return (await import('../data/tests/series-test-18.json')).default as unknown as SeriesTestData;
    case 'series-test-19': return (await import('../data/tests/series-test-19.json')).default as unknown as SeriesTestData;
    case 'series-test-20': return (await import('../data/tests/series-test-20.json')).default as unknown as SeriesTestData;
    case 'series-test-21': return (await import('../data/tests/series-test-21.json')).default as unknown as SeriesTestData;
    case 'series-test-22': return (await import('../data/tests/series-test-22.json')).default as unknown as SeriesTestData;
    case 'series-test-23': return (await import('../data/tests/series-test-23.json')).default as unknown as SeriesTestData;
    case 'series-test-24': return (await import('../data/tests/series-test-24.json')).default as unknown as SeriesTestData;
    case 'series-test-25': return (await import('../data/tests/series-test-25.json')).default as unknown as SeriesTestData;
    case 'series-test-26': return (await import('../data/tests/series-test-26.json')).default as unknown as SeriesTestData;
    case 'series-test-27': return (await import('../data/tests/series-test-27.json')).default as unknown as SeriesTestData;
    case 'series-test-28': return (await import('../data/tests/series-test-28.json')).default as unknown as SeriesTestData;
    case 'series-test-29': return (await import('../data/tests/series-test-29.json')).default as unknown as SeriesTestData;
    case 'series-test-30': return (await import('../data/tests/series-test-30.json')).default as unknown as SeriesTestData;
    default: throw new Error(`Unknown series test: ${testId}`);
  }
}

export function seriesDescriptor(test: SeriesTestMeta): TestDescriptor {
  return {
    id: test.testId,
    kind: 'series',
    benchmarkNote:
      'the FMGE pass mark itself — this is a full-length grand test of 300 questions, so the line is the real one: 150 of 300 to pass.',
    heading: `MedSetu Test Series — ${test.title}`,
    subline: `Grand test · ${test.total} questions · two parts of 150 · all 19 subjects in the official NBEMS mix`,
    total: test.total,
    part1Count: 150,
    part2Count: 150,
    singlePart: false,
    part1Sec: 150 * 60,
    part2Sec: 150 * 60,
    part1Min: 150,
    detailHref: `/tests/${test.testId}/`,
    detailLabel: 'Go to the test page',
    analysisHref: `/tests/${test.testId}/analysis/`,
    backHref: '/tests/',
    backLabel: 'Test Series',
    addedCount: 0,
    passPct: null,
    singleSubject: null,
    testLabel: test.title,
  };
}
