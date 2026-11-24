// Short Notes + Flashcards data layer (V6). One JSON file per subject in
// src/data/notes/ and src/data/flashcards/, written from FMGE previous-year
// evidence and standard textbooks, parsed at build time — fully static,
// no backend, exactly like the rest of MedSetu.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface NoteTopic {
  title: string;
  askedAs?: string;
  points: string[];
  table?: { head: string[]; rows: string[][] };
  oneLiner?: string;
  trap?: string;
}

export interface SubjectNotes {
  subject: string;
  slug: string;
  tagline: string;
  intro: string;
  topics: NoteTopic[];
  mindmap: { center: string; branches: { label: string; leaves: string[] }[] };
  goldenPoints: string[];
}

export interface FlashCard {
  front: string;
  back: string;
  topic: string;
}

export interface SubjectCards {
  subject: string;
  slug: string;
  cards: FlashCard[];
}

export interface ReviseSubject {
  slug: string;
  name: string;
  weight: number; // questions per 300 in the NBEMS blueprint
  blurb: string;
}

export const REVISE_SUBJECTS: ReviseSubject[] = [
  { slug: 'medicine', name: 'Medicine', weight: 33, blurb: 'Cardiology, neurology, respiratory and the criteria-and-scores subject — the biggest single block of the paper.' },
  { slug: 'surgery', name: 'Surgery', weight: 32, blurb: 'GI, hepatobiliary, breast, trauma and the classic signs — heavily clinical, heavily repeated.' },
  { slug: 'obstetrics-gynaecology', name: 'Obstetrics & Gynaecology', weight: 30, blurb: 'Labour, its complications, contraception and gynae oncology — protocols and thresholds rule here.' },
  { slug: 'community-medicine', name: 'Community Medicine', weight: 30, blurb: 'Epidemiology, programmes and exact definitions — the most fact-dense 30 marks in the paper.' },
  { slug: 'anatomy', name: 'Anatomy', weight: 17, blurb: 'Nerve injuries, embryology and neuroanatomy — root values and derivatives decide these marks.' },
  { slug: 'physiology', name: 'Physiology', weight: 17, blurb: 'Mechanisms, reflexes and normal values — concept questions that reward understanding over recall.' },
  { slug: 'biochemistry', name: 'Biochemistry', weight: 17, blurb: 'Pathways, rate-limiting enzymes and deficiency diseases — a pattern subject, learned by maps.' },
  { slug: 'paediatrics', name: 'Paediatrics', weight: 15, blurb: 'Milestones, immunisation, neonatology and nutrition — small facts, asked every single session.' },
  { slug: 'ophthalmology', name: 'Ophthalmology', weight: 15, blurb: 'Glaucoma, cataract, retina and neuro-ophthalmology — image-led and very revisable.' },
  { slug: 'ent', name: 'ENT', weight: 15, blurb: 'Ear pathology, the larynx and the sinuses — tests, tuning forks and classic presentations.' },
  { slug: 'pathology', name: 'Pathology', weight: 13, blurb: 'Haematology first, then general pathology and tumour markers — stains, genes and triads.' },
  { slug: 'microbiology', name: 'Microbiology', weight: 13, blurb: 'Organism → disease → test → treatment chains; media, stains and virulence factors.' },
  { slug: 'pharmacology', name: 'Pharmacology', weight: 13, blurb: 'Drug of choice, mechanisms, antidotes and adverse effects — pure recall, perfectly suited to flashcards.' },
  { slug: 'radiology', name: 'Radiology', weight: 10, blurb: 'Signs on X-ray, CT and MRI — the image questions, named and patterned.' },
  { slug: 'forensic-medicine', name: 'Forensic Medicine', weight: 10, blurb: 'Injuries, asphyxia, toxicology and medical law — definitions and IPC/BNS-style facts.' },
  { slug: 'psychiatry', name: 'Psychiatry', weight: 5, blurb: 'Mood and psychotic disorders, their drugs and their criteria — small subject, steady marks.' },
  { slug: 'dermatology', name: 'Dermatology', weight: 5, blurb: 'Morphology words, infections including leprosy, and papulosquamous disorders.' },
  { slug: 'anaesthesia', name: 'Anaesthesia', weight: 5, blurb: 'Airway, anaesthetic pharmacology, BLS/ACLS and pre-op assessment — compact and high-yield.' },
  { slug: 'orthopaedics', name: 'Orthopaedics', weight: 5, blurb: 'Fractures and their named complications, bone tumours and metabolic bone disease.' },
];

const NOTES_DIR = join(process.cwd(), 'src', 'data', 'notes');
const CARDS_DIR = join(process.cwd(), 'src', 'data', 'flashcards');

export function getNotes(slug: string): SubjectNotes | null {
  const p = join(NOTES_DIR, `${slug}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8')) as SubjectNotes;
}

export function getCards(slug: string): SubjectCards | null {
  const p = join(CARDS_DIR, `${slug}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8')) as SubjectCards;
}

export function notesStats(slug: string): { topics: number; points: number } {
  const n = getNotes(slug);
  if (!n) return { topics: 0, points: 0 };
  return {
    topics: n.topics.length,
    points: n.topics.reduce((a, t) => a + t.points.length, 0) + n.goldenPoints.length,
  };
}

export function cardCount(slug: string): number {
  const c = getCards(slug);
  return c ? c.cards.length : 0;
}

export function totalCards(): number {
  return REVISE_SUBJECTS.reduce((a, s) => a + cardCount(s.slug), 0);
}

export function totalNotePoints(): number {
  return REVISE_SUBJECTS.reduce((a, s) => a + notesStats(s.slug).points, 0);
}
