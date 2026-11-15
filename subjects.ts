import metaJson from './subjects-meta.json';
import type { SubjectMeta, SubjectTestData, SubjectTestEntry, TestDescriptor } from './types';

export const SUBJECTS_META = metaJson as unknown as SubjectMeta[];

export function getSubject(slug: string): SubjectMeta | undefined {
  return SUBJECTS_META.find((s) => s.slug === slug);
}

export function getSubjectTest(slug: string, testNo: number): SubjectTestEntry | undefined {
  return getSubject(slug)?.tests.find((t) => t.testNo === testNo);
}

// Per-test dynamic imports so each subject test's questions ship as their
// own lazy chunk, downloaded only when a student opens that test.
export async function loadSubjectTest(testId: string): Promise<SubjectTestData> {
  switch (testId) {
    case 'anatomy-test-1': return (await import('../data/subjects/anatomy-test-1.json')).default as unknown as SubjectTestData;
    case 'anatomy-test-2': return (await import('../data/subjects/anatomy-test-2.json')).default as unknown as SubjectTestData;
    case 'physiology-test-1': return (await import('../data/subjects/physiology-test-1.json')).default as unknown as SubjectTestData;
    case 'physiology-test-2': return (await import('../data/subjects/physiology-test-2.json')).default as unknown as SubjectTestData;
    case 'biochemistry-test-1': return (await import('../data/subjects/biochemistry-test-1.json')).default as unknown as SubjectTestData;
    case 'biochemistry-test-2': return (await import('../data/subjects/biochemistry-test-2.json')).default as unknown as SubjectTestData;
    case 'pathology-test-1': return (await import('../data/subjects/pathology-test-1.json')).default as unknown as SubjectTestData;
    case 'pathology-test-2': return (await import('../data/subjects/pathology-test-2.json')).default as unknown as SubjectTestData;
    case 'microbiology-test-1': return (await import('../data/subjects/microbiology-test-1.json')).default as unknown as SubjectTestData;
    case 'microbiology-test-2': return (await import('../data/subjects/microbiology-test-2.json')).default as unknown as SubjectTestData;
    case 'pharmacology-test-1': return (await import('../data/subjects/pharmacology-test-1.json')).default as unknown as SubjectTestData;
    case 'pharmacology-test-2': return (await import('../data/subjects/pharmacology-test-2.json')).default as unknown as SubjectTestData;
    case 'forensic-medicine-test-1': return (await import('../data/subjects/forensic-medicine-test-1.json')).default as unknown as SubjectTestData;
    case 'forensic-medicine-test-2': return (await import('../data/subjects/forensic-medicine-test-2.json')).default as unknown as SubjectTestData;
    case 'medicine-test-1': return (await import('../data/subjects/medicine-test-1.json')).default as unknown as SubjectTestData;
    case 'medicine-test-2': return (await import('../data/subjects/medicine-test-2.json')).default as unknown as SubjectTestData;
    case 'surgery-test-1': return (await import('../data/subjects/surgery-test-1.json')).default as unknown as SubjectTestData;
    case 'surgery-test-2': return (await import('../data/subjects/surgery-test-2.json')).default as unknown as SubjectTestData;
    case 'obstetrics-gynaecology-test-1': return (await import('../data/subjects/obstetrics-gynaecology-test-1.json')).default as unknown as SubjectTestData;
    case 'obstetrics-gynaecology-test-2': return (await import('../data/subjects/obstetrics-gynaecology-test-2.json')).default as unknown as SubjectTestData;
    case 'community-medicine-test-1': return (await import('../data/subjects/community-medicine-test-1.json')).default as unknown as SubjectTestData;
    case 'community-medicine-test-2': return (await import('../data/subjects/community-medicine-test-2.json')).default as unknown as SubjectTestData;
    case 'paediatrics-test-1': return (await import('../data/subjects/paediatrics-test-1.json')).default as unknown as SubjectTestData;
    case 'paediatrics-test-2': return (await import('../data/subjects/paediatrics-test-2.json')).default as unknown as SubjectTestData;
    case 'ophthalmology-test-1': return (await import('../data/subjects/ophthalmology-test-1.json')).default as unknown as SubjectTestData;
    case 'ophthalmology-test-2': return (await import('../data/subjects/ophthalmology-test-2.json')).default as unknown as SubjectTestData;
    case 'ent-test-1': return (await import('../data/subjects/ent-test-1.json')).default as unknown as SubjectTestData;
    case 'ent-test-2': return (await import('../data/subjects/ent-test-2.json')).default as unknown as SubjectTestData;
    case 'orthopaedics-test-1': return (await import('../data/subjects/orthopaedics-test-1.json')).default as unknown as SubjectTestData;
    case 'minor-subjects-test-2': return (await import('../data/subjects/minor-subjects-test-2.json')).default as unknown as SubjectTestData;
    default: throw new Error(`Unknown subject test: ${testId}`);
  }
}

export function subjectDescriptor(subject: SubjectMeta, test: SubjectTestEntry): TestDescriptor {
  const testLabel = `Test ${test.testNo}`;
  return {
    id: test.testId,
    kind: 'subject',
    heading: `${subject.name} — ${testLabel}`,
    subline: `Subject-wise test · ${test.total} questions · ${test.durationMin} minutes`,
    total: test.total,
    part1Count: test.total,
    part2Count: 0,
    singlePart: true,
    part1Sec: test.durationMin * 60,
    part2Sec: 0,
    part1Min: test.durationMin,
    detailHref: `/subject/${subject.slug}/`,
    detailLabel: 'Go to the subject page',
    analysisHref: `/subject/${subject.slug}/test-${test.testNo}/analysis/`,
    backHref: '/subjects/',
    backLabel: 'Subject-wise tests',
    addedCount: 0,
    passPct: null,
    singleSubject: subject.name,
    testLabel,
  };
}
