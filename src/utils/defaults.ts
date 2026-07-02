import type { CifraDocument, Section, System, Measure, Chord, Project } from '@/types'
import { v4 as uuid } from 'uuid'

export function createDefaultDocument(id?: string): CifraDocument {
  return {
    id: id || 'default-doc',
    title: {
      text: 'Untitled',
      fontFamily: 'Georgia',
      fontSize: 28,
      bold: true,
      italic: false,
      alignment: 'center',
    },
    subtitle: {
      text: '',
      fontFamily: 'Georgia',
      fontSize: 16,
      bold: false,
      italic: false,
      alignment: 'center',
    },
    sections: [],
    notationStyle: 'symbols',
    pageTopMargin: 80,
    titleSectionGap: 32,
  }
}

export function createDefaultProject(): Project {
  const pageId = uuid()
  return {
    pages: [
      {
        id: pageId,
        name: 'Page 1',
        data: createDefaultDocument(pageId),
        createdAt: Date.now(),
      },
    ],
    activePageId: pageId,
    warningDismissed: false,
  }
}

export function createSection(label: string = 'Verse', order: number = 0): Section {
  return {
    id: uuid(),
    label,
    systemSpacing: 16,
    sectionSpacing: 24,
    systems: [],
    order,
    lyrics: [],
    doubleBarlineMeasureId: null,
  }
}

export function createSystem(): System {
  return {
    id: uuid(),
    measures: [createEmptyMeasure(), createEmptyMeasure(), createEmptyMeasure(), createEmptyMeasure()],
  }
}

export function createEmptyMeasure(): Measure {
  return {
    id: uuid(),
    chords: [],
    doubleBarline: false,
    repeatStart: false,
    repeatEnd: false,
    repeatCount: null,
    firstEnding: false,
    secondEnding: false,
    fermata: false,
    fine: false,
    dcAlFine: false,
    dsAlCoda: false,
    segno: false,
    coda: false,
    rehearsalMark: null,
  }
}

export function createChord(
  root: string = 'C',
  quality: Chord['quality'] = 'major',
  extensions: string[] = [],
  bass: string | null = null,
): Chord {
  return {
    id: uuid(),
    root,
    quality,
    extensions,
    bass,
  }
}
