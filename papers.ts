import metaJson from './papers-meta.json';
import type { PaperData, PaperMeta, TestDescriptor } from './types';

export const PAPERS_META = metaJson as unknown as PaperMeta[];

export function getMeta(paperId: string): PaperMeta | undefined {
  return PAPERS_META.find((p) => p.paperId === paperId);
}

export function paperDescriptor(meta: PaperMeta): TestDescriptor {
  return {
    id: meta.paperId,
    kind: 'paper',
    heading: `FMGE ${meta.label}`,
    subline: `${meta.session} · held ${meta.examDate}`,
    total: meta.total,
    part1Count: meta.part1,
    part2Count: meta.part2,
    singlePart: false,
    part1Sec: 150 * 60,
    part2Sec: 150 * 60,
    part1Min: 150,
    detailHref: `/paper/${meta.paperId}/`,
    detailLabel: 'Go to the paper page',
    analysisHref: `/paper/${meta.paperId}/analysis/`,
    backHref: '/papers/',
    backLabel: 'Paper library',
    addedCount: meta.addedCount,
    passPct: meta.passPct,
    singleSubject: null,
    testLabel: null,
  };
}

// Per-paper dynamic imports so each paper JSON ships as its own lazy chunk
// and is only downloaded when a student opens that paper's test.
export async function loadPaper(paperId: string): Promise<PaperData> {
  switch (paperId) {
    case 'dec-2020': return (await import('../data/papers/dec-2020.json')).default as unknown as PaperData;
    case 'jun-2021': return (await import('../data/papers/jun-2021.json')).default as unknown as PaperData;
    case 'dec-2021': return (await import('../data/papers/dec-2021.json')).default as unknown as PaperData;
    case 'jun-2022': return (await import('../data/papers/jun-2022.json')).default as unknown as PaperData;
    case 'jan-2023': return (await import('../data/papers/jan-2023.json')).default as unknown as PaperData;
    case 'jul-2023': return (await import('../data/papers/jul-2023.json')).default as unknown as PaperData;
    case 'jan-2024': return (await import('../data/papers/jan-2024.json')).default as unknown as PaperData;
    case 'jun-2024': return (await import('../data/papers/jun-2024.json')).default as unknown as PaperData;
    case 'jan-2025': return (await import('../data/papers/jan-2025.json')).default as unknown as PaperData;
    case 'jul-2025': return (await import('../data/papers/jul-2025.json')).default as unknown as PaperData;
    case 'jan-2026': return (await import('../data/papers/jan-2026.json')).default as unknown as PaperData;
    case 'jun-2026': return (await import('../data/papers/jun-2026.json')).default as unknown as PaperData;
    default: throw new Error(`Unknown paper: ${paperId}`);
  }
}
